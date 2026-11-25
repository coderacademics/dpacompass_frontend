
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    RefreshCw,
    ShieldCheck,
    ScanSearch,
    CheckCircle2,
    Clock3,
    Globe,
    ArrowUpRight,
    Eye,
    X,
    LoaderCircle,
    CalendarDays,
    ChevronRight,
    Info,
    Layers3,
    FileSearch,
    AlertCircle,
    Activity,
    AlertTriangle,
    CheckCircle2 as StepCheckCircle,
    Circle,
    ChevronDown,
    ChevronUp,
    FileText,
    Hourglass,
    MinusCircle,
} from "lucide-react";

import { getDpacompassAudits, getConsentScanStatus } from "./Tools/ConsentScanner/selfCheckConsentApi";
import { getSelfCheckBreachScanStatus } from "../utilities/breachApi";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const CONSENT_TOOL = {
    tool: "consent_management",
    label: "Consent Management Scanner",
};

const BREACH_TOOL = {
    tool: "data_breach",
    label: "PII-in-Transit Scanner",
};

const ACTIVE_STATUSES = ["queued", "running"];
const AUTO_REFRESH_INTERVAL = 5000;
const CONSENT_STATUS_POLL_INTERVAL = 2500;

/*
|--------------------------------------------------------------------------
| Status helpers
|--------------------------------------------------------------------------
*/

const normalizeStatus = (status, fallback = "unknown") => {
    const value = String(status || "").trim().toLowerCase();

    if (["completed", "complete", "success", "finished", "successful"].includes(value)) {
        return "completed";
    }

    if (["running", "in_progress", "processing", "started"].includes(value)) {
        return "running";
    }

    if (["queued", "pending", "waiting"].includes(value)) {
        return "queued";
    }

    if (["failed", "error", "cancelled", "canceled"].includes(value)) {
        return "failed";
    }

    return fallback;
};

const getRecordStatus = (record, fallback = "unknown") => {
    return normalizeStatus(
        record?.consent_management?.status ??
        record?.data_breach?.status ??
        record?.scan_status ??
        record?.status ??
        record?.task_status ??
        record?.state,
        fallback
    );
};

const getPublicAuditId = (record) => {
    const value =
        record?.public_audit_id ??
        record?.publicAuditId ??
        record?.audit?.public_audit_id ??
        record?.scan?.public_audit_id;

    return value ? String(value) : null;
};

const getRecordUrl = (record) => {
    return (
        record?.application?.url ??
        record?.url ??
        record?.website_url ??
        record?.target_url ??
        record?.scan_url ??
        "URL unavailable"
    );
};

const getRecordDate = (record) => {
    return (
        record?.created_at ??
        record?.started_at ??
        record?.created_on ??
        record?.timestamp ??
        record?.date ??
        null
    );
};

/*
|--------------------------------------------------------------------------
| API response extraction
|--------------------------------------------------------------------------
*/

const extractRecords = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    const possibleArrays = [
        response?.audits,
        response?.scans,
        response?.results,
        response?.data?.audits,
        response?.data?.scans,
        response?.data?.results,
        response?.data,
    ];

    return possibleArrays.find(Array.isArray) || [];
};

/*
|--------------------------------------------------------------------------
| Overall status
|--------------------------------------------------------------------------
*/

const getOverallStatus = (tools = []) => {
    if (!tools.length) return "unknown";

    const statuses = tools.map((tool) =>
        normalizeStatus(tool.status)
    );

    if (statuses.includes("running")) return "running";

    if (statuses.includes("failed")) return "failed";

    if (statuses.every((status) => status === "completed")) {
        return "completed";
    }

    if (statuses.includes("queued")) return "queued";

    return "unknown";
};

/*
|--------------------------------------------------------------------------
| Date formatting
|--------------------------------------------------------------------------
*/

const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/*
|--------------------------------------------------------------------------
| Scanner icon
|--------------------------------------------------------------------------
*/

const getToolIcon = (tool) => {
    return tool === "consent_management"
        ? ShieldCheck
        : ScanSearch;
};

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

