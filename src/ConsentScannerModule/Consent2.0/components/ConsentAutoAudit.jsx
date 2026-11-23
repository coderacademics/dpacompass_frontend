import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    ShieldCheck,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import AuditProgress from "../components/AuditProgress";
import AuditSummary from "../components/AuditSummary";
import AuditStepList from "../components/AuditStepList";

import {
    startAudit,
    getConsentAuditResult,
    getConsentChecklistAssessment,
} from "../services/auditApi";

const DEFAULT_MAX_PAGES = 20;
const MIN_MAX_PAGES = 1;
const MAX_MAX_PAGES = 1000;
const POLLING_INTERVAL = 4000;

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();

const normalizeSteps = (data) => {
    const source = data?.steps ?? data?.consent_management?.steps;

    if (Array.isArray(source)) {
        return source.map((step) => ({
            ...step,
            step_id: step?.step_id,
            status: normalizeStatus(step?.status || step?.execution_status),
            execution_status: normalizeStatus(step?.execution_status || step?.status),
        }));
    }

    if (source && typeof source === "object") {
        return Object.entries(source).map(([stepId, status]) => ({
            step_id: stepId,
            status: normalizeStatus(status),
            execution_status: normalizeStatus(status),
        }));
    }

    return [];
};

const getAuditStatus = (data) =>
    normalizeStatus(data?.status || data?.audit?.status || data?.audit_status);

const isScanFullyCompleted = (data) => {
    const auditStatus = getAuditStatus(data);
    const steps = normalizeSteps(data);

    return (
        auditStatus === "COMPLETED" &&
        steps.length > 0 &&
        steps.every((step) => step.status === "COMPLETED")
    );
};

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const formatStatus = (value) =>
    String(value || "UNKNOWN")
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

