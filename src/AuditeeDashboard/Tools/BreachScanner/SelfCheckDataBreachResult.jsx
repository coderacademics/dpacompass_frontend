import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    FileCheck2,
    Globe,
    Info,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import {
    breachApi,
    getDataBreachChecklistReport,
} from "../../../utilities/breachApi";

const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
};

const titleCase = (value = "") =>
    String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

const checklistStatus = (status = "NOT_EVALUATED") => {
    const key = String(status).toUpperCase();
    const map = {
        COMPLIANT: {
            label: "Compliant",
            tone: "emerald",
            icon: CheckCircle2,
            classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
        },
        NON_COMPLIANT: {
            label: "Non-compliant",
            tone: "red",
            icon: XCircle,
            classes: "border-red-200 bg-red-50 text-red-700",
            dot: "bg-red-500",
        },
        PARTIALLY_COMPLIANT: {
            label: "Partially compliant",
            tone: "amber",
            icon: AlertTriangle,
            classes: "border-amber-200 bg-amber-50 text-amber-800",
            dot: "bg-amber-500",
        },
        REVIEW: {
            label: "Requires review",
            tone: "blue",
            icon: Info,
            classes: "border-blue-200 bg-blue-50 text-blue-700",
            dot: "bg-blue-500",
        },
        NOT_APPLICABLE: {
            label: "Not applicable",
            tone: "violet",
            icon: Info,
            classes: "border-violet-200 bg-violet-50 text-violet-700",
            dot: "bg-violet-500",
        },
        NOT_EVALUATED: {
            label: "Not evaluated",
            tone: "slate",
            icon: Clock3,
            classes: "border-slate-200 bg-slate-100 text-slate-600",
            dot: "bg-slate-400",
        },
    };
    return map[key] || map.NOT_EVALUATED;
};

const severityClass = (severity = "") => {
    switch (String(severity).toUpperCase()) {
        case "CRITICAL": return "border-red-200 bg-red-50 text-red-700";
        case "HIGH": return "border-orange-200 bg-orange-50 text-orange-700";
        case "MEDIUM": return "border-amber-200 bg-amber-50 text-amber-700";
        case "LOW": return "border-sky-200 bg-sky-50 text-sky-700";
        default: return "border-slate-200 bg-slate-100 text-slate-600";
    }
};

function StatusBadge({ status }) {
    const config = checklistStatus(status);
    const Icon = config.icon;
    return (
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.classes}`}>
            <Icon size={13} />
            {config.label}
        </span>
    );
}

function SummaryCard({ label, value, hint, icon: Icon, accent = "slate", active, onClick }) {
    const accents = {
        slate: "text-slate-700 bg-slate-100",
        emerald: "text-emerald-700 bg-emerald-100/80",
        red: "text-rose-700 bg-rose-100/80",
        amber: "text-amber-700 bg-amber-100/80",
        blue: "text-sky-700 bg-sky-100/80",
        violet: "text-violet-700 bg-violet-100/80",
    };
    const surfaces = {
        slate: "from-slate-50 to-white border-slate-200",
        emerald: "from-emerald-50/90 to-white border-emerald-100",
        red: "from-rose-50/90 to-white border-rose-100",
        amber: "from-amber-50/90 to-white border-amber-100",
        blue: "from-sky-50/90 to-white border-sky-100",
        violet: "from-violet-50/90 to-white border-violet-100",
    };
    const content = (
        <>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value ?? 0}</p>
                </div>
                {Icon && <span className={`rounded-xl p-2.5 shadow-sm transition-transform duration-300 group-hover:scale-110 ${accents[accent] || accents.slate}`}><Icon size={19} /></span>}
            </div>
            {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
        </>
    );
    const className = `group rounded-2xl border bg-gradient-to-br p-4 text-left shadow-sm transition-all duration-300 ease-out ${surfaces[accent] || surfaces.slate} ${active ? "-translate-y-0.5 ring-2 ring-sky-200 shadow-md" : ""} ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" : ""} animate-card-in`;
    return onClick ? <button type="button" onClick={onClick} className={className}>{content}</button> : <div className={className}>{content}</div>;
}