const StatusBadge = ({ status }) => {
    const normalized = normalizeStatus(status);

    const styles = {
        queued: "bg-amber-50 text-amber-700 border-amber-200",
        running: "bg-blue-50 text-blue-700 border-blue-200",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        failed: "bg-red-50 text-red-700 border-red-200",
        unknown: "bg-slate-100 text-slate-600 border-slate-200",
    };

    const labels = {
        queued: "Queued",
        running: "Running",
        completed: "Completed",
        failed: "Failed",
        unknown: "Unknown",
    };

    const icons = {
        queued: Clock3,
        running: LoaderCircle,
        completed: CheckCircle2,
        failed: AlertCircle,
        unknown: AlertCircle,
    };

    const Icon = icons[normalized];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${styles[normalized]}`}
        >
            <Icon
                size={13}
                className={normalized === "running" ? "animate-spin" : ""}
            />
            {labels[normalized]}
        </span>
    );
};

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

const SummaryCard = ({ title, value, icon: Icon, color }) => {
    const colorStyles = {
        slate: "bg-slate-100 text-slate-600",
        amber: "bg-amber-50 text-amber-600",
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 font-medium">
                        {title}
                    </p>

                    <h3 className="text-2xl font-bold text-slate-800 mt-2">
                        {value}
                    </h3>
                </div>

                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorStyles[color]}`}
                >
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Individual Tool Row
|--------------------------------------------------------------------------
*/