const StatusBadge = ({ status }) => {
    const normalized = normalizeStatus(status);
    const styles = {
        COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
        SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-700",
        RUNNING: "border-blue-200 bg-blue-50 text-blue-700",
        QUEUED: "border-amber-200 bg-amber-50 text-amber-700",
        FAILED: "border-red-200 bg-red-50 text-red-700",
        ERROR: "border-red-200 bg-red-50 text-red-700",
        NOT_EVALUATED: "border-slate-200 bg-slate-100 text-slate-600",
        PARTIALLY_COMPLIANT: "border-amber-200 bg-amber-50 text-amber-700",
        NON_COMPLIANT: "border-red-200 bg-red-50 text-red-700",
        COMPLIANT: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[normalized] || "border-slate-300 bg-slate-100 text-slate-700"}`}>
            {formatStatus(status)}
        </span>
    );
};

const PageHeader = ({ title, description }) => (
    <div className="mb-8">
        <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                <ShieldCheck className="h-5 w-5 text-[#075EB5]" />
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#075EB5]">
                    Consent Audit
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#14213D]">
                    {title}
                </h1>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    </div>
);

const AuditMetadata = ({ configuration, metadata }) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Target Website
            </p>
            <p className="mt-1.5 break-all text-sm font-medium text-slate-700">
                {configuration?.url || metadata?.url || "—"}
            </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Authentication
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-700">
                {configuration?.username ? "Credentials available" : "Not configured"}
            </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Maximum Pages
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-700">
                {metadata?.max_pages ?? configuration?.max_pages ?? "—"}
            </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Completed At
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-700">
                {formatDate(metadata?.completed_at)}
            </p>
        </div>
    </div>
);

const ChecklistAssessment = ({ data, loading, error, onRetry }) => {
    const results = Array.isArray(data?.results) ? data.results : [];

    const counts = useMemo(() => {
        return results.reduce((accumulator, item) => {
            const status = normalizeStatus(item?.status) || "UNKNOWN";
            accumulator[status] = (accumulator[status] || 0) + 1;
            return accumulator;
        }, {});
    }, [results]);

    return (
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-5">
                <h2 className="text-xl font-semibold text-[#14213D]">
                    Checklist Assessment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Assessment of the audit checklist based on the completed scan.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 p-6 text-sm text-slate-500">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Generating checklist assessment...
                </div>
            ) : error ? (
                <div className="flex flex-col items-start gap-3 p-6">
                    <div className="flex items-start gap-2 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-medium">Checklist assessment could not be loaded.</p>
                            <p className="mt-1 text-red-600">{error}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        Retry Assessment
                    </button>
                </div>
            ) : !data ? (
                <p className="p-6 text-sm text-slate-500">
                    Checklist assessment is not available.
                </p>
            ) : (
                <div className="p-5">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-700">
                                Total checklist items:{" "}
                                <span className="font-semibold text-slate-900">
                                    {data.total_checklists ?? results.length}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Assessment ID: {data.public_audit_id || "—"}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(counts).map(([status, count]) => (
                                <span
                                    key={status}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                                >
                                    <StatusBadge status={status} />
                                    <span>{count}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {results.length === 0 ? (
                        <p className="rounded-lg border border-slate-200 p-5 text-sm text-slate-500">
                            The assessment API returned no checklist items.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {results.map((item, index) => (
                                <article
                                    key={`${item.question || "checklist"}-${index}`}
                                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                        <div className="flex min-w-0 gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm leading-6 text-slate-700">
                                                {item.question || "Checklist question"}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            <StatusBadge status={item.status} />
                                        </div>
                                    </div>
                                    {item.comment && (
                                        <div className="ml-10 mt-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Assessment Comment
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                {item.comment}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

const ConsentAutoAudit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { publicAuditId } = useParams();

    const configuration = location.state?.configuration || null;
    const effectivePublicAuditId =
        publicAuditId || configuration?.public_audit_id || null;

    const [auditState, setAuditState] = useState("checking");
    const [auditId, setAuditId] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [auditProgress, setAuditProgress] = useState(null);
    const [auditResult, setAuditResult] = useState(null);
    const [error, setError] = useState("");

    const [maxPages, setMaxPages] = useState(
        Number(configuration?.max_pages) || DEFAULT_MAX_PAGES
    );
    const [maxPagesError, setMaxPagesError] = useState("");

    const [checklistAssessment, setChecklistAssessment] = useState(null);
    const [assessmentLoading, setAssessmentLoading] = useState(false);
    const [assessmentError, setAssessmentError] = useState("");

    const pollingRef = useRef(null);
    const startedRef = useRef(false);
    const assessmentTriggeredRef = useRef(false);
    const assessmentRequestRef = useRef(false);

    const stepsForDisplay = useMemo(() => {
        const source =
            auditResult?.consent_management?.steps ??
            auditResult?.steps ??
            [];

        if (!Array.isArray(source)) return [];

        return source
            .filter((step) => step?.result)
            .map((step) => ({
                ...step.result,
                step_id: step.step_id,
                execution_status: normalizeStatus(step.status),
            }));
    }, [auditResult]);

    const auditMetadata = auditResult?.audit || null;

    const loadChecklistAssessment = useCallback(async ({ retry = false } = {}) => {
        if (!effectivePublicAuditId || assessmentRequestRef.current) return;
        if (assessmentTriggeredRef.current && !retry) return;

        assessmentRequestRef.current = true;
        assessmentTriggeredRef.current = true;
        setAssessmentLoading(true);
        setAssessmentError("");

        try {
            const data = await getConsentChecklistAssessment(effectivePublicAuditId);
            setChecklistAssessment(data);
        } catch (assessmentErr) {
            assessmentTriggeredRef.current = false;
            setAssessmentError(
                assessmentErr?.message || "Failed to load checklist assessment."
            );
        } finally {
            assessmentRequestRef.current = false;
            setAssessmentLoading(false);
        }
    }, [effectivePublicAuditId]);

    const updateAuditProgress = useCallback((data) => {
        const steps = normalizeSteps(data);
        const completedSteps = steps.filter(
            (step) => step.status === "COMPLETED"
        );
        const runningStep = steps.find((step) => step.status === "RUNNING");
        const queuedStep = steps.find((step) => step.status === "QUEUED");

        setAuditProgress({
            progress: steps.length
                ? Math.round((completedSteps.length / steps.length) * 100)
                : 0,
            currentStep: runningStep?.step_id || queuedStep?.step_id || null,
            status: getAuditStatus(data),
            steps,
        });
    }, []);

    const handleStartAudit = useCallback(async () => {
        if (!configuration) {
            setError("Audit configuration is missing. Return to the application and run the scanner again.");
            setAuditState("failed");
            return;
        }

        const parsedMaxPages = Number(maxPages);
        if (
            !Number.isInteger(parsedMaxPages) ||
            parsedMaxPages < MIN_MAX_PAGES ||
            parsedMaxPages > MAX_MAX_PAGES
        ) {
            setMaxPagesError(`Enter a whole number between ${MIN_MAX_PAGES} and ${MAX_MAX_PAGES}.`);
            return;
        }

        setMaxPagesError("");
        setError("");
        setAuditState("starting");

        try {
            const response = await startAudit({
                public_audit_id: configuration.public_audit_id,
                audit_id: configuration.audit_id,
                url: configuration.url,
                max_pages: parsedMaxPages,
                username: configuration.username || "",
                password: configuration.password || "",
            });

            if (!response?.audit_id) {
                throw new Error("Audit started but no audit ID was returned.");
            }

            setAuditId(response.audit_id);
            setTaskId(response.task_id || null);
            setAuditState("running");
        } catch (startError) {
            setError(startError?.message || "Failed to start consent audit.");
            setAuditState("failed");
        }
    }, [configuration, maxPages]);

    const checkExistingAudit = useCallback(async () => {
        if (!effectivePublicAuditId) {
            setError("Public Audit ID is missing.");
            setAuditState("failed");
            return;
        }

        try {
            setError("");
            const data = await getConsentAuditResult(effectivePublicAuditId);
            const existingAuditId = data?.audit?.id || data?.audit_id || null;
            const status = getAuditStatus(data);
            const recognizedStatuses = [
                "QUEUED", "PENDING", "RUNNING", "COMPLETED",
                "FAILED", "ERROR", "CANCELLED",
            ];

            if (existingAuditId || recognizedStatuses.includes(status)) {
                if (existingAuditId) setAuditId(existingAuditId);

                setAuditResult({
                    ...data,
                    steps: normalizeSteps(data),
                });
                updateAuditProgress(data);

                if (status === "COMPLETED") {
                    setAuditState("completed");
                    if (isScanFullyCompleted(data)) {
                        await loadChecklistAssessment();
                    } else {
                        setAssessmentError(
                            "The audit is marked completed, but one or more steps are missing or not completed. Assessment was not requested."
                        );
                    }
                    return;
                }

                if (["FAILED", "ERROR", "CANCELLED"].includes(status)) {
                    setError(data?.error || data?.message || `Audit ${status.toLowerCase()}.`);
                    setAuditState("failed");
                    return;
                }

                setAuditState("running");
                return;
            }

            // A successful response without an audit record is not treated as a new scan.
            setError("The existing audit status could not be determined.");
            setAuditState("failed");
        } catch (checkError) {
            if (checkError?.status === 404) {
                if (configuration?.public_audit_id) {
                    setAuditState("configuring");
                    return;
                }

                setError(`No existing consent audit was found for ${effectivePublicAuditId}.`);
                setAuditState("failed");
                return;
            }

            setError(checkError?.message || "Failed to check existing consent audit.");
            setAuditState("failed");
        }
    }, [
        effectivePublicAuditId,
        configuration,
        updateAuditProgress,
        loadChecklistAssessment,
    ]);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        checkExistingAudit();
    }, [checkExistingAudit]);

    useEffect(() => {
        if (auditState !== "running" || !effectivePublicAuditId) return undefined;

        let isPolling = true;

        const pollAudit = async () => {
            if (!isPolling) return;

            try {
                const data = await getConsentAuditResult(effectivePublicAuditId);
                const returnedAuditId = data?.audit?.id || data?.audit_id || null;

                if (returnedAuditId) setAuditId(returnedAuditId);

                const status = getAuditStatus(data);
                const steps = normalizeSteps(data);

                updateAuditProgress(data);
                setAuditResult({ ...data, steps });

                if (status === "COMPLETED") {
                    setAuditState("completed");

                    if (isScanFullyCompleted(data)) {
                        await loadChecklistAssessment();
                    } else {
                        setAssessmentError(
                            "The audit reports completion, but not all steps have completed successfully. Checklist assessment was not requested."
                        );
                    }
                    return;
                }

                if (["FAILED", "ERROR", "CANCELLED"].includes(status)) {
                    setError(data?.error || data?.message || `Audit ${status.toLowerCase()}.`);
                    setAuditState("failed");
                }
            } catch (pollError) {
                // A temporary polling error should not mark the running audit as failed.
                console.error("[Consent Audit] Polling error:", pollError);
            }
        };

        pollAudit();
        pollingRef.current = setInterval(pollAudit, POLLING_INTERVAL);

        return () => {
            isPolling = false;
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [
        auditState,
        effectivePublicAuditId,
        updateAuditProgress,
        loadChecklistAssessment,
    ]);

    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, []);

    const estimatedSeconds = 30 + (15 * (Number(maxPages) || 0));
    const estimatedDuration =
        estimatedSeconds >= 60
            ? `${Math.floor(estimatedSeconds / 60)} min ${estimatedSeconds % 60} sec`
            : `${estimatedSeconds} seconds`;

    const renderShell = (children) => (
        <div className="min-h-screen bg-[#F4F7FB] px-6 py-6 text-[#14213D]">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
    );

    if (auditState === "checking" || auditState === "starting") {
        return renderShell(
            <>
                <PageHeader
                    title="Consent Audit"
                    description={
                        auditState === "checking"
                            ? "Checking whether a consent audit already exists..."
                            : "Initializing the consent scanner..."
                    }
                />
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-8">
                    <LoaderCircle className="h-8 w-8 animate-spin text-[#075EB5]" />
                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            {auditState === "checking" ? "Checking Existing Audit" : "Starting Consent Audit"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Please wait. This page will update automatically.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (auditState === "configuring") {
        return renderShell(
            <>
                <PageHeader
                    title="Configure Consent Audit"
                    description="Set the maximum number of pages the scanner should inspect before starting the audit."
                />

                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Target Website
                        </label>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 break-all">
                            {configuration?.url || "Website URL unavailable"}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="max-pages" className="mb-2 block text-sm font-medium text-slate-700">
                                Maximum Pages to Crawl
                            </label>
                            <input
                                id="max-pages"
                                type="number"
                                min={MIN_MAX_PAGES}
                                max={MAX_MAX_PAGES}
                                step="1"
                                value={maxPages}
                                onChange={(event) => {
                                    setMaxPages(event.target.value);
                                    setMaxPagesError("");
                                }}
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#075EB5] focus:ring-2 focus:ring-blue-100"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Enter a value between {MIN_MAX_PAGES} and {MAX_MAX_PAGES}.
                            </p>
                            {maxPagesError && (
                                <p className="mt-2 text-xs text-red-600">{maxPagesError}</p>
                            )}
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Clock3 className="h-4 w-4" />
                                <p className="text-sm font-medium">Estimated Crawl Duration</p>
                            </div>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">
                                {estimatedDuration}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Approximate estimate based on the selected page limit. Actual duration depends on website response times.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">Authentication</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            {configuration?.username
                                ? "Auditee login credentials are available and will be passed automatically to the scanner."
                                : "No Auditee login credentials were provided for this application. The scanner will run without authenticated access."}
                        </p>
                    </div>

                    {error && (
                        <p className="mt-4 text-sm text-red-600">{error}</p>
                    )}

                    <div className="mt-7 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleStartAudit}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#075EB5] px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-[#064D94]"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Start Consent Scan
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (auditState === "running") {
        return renderShell(
            <>
                <PageHeader
                    title="Consent Audit in Progress"
                    description={configuration?.url ? `Auditing ${configuration.url}` : "The consent scanner is running."}
                />
                <AuditProgress
                    progress={auditProgress?.progress || 0}
                    currentStep={auditProgress?.currentStep || null}
                    status={auditProgress?.status || "RUNNING"}
                    steps={auditProgress?.steps || []}
                />
                {taskId && (
                    <p className="mt-3 text-xs text-slate-500">Task ID: {taskId}</p>
                )}
            </>
        );
    }

    if (auditState === "failed") {
        return renderShell(
            <>
                <PageHeader
                    title="Consent Audit"
                    description="Unable to complete the consent audit."
                />
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-red-700">Audit Failed</p>
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Applications
                    </button>
                </div>
            </>
        );
    }

    return renderShell(
        <>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <PageHeader
                    title="Consent Audit Results"
                    description={configuration?.url ? `Audit results for ${configuration.url}` : "Completed DPDP consent compliance audit."}
                />
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Applications
                </button>
            </div>

            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                        <h2 className="text-sm font-semibold text-emerald-700">Audit Completed</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            All scanner steps have completed. The checklist assessment is requested separately.
                        </p>
                    </div>
                </div>
            </div>

            <AuditMetadata configuration={configuration} metadata={auditMetadata} />

            <div className="mt-6">
                <AuditSummary steps={stepsForDisplay} />
            </div>

            <div className="mt-6">
                <AuditStepList steps={stepsForDisplay} />
            </div>

            <ChecklistAssessment
                data={checklistAssessment}
                loading={assessmentLoading}
                error={assessmentError}
                onRetry={() => loadChecklistAssessment({ retry: true })}
            />

            <div className="mt-4 text-xs text-slate-500">
                {auditId ? `Audit ID: ${auditId}` : ""}
                {effectivePublicAuditId ? ` • Public Audit ID: ${effectivePublicAuditId}` : ""}
            </div>
        </>
    );
};

export default ConsentAutoAudit;