function ChecklistItem({ item, expanded, onToggle }) {
    const checklist = item?.checklist || item || {};
    const status = String(checklist.status || "NOT_EVALUATED").toUpperCase();
    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="flex w-full items-start gap-3 p-4 text-left sm:items-center"
            >
                <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${checklistStatus(status).dot}`} />
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold tracking-wide text-slate-500">{checklist.code || "Checklist item"}</span>
                        {checklist.clause && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{checklist.clause}</span>}
                    </span>
                    <span className="mt-1.5 block text-sm font-medium leading-6 text-slate-800">{checklist.description || "No description available."}</span>
                </span>
                <span className="hidden shrink-0 sm:block"><StatusBadge status={status} /></span>
                <span className="mt-1 shrink-0 text-slate-400">{expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
            </button>
            <div className="px-4 pb-3 sm:hidden"><StatusBadge status={status} /></div>
            {expanded && (
                <div className="animate-card-in border-t border-sky-100 bg-gradient-to-br from-sky-50/60 via-white to-indigo-50/40 px-4 py-4 sm:pl-10">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assessment observation</p>
                            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                {checklist.comment || "No additional assessment comment was provided."}
                            </p>
                        </div>
                        <div className="text-xs text-slate-400">Version {checklist.version || "—"}</div>
                    </div>
                    {status === "NOT_EVALUATED" && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
                            <Info size={15} className="mt-0.5 shrink-0 text-slate-400" />
                            This item was not evaluated by the current scanner. It should not be interpreted as a confirmed compliance failure.
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

function ScannerSeverityBadge({ severity }) {
    const value = String(severity || "").toUpperCase();
    const styles = {
        CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
        HIGH: "border-orange-200 bg-orange-50 text-orange-700",
        MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
        LOW: "border-sky-200 bg-sky-50 text-sky-700",
        INFO: "border-slate-200 bg-slate-100 text-slate-600",
    };

    if (!value) {
        return <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">Severity unavailable</span>;
    }

    return (
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[value] || styles.INFO}`}>
            {titleCase(value)} severity
        </span>
    );
}