const ToolStatusRow = ({ tool, onToggleLive, onViewResult, liveExpanded }) => {
    const Icon = getToolIcon(tool.tool);
    const status = normalizeStatus(tool.status);
    const isConsentRunning = tool.tool === "consent_management" && status === "running";
    const isCompleted = status === "completed";

    return (
        <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Icon size={17} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{tool.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Scanner execution status</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {isConsentRunning && (
                    <button
                        type="button"
                        onClick={onToggleLive}
                        aria-expanded={liveExpanded}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${liveExpanded
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                            }`}
                    >
                        <Activity size={14} />
                        Live Status
                        {liveExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                )}
                {isCompleted && (
                    <button
                        type="button"
                        onClick={onViewResult}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                        <Eye size={14} />
                        View Result
                        <ArrowUpRight size={13} />
                    </button>
                )}
                <StatusBadge status={status} />
            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Consent live-status helpers and collapsible panel
|--------------------------------------------------------------------------
*/

const unwrapConsentStatus = (response) => {
    if (!response || typeof response !== "object") return {};
    // Support both a direct response and common { data: {...} } wrappers.
    return response.data && typeof response.data === "object"
        ? { ...response, ...response.data }
        : response;
};

const readNumber = (...values) => {
    const value = values.find((item) => item !== undefined && item !== null && item !== "");
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const getConsentSteps = (statusData) => {
    const raw = statusData?.steps ?? statusData?.data?.steps ?? [];
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
        return Object.entries(raw).map(([key, value]) =>
            typeof value === "object" && value !== null
                ? { key, ...value }
                : { key, title: key, status: value }
        );
    }
    return [];
};

const normalizeStepStatus = (step) => normalizeStatus(
    step?.status ?? step?.step_status ?? step?.state,
    "queued"
);

const CONSENT_STEP_NAMES = {
    "STEP-01": "Identify Personal Data Collection Points",
    "STEP-02": "Verify Notice Before or at Personal-Data Collection",
    "STEP-04": "Verify Collection Form and Notice Evidence",
    "STEP-05": "Assess Processing Purpose and Consent Dependency",
    "STEP-07": "Verify Optional Consent Controls",
    "STEP-11": "Assess Preference Management Interface",
    "STEP-13": "Inspect Cookies and Browser Storage",
};

const getConsentStepDisplayName = (step, index) => {
    const rawName = String(
        step?.title || step?.name || step?.step_name || step?.key || ""
    ).trim();

    const stepCode = rawName.match(/STEP-\\d+/i)?.[0]?.toUpperCase()
        || String(step?.step_id || step?.step_number || "").toUpperCase();

    const cleanedName = rawName
        .replace(/^\\s*\\d+\\s*[.)-]\\s*/, "")
        .replace(/^STEP-\\d+\\s*[:.)-]?\\s*/i, "")
        .trim();

    if (cleanedName && !/^STEP-\\d+$/i.test(cleanedName)) return cleanedName;
    return CONSENT_STEP_NAMES[stepCode] || `Assessment activity ${index + 1}`;
};

const ConsentLiveStatus = ({ publicAuditId, statusData, loading, lastUpdated, expanded }) => {
    const data = unwrapConsentStatus(statusData);
    const crawl = data?.crawl_progress ?? data?.data?.crawl_progress ?? {};
    const summary = crawl?.crawl_summary ?? {};
    const steps = getConsentSteps(data);

    const pagesCrawled = readNumber(crawl.pages_crawled, crawl.crawled_pages);
    const pagesAttempted = readNumber(
        crawl.pages_attempted,
        crawl.total_attempted,
        crawl.attempted_pages,
        crawl.total_pages,
        summary.attempted,
        summary.total_attempted,
        summary.attempted_pages
    );
    const pending = readNumber(crawl.pending_urls, crawl.pending, summary.pending);
    const failed = readNumber(summary.failed, summary.failed_pages, crawl.failed_pages);
    const skipped = readNumber(summary.skipped, summary.skipped_pages, crawl.skipped_pages);
    const successful = readNumber(
        summary.completed,
        summary.successful,
        summary.success,
        crawl.successful_pages,
        pagesCrawled
    );
    const progress = pagesAttempted > 0
        ? Math.min(100, Math.round((pagesCrawled / pagesAttempted) * 100))
        : (crawl.is_completed ? 100 : 0);

    const runningStepIndex = steps.findIndex((step) => normalizeStepStatus(step) === "running");
    const completedSteps = steps.filter((step) => normalizeStepStatus(step) === "completed").length;
    const currentStep = runningStepIndex >= 0 ? steps[runningStepIndex] : null;
    const crawlStatus = String(crawl.crawl_status ?? data.status ?? "Running").replaceAll("_", " ");
    const updatedLabel = lastUpdated
        ? new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "Waiting for update";

    const stepIcon = (status) => {
        if (status === "completed") return <StepCheckCircle size={16} />;
        if (status === "running") return <LoaderCircle size={16} className="animate-spin" />;
        if (status === "failed") return <AlertTriangle size={16} />;
        if (status === "queued") return <Circle size={16} />;
        return <MinusCircle size={16} />;
    };

    const stepTone = (status) => ({
        completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
        running: "bg-blue-50 text-blue-600 border-blue-200",
        queued: "bg-slate-50 text-slate-400 border-slate-200",
        failed: "bg-red-50 text-red-600 border-red-200",
    }[status] || "bg-slate-50 text-slate-500 border-slate-200");

    return (
        <div className="mt-1">
            <div
                id={`consent-live-${publicAuditId}`}
                className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden min-h-0">
                    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
                        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50/70 px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Status — Consent Management Scanner
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                {loading && <LoaderCircle size={13} className="animate-spin text-blue-600" />}
                                <span>Last updated: {updatedLabel}</span>
                                <RefreshCw size={13} className={loading ? "animate-spin text-blue-600" : ""} />
                            </div>
                        </header>

                        <div className="grid grid-cols-1 gap-5 p-4 lg:grid-cols-12 lg:gap-6 sm:p-5">
                            <div className="lg:col-span-3">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                                        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="9" />
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="#2563eb" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${progress * 2.639} 263.9`} className="transition-all duration-700" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-800">{progress}%</div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800">{crawl.is_completed ? "Crawling Completed" : "Crawling Website"}</p>
                                        <p className="mt-1 text-xs text-slate-500">{crawlStatus}</p>
                                        {currentStep && (
                                            <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                                                <LoaderCircle size={12} className="shrink-0 animate-spin" />
                                                <span className="truncate">{getConsentStepDisplayName(currentStep, runningStepIndex)}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 lg:border-x lg:border-slate-100 lg:px-5">
                                <h4 className="mb-3 text-sm font-bold text-slate-800">Crawl Progress</h4>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <LiveStat icon={<FileText size={16} />} value={pagesCrawled} label="Pages Crawled" tone="blue" />
                                    <LiveStat icon={<Layers3 size={16} />} value={pagesAttempted} label="Attempted" tone="purple" />
                                    <LiveStat icon={<Hourglass size={16} />} value={pending} label="Pending" tone="amber" />
                                    <LiveStat icon={<AlertTriangle size={16} />} value={failed} label="Failed" tone="red" />
                                    <LiveStat icon={<MinusCircle size={16} />} value={skipped} label="Skipped" tone="slate" />
                                    <LiveStat icon={<StepCheckCircle size={16} />} value={successful} label="Successful" tone="green" />
                                </div>
                            </div>

                            <div className="lg:col-span-4">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-bold text-slate-800">Scanner Steps ({steps.length})</h4>
                                    <span className="text-xs text-slate-500">{completedSteps}/{steps.length} completed</span>
                                </div>
                                {steps.length ? (
                                    <div className="space-y-3">
                                        {steps.map((step, index) => {
                                            const status = normalizeStepStatus(step);
                                            const name = getConsentStepDisplayName(step, index);
                                            const description = step.description || step.message || step.detail;
                                            return (
                                                <div key={step.id || step.key || `${name}-${index}`} className="flex items-start gap-2.5">
                                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${stepTone(status)}`}>
                                                        {stepIcon(status)}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center justify-between gap-1">
                                                            <p className="text-xs font-semibold text-slate-700">{name}</p>
                                                            <span className="text-[10px] uppercase tracking-wide text-slate-400">{status.replaceAll("_", " ")}</span>
                                                        </div>
                                                        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">Scanner step information is not available yet.</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const LiveStat = ({ icon, value, label, tone }) => {
    const tones = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-violet-50 text-violet-600",
        amber: "bg-amber-50 text-amber-700",
        red: "bg-red-50 text-red-600",
        slate: "bg-slate-100 text-slate-600",
        green: "bg-emerald-50 text-emerald-600",
    };
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
            <p className="mt-2 text-lg font-bold text-slate-800">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Scan Card
|--------------------------------------------------------------------------
*/

const ScanCard = ({ scan, onViewResult, consentLiveStatus, consentLiveLoading, consentLiveUpdated }) => {
    const [consentLiveExpanded, setConsentLiveExpanded] = useState(false);
    const overallStatus = getOverallStatus(scan.tools);
    const allCompleted = overallStatus === "completed";
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">

            <div className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">

                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                                <Layers3 size={13} />
                                {scan.public_audit_id}
                            </span>

                            <StatusBadge status={overallStatus} />
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Globe
                                size={18}
                                className="text-slate-400 mt-0.5 shrink-0"
                            />

                            <div className="min-w-0">
                                <h3
                                    className="text-base sm:text-lg font-bold text-slate-800 break-all"
                                    title={scan.url}
                                >
                                    {scan.url}
                                </h3>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">

                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays size={13} />
                                        {formatDate(scan.created_at)}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <FileSearch size={13} />
                                        {scan.tools.length} scanner
                                        {scan.tools.length !== 1 ? "s" : ""}
                                        selected
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            <div className="bg-slate-50/70 border-t border-slate-100 px-5 sm:px-6 py-3">

                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Selected Scanners
                    </p>

                    <span className="text-xs text-slate-400">
                        {scan.tools.length} selected
                    </span>
                </div>

                <div>
                    {scan.tools.map((tool) => (
                        <ToolStatusRow
                            key={`${scan.public_audit_id}-${tool.tool}`}
                            tool={tool}
                            onToggleLive={() => setConsentLiveExpanded((value) => !value)}
                            onViewResult={() => onViewResult(scan, tool)}
                            liveExpanded={consentLiveExpanded}
                        />
                    ))}
                </div>

                {scan.tools.some((tool) =>
                    tool.tool === "consent_management" &&
                    normalizeStatus(tool.status) === "running"
                ) && (
                        <ConsentLiveStatus
                            publicAuditId={scan.public_audit_id}
                            statusData={consentLiveStatus}
                            loading={consentLiveLoading}
                            lastUpdated={consentLiveUpdated}
                            expanded={consentLiveExpanded}
                        />
                    )}
            </div>

            <div className="px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">

                <p className="text-xs text-slate-400">
                    Overall status is based on the selected scanners.
                </p>

                {allCompleted ? (
                    <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        All scanners completed
                    </span>
                ) : overallStatus === "failed" ? (
                    <span className="text-sm font-semibold text-red-600">
                        Scanner execution failed
                    </span>
                ) : (
                    <span className="text-sm font-medium text-slate-500">
                        Result will be available after completion
                    </span>
                )}
            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Main Page
|--------------------------------------------------------------------------
*/

export default function SelfCheckScansPage() {
    const navigate = useNavigate();

    const [scans, setScans] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [partialError, setPartialError] = useState("");
    const [consentLiveStatuses, setConsentLiveStatuses] = useState({});
    const [consentLiveLoading, setConsentLiveLoading] = useState({});

    /*
    |--------------------------------------------------------------------------
    | Normalize and independently merge scanner histories
    |--------------------------------------------------------------------------
    */

    const loadScans = useCallback(async (manual = false) => {
        if (manual) {
            setRefreshing(true);
        }

        setError("");
        setPartialError("");

        // console.group("SELF-CHECK SCAN HISTORY");

        try {
            // ---------------------------------------------------------
            // 1. Fetch histories independently from both scanners
            // ---------------------------------------------------------

            // console.log("[Consent Scanner] Fetching audit history...");
            // console.log("[Data Breach Scanner] Fetching audit history...");

            const [consentResult, breachResult] = await Promise.allSettled([
                getDpacompassAudits(),

                Promise.all([
                    getSelfCheckBreachScanStatus("COMPLETED"),
                    getSelfCheckBreachScanStatus("PENDING"),
                    getSelfCheckBreachScanStatus("RUNNING"),
                ]),
            ]);

            const mergedScans = new Map();
            const errors = [];

            // ---------------------------------------------------------
            // 2. Process Consent Scanner history
            // ---------------------------------------------------------

            if (consentResult.status === "fulfilled") {
                const consentRecords = extractRecords(consentResult.value);

                console.log("[Consent Scanner] Response:", consentResult.value);
                console.log("[Consent Scanner] Extracted records:", consentRecords);

                consentRecords.forEach((record) => {
                    const publicAuditId = getPublicAuditId(record);

                    if (!publicAuditId) {
                        console.warn(
                            "[Consent Scanner] Skipping record: Public Audit ID missing.",
                            record
                        );
                        return;
                    }

                    const status = getRecordStatus(record, "completed");

                    const existing = mergedScans.get(publicAuditId);

                    if (existing) {
                        // Same Public Audit ID: add Consent to the existing assessment.
                        existing.tools = existing.tools.filter(
                            (tool) => tool.tool !== "consent_management"
                        );

                        existing.tools.push({
                            ...CONSENT_TOOL,
                            status,
                        });

                        if (
                            existing.url === "URL unavailable" &&
                            getRecordUrl(record) !== "URL unavailable"
                        ) {
                            existing.url = getRecordUrl(record);
                        }

                        if (!existing.created_at) {
                            existing.created_at = getRecordDate(record);
                        }
                    } else {
                        // Consent-only assessment.
                        mergedScans.set(publicAuditId, {
                            public_audit_id: publicAuditId,
                            url: getRecordUrl(record),
                            created_at: getRecordDate(record),
                            tools: [
                                {
                                    ...CONSENT_TOOL,
                                    status,
                                },
                            ],
                        });
                    }
                });

            } else {
                console.error(
                    "[Consent Scanner] History request failed:",
                    consentResult.reason
                );

                errors.push(
                    `Consent Scanner: ${consentResult.reason?.message ||
                    "Unable to retrieve scan history."
                    }`
                );
            }

            // ---------------------------------------------------------
            // 3. Process Data Breach Scanner history
            // ---------------------------------------------------------

            // console.group("[Data Breach Scanner]");

            if (breachResult.status === "fulfilled") {
                const [
                    completedResponse,
                    pendingResponse,
                    runningResponse,
                ] = breachResult.value;

                // console.log("Completed API response:", completedResponse);
                // console.log("Pending API response:", pendingResponse);
                // console.log("Running API response:", runningResponse);

                const completedRecords = extractRecords(completedResponse);
                const pendingRecords = extractRecords(pendingResponse);
                const runningRecords = extractRecords(runningResponse);

                // console.log("Total audits fetched:", {
                //     completed: completedRecords.length,
                //     pending: pendingRecords.length,
                //     running: runningRecords.length,
                //     total:
                //         completedRecords.length +
                //         pendingRecords.length +
                //         runningRecords.length,
                // });

                const breachRecords = [
                    ...completedRecords.map((record) => ({
                        ...record,
                        __fallback_status: "completed",
                    })),

                    ...pendingRecords.map((record) => ({
                        ...record,
                        __fallback_status: "queued",
                    })),

                    ...runningRecords.map((record) => ({
                        ...record,
                        __fallback_status: "running",
                    })),
                ];

                breachRecords.forEach((record) => {
                    const publicAuditId = getPublicAuditId(record);

                    if (!publicAuditId) {
                        console.warn("Skipping Data Breach record: Public Audit ID missing.", record);
                        return;
                    }

                    const status = getRecordStatus(
                        record,
                        record.__fallback_status
                    );

                    // console.log("Data Breach audit:", {
                    //     public_audit_id: publicAuditId,
                    //     status,
                    //     url: getRecordUrl(record),
                    // });

                    const existing = mergedScans.get(publicAuditId);

                    if (existing) {
                        // Both scanners share the same Public Audit ID.
                        // console.log(
                        //     "Matching Public Audit ID found. Merging Data Breach audit:",
                        //     publicAuditId
                        // );

                        existing.tools = existing.tools.filter(
                            (tool) => tool.tool !== "data_breach"
                        );

                        existing.tools.push({
                            ...BREACH_TOOL,
                            status,
                        });

                        if (
                            existing.url === "URL unavailable" &&
                            getRecordUrl(record) !== "URL unavailable"
                        ) {
                            existing.url = getRecordUrl(record);
                        }

                        if (!existing.created_at) {
                            existing.created_at = getRecordDate(record);
                        }
                    } else {
                        // Data Breach-only assessment.
                        // console.log(
                        //     "No matching Consent audit. Creating Data Breach-only assessment:",
                        //     publicAuditId
                        // );

                        mergedScans.set(publicAuditId, {
                            public_audit_id: publicAuditId,
                            url: getRecordUrl(record),
                            created_at: getRecordDate(record),
                            tools: [
                                {
                                    ...BREACH_TOOL,
                                    status,
                                },
                            ],
                        });
                    }
                });
            } else {
                console.error("API request failed:", breachResult.reason);

                errors.push(
                    `Data Breach Scanner: ${breachResult.reason?.message ||
                    "Unable to retrieve scan history."
                    }`
                );
            }

            console.groupEnd();

            // ---------------------------------------------------------
            // 4. Prepare final merged audit list
            // ---------------------------------------------------------

            const finalScans = Array.from(mergedScans.values()).sort(
                (a, b) => {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();

                    return dateB - dateA;
                }
            );

            // console.group("[Final Merged Audit History]");

            // console.log("Total unique assessments:", finalScans.length);
            // console.table(
            //     finalScans.map((scan) => ({
            //         public_audit_id: scan.public_audit_id,
            //         url: scan.url,
            //         scanners: scan.tools.map((tool) => tool.tool).join(", "),
            //         statuses: scan.tools.map((tool) => tool.status).join(", "),
            //     }))
            // );

            // console.log("Final merged records:", finalScans);

            // console.groupEnd();

            setScans(finalScans);

            if (errors.length === 2) {
                setError(errors.join(" "));
            } else if (errors.length === 1) {
                setPartialError(errors[0]);
            }

        } catch (err) {
            console.error("Unable to load self-check scans:", err);

            setError(err.message || "Unable to load scan history.");
        } finally {
            setLoading(false);
            setRefreshing(false);

            console.groupEnd();
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Initial API call
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadScans();
    }, [loadScans]);

    const activeConsentAuditIds = useMemo(
        () => scans
            .filter((scan) => scan.tools.some((tool) =>
                tool.tool === "consent_management" &&
                normalizeStatus(tool.status) === "running"
            ))
            .map((scan) => scan.public_audit_id),
        [scans]
    );

    const activeConsentAuditKey = activeConsentAuditIds.join("|");

    useEffect(() => {
        let cancelled = false;
        let timer;
        let inFlight = false;
        const auditIds = activeConsentAuditKey ? activeConsentAuditKey.split("|") : [];

        const pollConsentStatuses = async () => {
            if (inFlight || cancelled) return;

            if (!auditIds.length) return;

            inFlight = true;
            await Promise.allSettled(auditIds.map(async (auditId) => {
                setConsentLiveLoading((previous) => ({ ...previous, [auditId]: true }));

                try {
                    const response = await getConsentScanStatus(auditId);
                    const statusData = unwrapConsentStatus(response);
                    if (cancelled) return;

                    setConsentLiveStatuses((previous) => ({
                        ...previous,
                        [auditId]: {
                            data: statusData,
                            updatedAt: new Date().toISOString(),
                        },
                    }));

                    const liveStatus = normalizeStatus(statusData.status ?? statusData.scan_status);
                    if (liveStatus !== "unknown") {
                        setScans((previous) => previous.map((item) => {
                            if (item.public_audit_id !== auditId) return item;
                            return {
                                ...item,
                                tools: item.tools.map((tool) =>
                                    tool.tool === "consent_management"
                                        ? { ...tool, status: liveStatus }
                                        : tool
                                ),
                            };
                        }));
                    }
                } catch (err) {
                    console.error(`[Consent Live Status] ${auditId}:`, err);
                } finally {
                    if (!cancelled) {
                        setConsentLiveLoading((previous) => ({ ...previous, [auditId]: false }));
                    }
                }
            }));

            inFlight = false;
        };

        if (auditIds.length) {
            pollConsentStatuses();
            timer = window.setInterval(pollConsentStatuses, CONSENT_STATUS_POLL_INTERVAL);
        }

        return () => {
            cancelled = true;
            if (timer) window.clearInterval(timer);
        };
    }, [activeConsentAuditKey]);

    /*
    |--------------------------------------------------------------------------
    | Automatic refresh while scans are active
    |--------------------------------------------------------------------------
    */

    const hasActiveScans = useMemo(() => {
        return scans.some((scan) =>
            scan.tools.some((tool) =>
                ACTIVE_STATUSES.includes(normalizeStatus(tool.status))
            )
        );
    }, [scans]);

    useEffect(() => {
        if (!hasActiveScans) return undefined;

        const timer = window.setInterval(() => {
            loadScans();
        }, AUTO_REFRESH_INTERVAL);

        return () => window.clearInterval(timer);
    }, [hasActiveScans, loadScans]);

    /*
    |--------------------------------------------------------------------------
    | Summary counts
    |--------------------------------------------------------------------------
    */

    const scanCounts = useMemo(() => {
        return {
            total: scans.length,

            queued: scans.filter(
                (scan) => getOverallStatus(scan.tools) === "queued"
            ).length,

            running: scans.filter(
                (scan) => getOverallStatus(scan.tools) === "running"
            ).length,

            completed: scans.filter(
                (scan) => getOverallStatus(scan.tools) === "completed"
            ).length,

            failed: scans.filter(
                (scan) => getOverallStatus(scan.tools) === "failed"
            ).length,
        };
    }, [scans]);

    /*
    |--------------------------------------------------------------------------
    | Search and filters
    |--------------------------------------------------------------------------
    */

    const filteredScans = useMemo(() => {
        return scans.filter((scan) => {
            const status = getOverallStatus(scan.tools);

            const matchesFilter =
                activeFilter === "all" || status === activeFilter;

            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                scan.public_audit_id?.toLowerCase().includes(searchValue) ||
                scan.url?.toLowerCase().includes(searchValue) ||
                scan.tools?.some((tool) =>
                    tool.label?.toLowerCase().includes(searchValue)
                );

            return matchesFilter && matchesSearch;
        });
    }, [scans, activeFilter, search]);

    /*
    |--------------------------------------------------------------------------
    | View Result
    |--------------------------------------------------------------------------
    */

    const handleViewResult = (scan, selectedTool) => {
        if (!selectedTool || normalizeStatus(selectedTool.status) !== "completed") {
            return;
        }

        // Include only completed scanners in the result page.
        const completedTools = scan.tools.filter(
            (tool) => normalizeStatus(tool.status) === "completed"
        );

        const showConsent = completedTools.some(
            (tool) => tool.tool === "consent_management"
        );

        const showDataBreach = completedTools.some(
            (tool) => tool.tool === "data_breach"
        );

        const navigationState = {
            public_audit_id: scan.public_audit_id,
            publicAuditId: scan.public_audit_id,
            url: scan.url,
            scanners: completedTools,
            showConsent,
            showDataBreach,
        };

        // All completed assessments use the same dynamic result page.
        navigate(
            `/user/self-check/results/${encodeURIComponent(scan.public_audit_id)}`,
            { state: navigationState }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Filter configuration
    |--------------------------------------------------------------------------
    */

    const filters = [
        { id: "all", label: "All Scans", count: scanCounts.total },
        { id: "queued", label: "Queued", count: scanCounts.queued },
        { id: "running", label: "Running", count: scanCounts.running },
        {
            id: "completed",
            label: "Completed",
            count: scanCounts.completed,
        },
        { id: "failed", label: "Failed", count: scanCounts.failed },
    ];

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-slate-50/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <span>Self Check</span>
                            <ChevronRight size={14} />
                            <span className="text-slate-600 font-medium">
                                My Scans
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            My Scans
                        </h1>

                        <p className="text-sm text-slate-500 mt-2">
                            Monitor your website scans and access completed scan results.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadScans(true)}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 transition-colors"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Full API Error */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Partial API Error */}
                {partialError && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <p>
                            {partialError} The other scanner's history is still displayed.
                        </p>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">

                    <SummaryCard
                        title="Total Scans"
                        value={scanCounts.total}
                        icon={Layers3}
                        color="slate"
                    />

                    <SummaryCard
                        title="Queued"
                        value={scanCounts.queued}
                        icon={Clock3}
                        color="amber"
                    />

                    <SummaryCard
                        title="Running"
                        value={scanCounts.running}
                        icon={LoaderCircle}
                        color="blue"
                    />

                    <SummaryCard
                        title="Completed"
                        value={scanCounts.completed}
                        icon={CheckCircle2}
                        color="green"
                    />

                    <SummaryCard
                        title="Failed"
                        value={scanCounts.failed}
                        icon={AlertCircle}
                        color="red"
                    />
                </div>

                {/* Scan List Container */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            <div>
                                <h2 className="text-base font-bold text-slate-800">
                                    Scan History
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Consent and Data Breach scan histories are retrieved independently.
                                </p>
                            </div>

                            <div className="relative w-full lg:w-80">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by URL or Public Audit ID..."
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto mt-5 pb-1">
                            {filters.map((filter) => {
                                const isActive = activeFilter === filter.id;

                                return (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {filter.label}

                                        <span
                                            className={`px-1.5 py-0.5 rounded-md text-xs ${isActive
                                                ? "bg-white/15 text-white"
                                                : "bg-white text-slate-500"
                                                }`}
                                        >
                                            {filter.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scan Cards */}
                    <div className="p-4 sm:p-5 space-y-4">

                        {loading ? (
                            <div className="py-16 flex flex-col items-center justify-center text-center">
                                <LoaderCircle
                                    size={28}
                                    className="animate-spin text-blue-600 mb-3"
                                />

                                <p className="text-sm font-semibold text-slate-700">
                                    Fetching your scans...
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Retrieving Consent and Data Breach histories.
                                </p>
                            </div>
                        ) : filteredScans.length > 0 ? (
                            filteredScans.map((scan) => (
                                <ScanCard
                                    key={scan.public_audit_id}
                                    scan={scan}
                                    onViewResult={handleViewResult}
                                    consentLiveStatus={consentLiveStatuses[scan.public_audit_id]?.data}
                                    consentLiveLoading={consentLiveLoading[scan.public_audit_id] || false}
                                    consentLiveUpdated={consentLiveStatuses[scan.public_audit_id]?.updatedAt}
                                />
                            ))
                        ) : (
                            <div className="py-16 px-4 text-center">

                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <ScanSearch
                                        size={25}
                                        className="text-slate-400"
                                    />
                                </div>

                                <h3 className="text-base font-bold text-slate-700">
                                    No scans found
                                </h3>

                                <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                                    {search
                                        ? "No scans match your search. Try another URL or Public Audit ID."
                                        : "There are no scans in this category yet."}
                                </p>

                                {(search || activeFilter !== "all") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setActiveFilter("all");
                                        }}
                                        className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Information Note */}
                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                    <Info
                        size={17}
                        className="text-blue-600 shrink-0 mt-0.5"
                    />

                    <p className="text-sm text-blue-800 leading-relaxed">
                        Each Public Audit ID represents one assessment. It may
                        contain a Consent scan, a Data Breach scan, or both.
                        The two scanner histories are retrieved independently
                        and combined only when they share the same Public Audit
                        ID. An assessment is marked Completed only when every
                        scanner recorded for that assessment has completed.
                    </p>
                </div>
            </div>
        </div>
    );
}
