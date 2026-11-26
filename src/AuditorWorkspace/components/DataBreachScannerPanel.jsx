import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    FileSearch,
    LoaderCircle,
    Play,
    RefreshCw,
    X,
} from "lucide-react";

const STORAGE_PREFIX = "dpacompass:data-breach-scan:";

const readSavedScan = (publicAuditId) => {
    if (!publicAuditId || typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(
            `${STORAGE_PREFIX}${publicAuditId}`
        );
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const normalizeStatus = (value) => {
    const status = String(value || "").trim().toLowerCase().replaceAll("-", "_");

    if (["completed", "complete", "success", "successful", "done"].includes(status)) {
        return "completed";
    }
    if (["failed", "failure", "error"].includes(status)) {
        return "failed";
    }
    if (["pending", "queued", "accepted", "submitted"].includes(status)) {
        return "pending";
    }
    if (["running", "in_progress", "processing", "started", "scanning"].includes(status)) {
        return "running";
    }
    return status || "running";
};

const getStatusLabel = (status) => {
    if (status === "pending") return "Queued";
    if (status === "running") return "Scanning";
    if (status === "completed") return "Completed";
    if (status === "failed") return "Failed";
    return "Not started";
};

const getLiveDetail = (record) => {
    if (!record || typeof record !== "object") return "";

    const detail =
        record.current_step_title ||
        record.current_step ||
        record.step_title ||
        record.progress_message ||
        record.message ||
        record.stage ||
        record.task_name ||
        "";

    if (typeof detail === "string") return detail;
    if (detail && typeof detail === "object") {
        return detail.title || detail.name || detail.message || "";
    }
    return "";
};

export default function DataBreachScannerPanel({
    publicAuditId,
    applicationUrl = "",
    startScan,
    getScanStatus,
    onClose,
}) {
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const pollingRef = useRef(false);
    const scanStateRef = useRef(null);

    const [scanState, setScanState] = useState(() => {
        const saved = readSavedScan(publicAuditId);
        return saved || {
            status: "idle",
            startedAt: null,
            completedAt: null,
            response: null,
            error: "",
        };
    });

    scanStateRef.current = scanState;

    const persistState = useCallback((nextState) => {
        scanStateRef.current = nextState;
        setScanState(nextState);

        try {
            window.localStorage.setItem(
                `${STORAGE_PREFIX}${publicAuditId}`,
                JSON.stringify(nextState)
            );
        } catch (storageError) {
            console.warn("Unable to persist Data Breach Scanner state:", storageError);
        }
    }, [publicAuditId]);

    // Restore the saved scan state when the panel mounts or the audit changes.
    useEffect(() => {
        const saved = readSavedScan(publicAuditId);
        setScanState(saved || {
            status: "idle",
            startedAt: null,
            completedAt: null,
            response: null,
            error: "",
        });
    }, [publicAuditId]);

    // Poll continuously while pending/running. Polls are sequential to prevent
    // overlapping status requests and continue after the panel is closed/reopened.
    useEffect(() => {
        if (!["pending", "running"].includes(scanState.status)) return undefined;

        let cancelled = false;

        const poll = async () => {
            if (cancelled || pollingRef.current) return;

            pollingRef.current = true;
            try {
                const response = await getScanStatus({ publicAuditId });
                if (cancelled) return;

                const nextStatus = normalizeStatus(
                    response?.status ||
                    response?.scan_status ||
                    response?.audit_status
                );

                const currentState = scanStateRef.current || scanState;
                const nextState = {
                    ...currentState,
                    status: nextStatus,
                    response,
                    error: "",
                    lastCheckedAt: new Date().toISOString(),
                    completedAt:
                        nextStatus === "completed"
                            ? currentState.completedAt || new Date().toISOString()
                            : currentState.completedAt,
                };

                persistState(nextState);
            } catch (pollError) {
                if (!cancelled) {
                    const currentState = scanStateRef.current || scanState;
                    const nextState = {
                        ...currentState,
                        error: pollError?.message || "Could not refresh scan status. Retrying...",
                        lastCheckedAt: new Date().toISOString(),
                    };
                    persistState(nextState);
                }
            } finally {
                pollingRef.current = false;
                if (!cancelled) {
                    timerRef.current = window.setTimeout(poll, 2500);
                }
            }
        };

        poll();

        return () => {
            cancelled = true;
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            pollingRef.current = false;
        };
        // scanState.response updates each poll; status controls lifecycle.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicAuditId, scanState.status, getScanStatus, persistState]);

    const handleStartScan = async () => {
        if (!publicAuditId || !applicationUrl || !startScan) return;
        if (["pending", "running"].includes(scanState.status)) return;

        const startedAt = new Date().toISOString();
        const initialState = {
            status: "pending",
            startedAt,
            completedAt: null,
            response: null,
            error: "",
        };
        persistState(initialState);

        try {
            const response = await startScan({
                publicAuditId,
                applicationUrl,
            });

            if (
                response?.status === "error" ||
                response?.success === false
            ) {
                throw new Error(
                    response?.message || response?.detail || "Unable to start scanner."
                );
            }

            const responseStatus = normalizeStatus(
                response?.status ||
                response?.scan_status ||
                response?.audit_status ||
                "running"
            );

            persistState({
                ...initialState,
                status: ["completed", "failed"].includes(responseStatus)
                    ? responseStatus
                    : responseStatus === "pending"
                        ? "pending"
                        : "running",
                response,
                completedAt:
                    responseStatus === "completed"
                        ? new Date().toISOString()
                        : null,
            });
        } catch (startError) {
            persistState({
                ...initialState,
                status: "failed",
                error: startError?.message || "Failed to start scanner.",
            });
        }
    };

    const handleViewResults = () => {
        if (scanState.status !== "completed") return;

        // Auditor Data Breach report is a separate route from the auditee
        // consolidated Self-Check report. App.jsx already protects this route
        // for auditor role (role 2) and renders DataBreachScannerResult.
        navigate(
            `/user/data-breach-scan/${encodeURIComponent(publicAuditId)}/result`
        );
    };

    const liveDetail = getLiveDetail(scanState.response);
    const isActive = ["pending", "running"].includes(scanState.status);
    const hasRun = scanState.status !== "idle";

    return (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className={`rounded-lg p-2.5 ${
                        scanState.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : scanState.status === "failed"
                                ? "bg-red-50 text-red-700"
                                : "bg-rose-50 text-rose-600"
                    }`}>
                        {scanState.status === "completed"
                            ? <CheckCircle2 size={20} />
                            : scanState.status === "failed"
                                ? <AlertCircle size={20} />
                                : <Clock3 size={20} />}
                    </div>
                    <div className="min-w-0">
                        <h5 className="text-sm font-semibold text-slate-900">
                            PII-in-Transit / Data Breach Scanner
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Scan the application for potential data exposure and security issues.
                        </p>
                    </div>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close scanner panel"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-600">
                <p className="font-semibold uppercase tracking-wide text-slate-500">
                    Application URL
                </p>
                <p className="mt-1 break-all text-sm text-slate-800">
                    {applicationUrl || "Application URL unavailable"}
                </p>
                <p className="mt-3 font-semibold uppercase tracking-wide text-slate-500">
                    Audit ID
                </p>
                <p className="mt-1 break-all text-sm text-slate-800">
                    {publicAuditId || "Public Audit ID unavailable"}
                </p>
            </div>

            {hasRun && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Scan status
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            scanState.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : scanState.status === "failed"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                        }`}>
                            {isActive && <LoaderCircle size={13} className="animate-spin" />}
                            {getStatusLabel(scanState.status)}
                        </span>
                    </div>

                    {isActive && (
                        <p className="mt-2 text-sm text-slate-700">
                            {liveDetail || (scanState.status === "pending"
                                ? "Scan is queued and waiting for a worker..."
                                : "Scanner is processing the application...")}
                        </p>
                    )}

                    {scanState.error && (
                        <p className="mt-2 text-xs text-amber-700">
                            {scanState.error}
                        </p>
                    )}

                    {scanState.startedAt && (
                        <p className="mt-2 text-xs text-slate-400">
                            Started: {new Date(scanState.startedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
                {scanState.status === "completed" ? (
                    <button
                        type="button"
                        onClick={handleViewResults}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        <FileSearch size={16} />
                        View Results
                    </button>
                ) : scanState.status === "failed" ? (
                    <button
                        type="button"
                        onClick={handleStartScan}
                        disabled={!applicationUrl || !publicAuditId}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <RefreshCw size={16} />
                        Retry Scanner
                    </button>
                ) : isActive ? (
                    <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500"
                    >
                        <LoaderCircle size={16} className="animate-spin" />
                        {scanState.status === "pending" ? "Queued..." : "Scanning..."}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleStartScan}
                        disabled={!applicationUrl || !publicAuditId}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <Play size={16} />
                        Start Scanner
                    </button>
                )}
            </div>
        </section>
    );
}