function ScannerCard({ scanner, index }) {
    const [expanded, setExpanded] = useState(false);
    const issues = Array.isArray(scanner.issues) ? scanner.issues : [];
    const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
    const issueSeverities = issues
        .map((issue) => String(issue?.severity || "").toUpperCase())
        .filter((severity) => severityOrder.includes(severity));
    // Show the highest severity reported by this scanner, rather than the
    // checklist-style REVIEW / NOT_EVALUATED status.
    const highestSeverity = severityOrder.find((severity) => issueSeverities.includes(severity)) || "";
    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:border-indigo-200 hover:shadow-md">
            <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center gap-3 bg-gradient-to-r from-slate-50/70 to-white p-4 text-left transition-colors hover:from-indigo-50/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"><ShieldCheck size={18} /></span>
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">{titleCase(scanner.scanner || `Security check ${index + 1}`)}</span>
                    <span className="mt-1 block text-xs text-slate-500">{issues.length} {issues.length === 1 ? "finding" : "findings"}</span>
                </span>
                <ScannerSeverityBadge severity={highestSeverity} />
                {expanded ? <ChevronDown size={17} className="text-slate-400" /> : <ChevronRight size={17} className="text-slate-400" />}
            </button>
            {expanded && (
                <div className="animate-card-in space-y-3 border-t border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-4">
                    {issues.length ? issues.map((issue, issueIndex) => (
                        <div key={`${issue.title || "finding"}-${issueIndex}`} className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800">{issue.title || "Technical finding"}</p>
                                {issue.severity && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${severityClass(issue.severity)}`}>{titleCase(issue.severity)}</span>}
                            </div>
                            {issue.description && <p className="mt-2 text-sm leading-6 text-slate-600">{issue.description}</p>}
                            {issue.recommendation && <div className="mt-3 rounded-lg bg-blue-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Recommended action</p><p className="mt-1 text-sm leading-6 text-blue-900">{issue.recommendation}</p></div>}
                        </div>
                    )) : <p className="text-sm text-slate-500">No findings were reported by this check.</p>}
                </div>
            )}
        </article>
    );
}

export default function SelfCheckDataBreachResult({ publicAuditId }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [checklistReport, setChecklistReport] = useState(null);
    const [checklistLoading, setChecklistLoading] = useState(true);
    const [checklistError, setChecklistError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [expandedItems, setExpandedItems] = useState({});
    const [technicalOpen, setTechnicalOpen] = useState(true);

    const loadResult = useCallback(async (manual = false) => {
        if (!publicAuditId) {
            setError("Public Audit ID is missing.");
            setLoading(false);
            setChecklistLoading(false);
            return;
        }
        if (manual) setRefreshing(true);
        setError("");
        setChecklistError("");
        setLoading(true);
        setChecklistLoading(true);

        const technicalRequest = (async () => {
            try {
                const response = await breachApi(
                    `/api/scanner/webscan/${encodeURIComponent(publicAuditId)}/`,
                    { method: "GET" }
                );
                if (!response?.success) {
                    throw new Error(response?.message || response?.error_message || "Unable to retrieve the scan result.");
                }
                setResult(response);
            } catch (err) {
                setError(err?.message || "Unable to load the technical scan result.");
                setResult(null);
            } finally {
                setLoading(false);
            }
        })();

        const checklistRequest = (async () => {
            try {
                const data = await getDataBreachChecklistReport(publicAuditId);
                setChecklistReport(data);
            } catch (err) {
                setChecklistError(err?.message || "Unable to load the checklist assessment.");
                setChecklistReport(null);
            } finally {
                setChecklistLoading(false);
            }
        })();

        await Promise.all([technicalRequest, checklistRequest]);
        setRefreshing(false);
    }, [publicAuditId]);

    useEffect(() => {
        loadResult();
    }, [loadResult]);

    const checklistItems = useMemo(() => {
        const items = Array.isArray(checklistReport?.checklists) ? checklistReport.checklists : [];
        return items.map((item) => item?.checklist || item).filter(Boolean);
    }, [checklistReport]);

    // Only checklist entries that received an assessment are shown as
    // crawler-generated/evaluated findings. NOT_EVALUATED entries belong to
    // the broader checklist catalogue and are not counted as scan findings.
    const crawlerChecklistItems = useMemo(
        () => checklistItems.filter(
            (item) => String(item.status || "NOT_EVALUATED").toUpperCase() !== "NOT_EVALUATED"
        ),
        [checklistItems]
    );

    const checklistSummary = checklistReport?.summary || {};
    const statusCounts = useMemo(() => {
        const counts = {
            COMPLIANT: 0,
            NON_COMPLIANT: 0,
            PARTIALLY_COMPLIANT: 0,
            REVIEW: 0,
            NOT_EVALUATED: 0,
            NOT_APPLICABLE: 0,
        };
        crawlerChecklistItems.forEach((item) => {
            const key = String(item.status || "NOT_EVALUATED").toUpperCase();
            if (key in counts) counts[key] += 1;
        });
        return counts;
    }, [crawlerChecklistItems]);

    const filteredItems = useMemo(() => {
        if (filter === "ALL") return crawlerChecklistItems;
        return crawlerChecklistItems.filter((item) => String(item.status || "NOT_EVALUATED").toUpperCase() === filter);
    }, [crawlerChecklistItems, filter]);

    const scan = result?.scan || {};
    const summary = result?.summary || {};
    const executionGate = result?.execution_gate || {};
    const scanners = Array.isArray(result?.scanners) ? result.scanners : [];
    const indicators = Array.isArray(scan.personal_data_indicators) ? scan.personal_data_indicators : [];
    const skippedScanners = Array.isArray(summary.skipped_scanners) ? summary.skipped_scanners : [];
    const severityCounts = summary.severity_counts || {};
    const piiDetected = scan.pii_detected === true;

    const toggleItem = (id) => setExpandedItems((current) => ({ ...current, [id]: !current[id] }));

    if (loading && !result && checklistLoading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <RefreshCw size={24} className="mx-auto animate-spin text-blue-600" />
                <p className="mt-4 text-sm font-medium text-slate-700">Preparing your Data Breach assessment</p>
                <p className="mt-1 text-xs text-slate-500">Retrieving technical findings and checklist evaluation…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-slate-700">
            <style>{`
                @keyframes card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bar-grow { from { width: 0; } to { width: var(--bar-width); } }
                @keyframes soft-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); } 50% { box-shadow: 0 0 0 5px rgba(14,165,233,.08); } }
                .animate-card-in { animation: card-in .45s ease-out both; }
                .animate-bar-grow { animation: bar-grow .9s cubic-bezier(.2,.8,.2,1) both; }
                .animate-soft-pulse { animation: soft-pulse 2.8s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) { .animate-card-in, .animate-bar-grow, .animate-soft-pulse { animation: none !important; } }
            `}</style>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ShieldAlert size={22} /></span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">PII-in-Transit Scanner</p>
                                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Data Breach Assessment</h2>
                                <p className="mt-1 break-all text-sm text-slate-500">{publicAuditId}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => loadResult(true)} disabled={refreshing || loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500"><Globe size={14} className="shrink-0" /><span className="truncate">{result?.target_url || checklistReport?.audit?.target_url || "Website not available"}</span></div>
                        <div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /><span>Completed: {formatDate(result?.completed_at || checklistReport?.audit?.completed_at)}</span></div>
                    </div>
                </div>

                {(error || checklistError) && (
                    <div className="space-y-2 p-5">
                        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
                        {checklistError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{checklistError}</div>}
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md animate-card-in">
                <button type="button" onClick={() => setTechnicalOpen((value) => !value)} className="flex w-full items-center gap-3 bg-gradient-to-r from-sky-50/80 via-white to-indigo-50/50 p-5 text-left transition-colors hover:from-sky-50 sm:p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100"><ShieldCheck size={20} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900">Technical assessment</span><span className="mt-1 block text-sm text-slate-500">Review detected indicators, security checks and technical findings first</span></span>
                    {technicalOpen ? <ChevronDown size={19} className="text-slate-400" /> : <ChevronRight size={19} className="text-slate-400" />}
                </button>
                {technicalOpen && (
                    <div className="space-y-6 border-t border-slate-100 p-5 sm:p-6">
                        {result ? (
                            <>
                                <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <div><h4 className="text-sm font-semibold text-slate-800">Finding severity distribution</h4><p className="mt-0.5 text-xs text-slate-500">Breakdown of technical findings by severity</p></div>
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">{summary.findings_count ?? 0} total</span>
                                    </div>
                                    <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-label="Finding severity distribution">
                                        {[{key:"CRITICAL",color:"bg-rose-500"},{key:"HIGH",color:"bg-orange-400"},{key:"MEDIUM",color:"bg-amber-400"},{key:"LOW",color:"bg-sky-400"},{key:"INFO",color:"bg-slate-400"}].map(({key,color}) => {
                                            const total = Number(summary.findings_count || 0);
                                            const count = Number(severityCounts[key] || 0);
                                            return count > 0 && total > 0 ? <span key={key} className={`${color} animate-bar-grow`} style={{width:`${(count / total) * 100}%`,"--bar-width":`${(count / total) * 100}%`}} title={`${titleCase(key)}: ${count}`} /> : null;
                                        })}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                        {[{key:"CRITICAL",dot:"bg-rose-500",tone:"text-rose-700",surface:"bg-rose-50"},{key:"HIGH",dot:"bg-orange-400",tone:"text-orange-700",surface:"bg-orange-50"},{key:"MEDIUM",dot:"bg-amber-400",tone:"text-amber-700",surface:"bg-amber-50"},{key:"LOW",dot:"bg-sky-400",tone:"text-sky-700",surface:"bg-sky-50"},{key:"INFO",dot:"bg-slate-400",tone:"text-slate-600",surface:"bg-slate-50"}].map(({key,dot,tone,surface}) => <div key={key} className={`flex items-center justify-between rounded-xl ${surface} px-3 py-2`}><span className="flex items-center gap-2 text-xs text-slate-600"><span className={`h-2 w-2 rounded-full ${dot}`} />{titleCase(key)}</span><span className={`text-sm font-bold tabular-nums ${tone}`}>{severityCounts[key] ?? 0}</span></div>)}
                                    </div>
                                </div>
                                {scanners.length > 0 ? <div className="space-y-2"><h4 className="text-sm font-semibold text-slate-800">Individual security checks</h4>{scanners.map((scanner, index) => <ScannerCard key={`${scanner.scanner || "scanner"}-${index}`} scanner={scanner} index={index} />)}</div> : <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-700">No additional security checks were performed</p><p className="mt-1 text-sm leading-6 text-slate-500">{executionGate.reason ? titleCase(executionGate.reason) : "Additional checks may have been skipped based on the initial scan result."}</p></div>}
                                {skippedScanners.length > 0 && <div><h4 className="text-sm font-semibold text-slate-800">Checks not performed</h4><div className="mt-2 flex flex-wrap gap-2">{skippedScanners.map((name) => <span key={name} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">{titleCase(name)}</span>)}</div></div>}
                                <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Scan started</p><p className="mt-1 text-sm text-slate-600">{formatDate(result.started_at)}</p></div><div><p className="text-xs text-slate-400">Scan completed</p><p className="mt-1 text-sm text-slate-600">{formatDate(result.completed_at)}</p></div></div>
                            </>
                        ) : <p className="text-sm text-slate-500">Technical scan details are unavailable.</p>}
                    </div>
                )}
            </section>


            <section className="space-y-3 animate-card-in">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">Compliance snapshot</h3>
                        <p className="mt-1 text-sm text-slate-500">A status-based view of the checklist evaluation.</p>
                    </div>
                    <span className="text-xs text-slate-400">{crawlerChecklistItems.length} checklist items assessed by crawler</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Compliant" value={statusCounts.COMPLIANT} hint="Requirements met" icon={CheckCircle2} accent="emerald" active={filter === "COMPLIANT"} onClick={() => setFilter(filter === "COMPLIANT" ? "ALL" : "COMPLIANT")} />
                    <SummaryCard label="Non-compliant" value={statusCounts.NON_COMPLIANT} hint="Action required" icon={XCircle} accent="red" active={filter === "NON_COMPLIANT"} onClick={() => setFilter(filter === "NON_COMPLIANT" ? "ALL" : "NON_COMPLIANT")} />
                    <SummaryCard label="Partially compliant" value={statusCounts.PARTIALLY_COMPLIANT} hint="Improvement needed" icon={AlertTriangle} accent="amber" active={filter === "PARTIALLY_COMPLIANT"} onClick={() => setFilter(filter === "PARTIALLY_COMPLIANT" ? "ALL" : "PARTIALLY_COMPLIANT")} />
                    <SummaryCard label="Requires review" value={statusCounts.REVIEW} hint="Manual verification" icon={Info} accent="blue" active={filter === "REVIEW"} onClick={() => setFilter(filter === "REVIEW" ? "ALL" : "REVIEW")} />
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md animate-card-in">
                <div className="flex flex-col gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-sky-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2"><FileCheck2 size={18} className="text-blue-700" /><h3 className="font-semibold text-slate-900">Checklist assessment</h3></div>
                        <p className="mt-1 text-sm text-slate-500">Showing only checklist items assessed by the crawler. Select an item to inspect its observation.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><span className="rounded-md bg-slate-100 px-2.5 py-1.5 font-semibold">{filteredItems.length} of {crawlerChecklistItems.length} shown</span><button type="button" onClick={() => setFilter("ALL")} className="font-semibold text-blue-700 hover:text-blue-900">Clear filter</button></div>
                </div>
                <div className="space-y-2 bg-gradient-to-b from-slate-50/60 to-white p-4 sm:p-5">
                    {checklistLoading ? (
                        <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><RefreshCw size={16} className="animate-spin" />Loading checklist items…</div>
                    ) : filteredItems.length ? filteredItems.map((item, index) => {
                        const key = item.id ?? item.code ?? index;
                        return <ChecklistItem key={key} item={item} expanded={!!expandedItems[key]} onToggle={() => toggleItem(key)} />;
                    }) : (
                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                            <Info size={22} className="mx-auto text-slate-400" />
                            <p className="mt-2 text-sm font-medium text-slate-700">No crawler-assessed checklist items in this category</p>
                            <p className="mt-1 text-xs text-slate-500">Choose another status or clear the filter.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                <Info size={15} className="mt-0.5 shrink-0" />
                Automated scan results are indicative technical observations. Items marked “Requires review” or “Not evaluated” need further verification and should not be treated as confirmed compliance outcomes.
            </div>
        </div>
    );
}
