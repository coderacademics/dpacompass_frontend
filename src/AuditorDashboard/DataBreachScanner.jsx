import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiActivity,
    FiAlertCircle,
    FiArrowLeft,
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
    FiClock,
    FiExternalLink,
    FiEye,
    FiFileText,
    FiInbox,
    FiLoader,
    FiPlay,
    FiRefreshCw,
    FiSearch,
    FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";
import AuditViewModal from "./AuditViewModal";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

// Local styles only. The surrounding DashboardLayout owns the sidebar,
// page background, and shared footer.
const pageStyles = String.raw`
.bs-page {
    --bs-ink: #17324f; --bs-muted: #64788d; --bs-line: #dfe7f0;
    --bs-blue: #205b90;
    width: 100%; min-width: 0; color: var(--bs-ink); font-size: 14px;
}
.bs-page *, .bs-page *::before, .bs-page *::after { box-sizing: border-box; }
.bs-page button, .bs-page input, .bs-page select { font: inherit; }
.bs-page :is(button,input,select):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.bs-page button:disabled { opacity: .48; cursor: not-allowed; }
.bs-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.bs-crumb { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; color: var(--bs-muted); font-size: 13px; }
.bs-crumb strong { color: var(--bs-ink); }
.bs-top-actions { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.bs-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 9px 13px; border: 1px solid #d6e2ed; border-radius: 9px; color: #285676; background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
.bs-button:hover:not(:disabled) { background: #eff5fb; }
.bs-button--primary { color: #fff; background: var(--bs-blue); border-color: var(--bs-blue); }
.bs-button--primary:hover:not(:disabled) { background: #17476f; }
.bs-heading { margin-bottom: 22px; }
.bs-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; color: #386b96; font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.bs-title { margin: 0; font-size: clamp(23px,2vw,29px); line-height: 1.25; letter-spacing: -.025em; font-weight: 760; }
.bs-description { margin: 7px 0 0; color: var(--bs-muted); line-height: 1.6; max-width: 790px; }
.bs-panel { min-width: 0; overflow: hidden; background: #fff; border: 1px solid var(--bs-line); border-radius: 14px; box-shadow: 0 4px 22px rgba(23,50,79,.035); }
.bs-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 19px 20px; border-bottom: 1px solid var(--bs-line); }
.bs-register-title { margin: 0; font-size: 17px; font-weight: 750; }
.bs-register-subtitle { margin: 4px 0 0; color: var(--bs-muted); font-size: 12px; }
.bs-filters { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.bs-search { display: flex; align-items: center; gap: 9px; width: min(100%,300px); min-height: 40px; padding: 0 12px; border: 1px solid #d5e0eb; border-radius: 9px; background: #f9fbfe; color: #68829b; }
.bs-search:focus-within { border-color: #93b9dd; box-shadow: 0 0 0 3px #e4f0ff; }
.bs-search input { border: 0; outline: 0; width: 100%; min-width: 0; color: var(--bs-ink); background: transparent; }
.bs-select { min-height: 40px; padding: 8px 11px; border: 1px solid #d5e0eb; border-radius: 9px; color: #31526e; background: #fff; cursor: pointer; }
.bs-tabs { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; padding: 11px 20px; background: #fbfcfe; border-bottom: 1px solid var(--bs-line); }
.bs-tab { display: inline-flex; align-items: center; gap: 7px; min-height: 33px; padding: 7px 11px; border-radius: 8px; border: 1px solid #e0e8f0; background: #fff; color: #536d83; font-size: 12px; font-weight: 700; cursor: pointer; }
.bs-tab:hover { background: #eff5fb; }
.bs-tab[aria-pressed="true"] { color: #205b90; background: #eaf3fc; border-color: #b8d3eb; }
.bs-tab-count { display: grid; place-items: center; min-width: 21px; height: 21px; padding: 0 5px; background: #f0f4f8; color: #3f5b72; border-radius: 6px; font-size: 11px; }
.bs-tab[aria-pressed="true"] .bs-tab-count { background: #fff; color: #205b90; }
.bs-table-scroll { width: 100%; overflow-x: auto; }
.bs-table { width: 100%; min-width: 1010px; border-collapse: collapse; text-align: left; }
.bs-table thead { background: #f6f9fc; }
.bs-table th { padding: 14px 16px; color: #526c83; font-size: 12px; font-weight: 750; white-space: nowrap; border-bottom: 1px solid var(--bs-line); }
.bs-table td { padding: 16px; color: #38556d; font-size: 13px; vertical-align: middle; border-bottom: 1px solid #edf1f5; }
.bs-table tbody tr.bs-row:hover { background: #f9fbfe; }
.bs-application { display: flex; align-items: flex-start; gap: 11px; min-width: 210px; }
.bs-app-icon { display: grid; place-items: center; flex: 0 0 35px; width: 35px; height: 35px; border-radius: 9px; color: #245c90; background: #edf4fb; }
.bs-app-name { color: #193955; font-size: 14px; font-weight: 750; overflow-wrap: anywhere; }
.bs-app-id { margin-top: 4px; color: #74889b; font-size: 11px; overflow-wrap: anywhere; }
.bs-expand { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; padding: 0; color: var(--bs-blue); background: transparent; border: 0; font-size: 12px; font-weight: 650; cursor: pointer; }
.bs-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid; border-radius: 999px; font-size: 12px; font-weight: 750; white-space: nowrap; }
.bs-status--pending { color: #916512; background: #fffbeb; border-color: #f3dea3; }
.bs-status--running { color: #205b90; background: #edf5fe; border-color: #c6def3; }
.bs-status--completed { color: #16724f; background: #effaf4; border-color: #b9e1ce; }
.bs-status--failed { color: #b42332; background: #fff1f2; border-color: #f0c6ca; }
.bs-faint { color: #7890a4; font-size: 12px; }
.bs-date { display: inline-flex; align-items: flex-start; gap: 7px; line-height: 1.5; }
.bs-date svg { margin-top: 2px; flex-shrink: 0; }
.bs-progress { display: flex; flex-direction: column; gap: 5px; min-width: 105px; }
.bs-progress-track { width: 100%; height: 6px; overflow: hidden; background: #e7eef5; border-radius: 99px; }
.bs-progress-fill { height: 100%; background: #3878ab; border-radius: inherit; transition: width .25s ease; }
.bs-progress-label { color: #547189; font-size: 11px; font-variant-numeric: tabular-nums; }
.bs-actions { display: flex; align-items: center; justify-content: flex-end; gap: 7px; flex-wrap: wrap; }
.bs-action { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; padding: 8px 10px; border: 1px solid #c9dff3; border-radius: 8px; background: #eef5fd; color: var(--bs-blue); font-size: 12px; font-weight: 700; white-space: nowrap; cursor: pointer; }
.bs-action:hover:not(:disabled) { background: #dcecfb; border-color: #a8c8e5; }
.bs-action--primary { background: var(--bs-blue); color: #fff; border-color: var(--bs-blue); }
.bs-action--primary:hover:not(:disabled) { background: #17476f; }
.bs-action--success { background: #f0faf4; color: #16724f; border-color: #b9e1ce; }
.bs-action--success:hover:not(:disabled) { background: #e2f4e9; }
.bs-details-row td { padding: 0 16px 15px; background: #f9fbfe; }
.bs-details { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; padding: 16px; border: 1px solid #dce7f1; border-radius: 10px; background: #fff; }
.bs-detail-label { color: #74889b; font-size: 11px; font-weight: 750; text-transform: uppercase; letter-spacing: .02em; }
.bs-detail-value { margin-top: 5px; color: #2d4961; line-height: 1.55; overflow-wrap: anywhere; }
.bs-detail-wide { grid-column: 1 / -1; }
.bs-detail-error { padding: 12px 14px; border: 1px solid #f1d8dc; border-radius: 9px; background: #fff8f8; color: #93313b; white-space: pre-wrap; }
.bs-link { color: var(--bs-blue); text-decoration: underline; text-underline-offset: 3px; }
.bs-row-error { margin: 7px 0 0; color: #b42332; font-size: 11px; line-height: 1.45; max-width: 220px; overflow-wrap: anywhere; }
.bs-alert { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; padding: 14px 16px; background: #fff7f7; border: 1px solid #f3ccd2; border-radius: 10px; color: #9f2839; font-size: 13px; }
.bs-alert svg { margin-top: 2px; flex-shrink: 0; }
.bs-alert button { color: #8b2c36; text-decoration: underline; font-weight: 700; cursor: pointer; }
.bs-empty { display: grid; justify-items: center; gap: 9px; padding: 48px 20px; text-align: center; color: var(--bs-muted); }
.bs-empty-icon { color: #7c9cba; font-size: 32px; }
.bs-empty-title { margin: 0; color: var(--bs-ink); font-size: 17px; font-weight: 750; }
.bs-empty p { max-width: 490px; margin: 0; line-height: 1.6; }
.bs-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid var(--bs-line); color: var(--bs-muted); font-size: 12px; }
.bs-pager { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.bs-pager-button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #dce5ee; border-radius: 7px; color: var(--bs-blue); background: #fff; cursor: pointer; }
.bs-pager-button:hover:not(:disabled) { background: #eff5fb; }
.bs-mobile-list { display: none; }
.bs-mobile-card { padding: 16px; border-bottom: 1px solid var(--bs-line); }
.bs-mobile-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.bs-mobile-meta { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 15px 0; }
.bs-mobile-meta dt { color: var(--bs-muted); font-size: 11px; font-weight: 750; }
.bs-mobile-meta dd { margin: 5px 0 0; color: var(--bs-ink); font-size: 13px; overflow-wrap: anywhere; }
.bs-mobile-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bs-mobile-actions .bs-action { flex: 1; }
.bs-mobile-details { margin-top: 13px; }
.bs-mobile-details .bs-details { grid-template-columns: 1fr; }
.bs-spin { animation: bs-spin .9s linear infinite; }
@keyframes bs-spin { to { transform: rotate(360deg); } }
@media (max-width: 1020px) {
    .bs-table-scroll { display: none; }
    .bs-mobile-list { display: block; }
    .bs-filters { width: 100%; }
    .bs-search { flex: 1; width: auto; }
}
@media (max-width: 640px) {
    .bs-top-actions { width: 100%; }
    .bs-top-actions .bs-button { flex: 1; }
    .bs-toolbar { padding: 16px; }
    .bs-filters { flex-direction: column; align-items: stretch; }
    .bs-search, .bs-select { width: 100%; }
    .bs-tabs { padding: 10px 14px; }
    .bs-tab { flex: 1; justify-content: center; }
    .bs-mobile-head { flex-direction: column; }
    .bs-footer { padding: 13px 16px; }
}
@media (prefers-reduced-motion: reduce) { .bs-spin { animation: none; } .bs-progress-fill { transition: none; } }
`;

const STATUS_OPTIONS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "running", label: "Running" },
    { key: "completed", label: "Completed" },
    { key: "failed", label: "Failed" },
];

function extractList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    return null;
}

function getScanStatus(status) {
    const value = String(status || "NOT_EXECUTED").toUpperCase();
    if (value === "RUNNING") return "running";
    if (value === "COMPLETED") return "completed";
    if (value === "FAILED") return "failed";
    return "pending";
}

function normalizeAudit(audit, index) {
    const application = audit.application || {};
    const auditor = audit.auditor || {};
    const breachTool = audit.tools?.breach_management || {};
    const scanStatus = getScanStatus(breachTool.status);
    const rawProgress = Number(breachTool.progress);

    return {
        id: audit.audit_id,
        audit_id: audit.audit_id,
        public_audit_id: audit.public_audit_id,
        rowKey: audit.public_audit_id != null
            ? `public-${audit.public_audit_id}`
            : audit.audit_id != null
                ? `audit-${audit.audit_id}`
                : `fallback-${application.id ?? "application"}-${index}`,
        application_id: application.id,
        name: application.name || "Application name unavailable",
        auditor_name: auditor.username || auditor.name || "Not provided",
        url: application.url || "",
        status: audit.dpacompass_status || "assigned",
        scan_status: scanStatus,
        tool_status: String(breachTool.status || "NOT_EXECUTED").toUpperCase(),
        tool_exists: Boolean(breachTool.exists),
        progress: breachTool.progress == null || !Number.isFinite(rawProgress)
            ? null : Math.max(0, Math.min(100, rawProgress)),
        started_at: breachTool.started_at || null,
        completed_at: breachTool.completed_at || null,
        error_message: breachTool.error_message || null,
        findings_count: breachTool.findings_count ?? null,
        application,
        auditor,
        original_audit: audit,
    };
}

function formatDateTime(value) {
    if (!value) return "Not provided";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not provided";
    return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
}

function safeWebUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function ScanStatus({ status }) {
    const icons = {
        pending: FiClock,
        running: FiActivity,
        completed: FiCheckCircle,
        failed: FiAlertCircle,
    };
    const Icon = icons[status] || FiClock;
    return (
        <span className={`bs-status bs-status--${status}`}>
            <Icon aria-hidden="true" />
            {status === "pending" ? "Pending" : status === "running" ? "Running" :
                status === "completed" ? "Completed" : "Failed"}
        </span>
    );
}

function ProgressSummary({ audit }) {
    if (audit.scan_status === "running") {
        return audit.progress === null ? <span className="bs-faint">In progress</span> : (
            <div className="bs-progress">
                <div className="bs-progress-track" role="progressbar"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={audit.progress}
                    aria-label="Scan progress">
                    <div className="bs-progress-fill" style={{ width: `${audit.progress}%` }} />
                </div>
                <span className="bs-progress-label">{audit.progress}%</span>
            </div>
        );
    }
    if (audit.scan_status === "completed") {
        return audit.findings_count == null
            ? <span className="bs-faint">Scan complete</span>
            : <span>{audit.findings_count} findings</span>;
    }
    if (audit.scan_status === "failed") {
        return <span className="bs-faint">Scan unsuccessful</span>;
    }
    return <span className="bs-faint">Not started</span>;
}

function AuditDetails({ audit }) {
    return (
        <div className="bs-details">
            <div>
                <div className="bs-detail-label">Audit ID</div>
                <div className="bs-detail-value">{audit.audit_id ?? "Not available"}</div>
            </div>
            <div>
                <div className="bs-detail-label">Public Audit ID</div>
                <div className="bs-detail-value">{audit.public_audit_id || "Not available"}</div>
            </div>
            <div>
                <div className="bs-detail-label">Application URL</div>
                <div className="bs-detail-value">
                    {safeWebUrl(audit.url) ? (
                        <a className="bs-link" href={audit.url} target="_blank" rel="noopener noreferrer">
                            {audit.url} <FiExternalLink style={{ display: "inline" }} aria-hidden="true" />
                        </a>
                    ) : (audit.url || "Not provided")}
                </div>
            </div>
            <div>
                <div className="bs-detail-label">Backend Tool Status</div>
                <div className="bs-detail-value">{audit.tool_status}</div>
            </div>
            <div>
                <div className="bs-detail-label">Scan Started</div>
                <div className="bs-detail-value">{formatDateTime(audit.started_at)}</div>
            </div>
            <div>
                <div className="bs-detail-label">Scan Completed</div>
                <div className="bs-detail-value">{formatDateTime(audit.completed_at)}</div>
            </div>
            {audit.error_message && (
                <div className="bs-detail-wide bs-detail-error">
                    <div className="bs-detail-label" style={{ color: "#9f2839" }}>Scan Error</div>
                    <div className="bs-detail-value" style={{ color: "#93313b", whiteSpace: "pre-wrap" }}>
                        {audit.error_message}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DataBreachScanner() {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [mappingAuditId, setMappingAuditId] = useState(null);
    const [activeStatus, setActiveStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(() => new Set());
    const [lastUpdated, setLastUpdated] = useState(null);

    const inFlightRef = useRef(false);
    const mountedRef = useRef(false);
    const mappingRef = useRef(false);

    // Preserve the existing automatic refresh interval (4 seconds).
    // The in-flight guard prevents overlapping requests.
    const fetchDataBreachAudits = useCallback(async (mode = "poll") => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        if (mode === "manual") setRefreshing(true);
        if (mode === "initial") setLoading(true);

        try {
            const res = await fetchWithAuth("/api/audits/assigned/tool-status/", {
                method: "GET",
                headers: { Accept: "application/json" },
            });
            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(payload?.message || payload?.error ||
                    "Failed to fetch audit tool statuses.");
            }
            const records = extractList(payload);
            if (!records) {
                throw new Error("The server did not return an audit list.");
            }
            if (mountedRef.current) {
                setAudits(records.map(normalizeAudit));
                setLastUpdated(new Date());
                setError("");
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err?.message || "Failed to load scan status.");
            }
            console.error("PII-in-Transit Scanner fetch error:", err);
        } finally {
            inFlightRef.current = false;
            if (mountedRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        void fetchDataBreachAudits("initial");
        const interval = window.setInterval(() => {
            void fetchDataBreachAudits("poll");
        }, 4000);
        return () => {
            mountedRef.current = false;
            window.clearInterval(interval);
        };
    }, [fetchDataBreachAudits]);

    const counts = useMemo(() => ({
        all: audits.length,
        pending: audits.filter((a) => a.scan_status === "pending").length,
        running: audits.filter((a) => a.scan_status === "running").length,
        completed: audits.filter((a) => a.scan_status === "completed").length,
        failed: audits.filter((a) => a.scan_status === "failed").length,
    }), [audits]);

    const filteredAudits = useMemo(() => {
        const needle = search.trim().toLowerCase();
        const records = audits.filter((audit) =>
            (activeStatus === "all" || audit.scan_status === activeStatus) &&
            (!needle || [audit.name, audit.audit_id, audit.public_audit_id,
            audit.application_id, audit.auditor_name, audit.url,
            audit.scan_status, audit.error_message]
                .some((value) => String(value ?? "").toLowerCase().includes(needle)))
        );
        return [...records].sort((a, b) => {
            if (sort === "name") return a.name.localeCompare(b.name);
            const date = (value) => {
                const ms = new Date(value || "").getTime();
                return Number.isFinite(ms) ? ms : 0;
            };
            const delta = date(a.started_at || a.completed_at) -
                date(b.started_at || b.completed_at);
            return sort === "oldest" ? delta : -delta;
        });
    }, [audits, activeStatus, search, sort]);

    const pageCount = Math.max(1, Math.ceil(filteredAudits.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visibleAudits = filteredAudits.slice(
        (currentPage - 1) * pageSize, currentPage * pageSize
    );
    const rangeStart = filteredAudits.length ? (currentPage - 1) * pageSize + 1 : 0;
    const rangeEnd = Math.min(currentPage * pageSize, filteredAudits.length);

    const toggleExpanded = (key) => setExpanded((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });

    const handleScan = (audit) => {
        if (!audit?.audit_id) {
            toast.error("Audit ID is missing. Cannot configure the scan.");
            return;
        }
        if (!audit?.public_audit_id) {
            toast.error("Public Audit ID is missing.");
            return;
        }
        navigate(`/data-breach-scan-config/${encodeURIComponent(audit.audit_id)}`, {
            state: { audit },
        });
    };

    const handleViewScanResults = (audit) => {
        if (!audit?.public_audit_id) {
            toast.error("Public Audit ID is missing.");
            return;
        }
        navigate(`/user/data-breach-scan/${encodeURIComponent(audit.public_audit_id)}/result`, {
            state: {
                audit_id: audit.audit_id,
                public_audit_id: audit.public_audit_id,
                application: audit.application,
                auditor: audit.auditor,
            },
        });
    };

    const handleMapToChecklist = async (audit) => {
        const publicAuditId = audit?.public_audit_id;
        if (!publicAuditId) {
            toast.error("Public Audit ID is missing. Cannot map checklist results.");
            return;
        }
        if (mappingRef.current) return;
        mappingRef.current = true;
        setMappingAuditId(publicAuditId);
        try {
            const response = await fetchWithAuth(
                `/api/checklists/fetch-breach-result/${encodeURIComponent(publicAuditId)}/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                }
            );
            const result = await response.json().catch(() => ({}));
            if (!response.ok || result?.success !== true) {
                throw new Error(result?.message || result?.error ||
                    "Failed to map scanner results to the checklist.");
            }
            toast.success(`Checklist mapped successfully. ${result.total_saved ?? 0} results saved.`);
        } catch (err) {
            console.error("Scanner checklist mapping error:", err);
            toast.error(err?.message || "Unable to map scanner results to the checklist.");
        } finally {
            mappingRef.current = false;
            if (mountedRef.current) setMappingAuditId(null);
        }
    };

    const renderActions = (audit) => {
        const busy = mappingAuditId !== null;
        switch (audit.scan_status) {
            case "pending":
                return (
                    <div className="bs-actions">
                        <button type="button" className="bs-action"
                            onClick={() => setSelectedAudit(audit)} title="View application details">
                            <FiEye aria-hidden="true" /> View
                        </button>
                        <button type="button" className="bs-action bs-action--primary"
                            onClick={() => handleScan(audit)}
                            disabled={!audit.audit_id || !audit.public_audit_id}>
                            <FiPlay aria-hidden="true" /> Configure Scan
                        </button>
                    </div>
                );
            case "completed":
                return (
                    <div className="bs-actions">
                        <button type="button" className="bs-action"
                            disabled={!audit.public_audit_id}
                            onClick={() => handleViewScanResults(audit)}>
                            <FiEye aria-hidden="true" /> View Results
                        </button>
                        <button type="button" className="bs-action bs-action--success"
                            disabled={busy || !audit.public_audit_id}
                            onClick={() => handleMapToChecklist(audit)}>
                            {mappingAuditId === audit.public_audit_id ? (
                                <FiLoader className="bs-spin" aria-hidden="true" />
                            ) : <FiFileText aria-hidden="true" />}
                            {mappingAuditId === audit.public_audit_id ? "Mapping..." : "Map to Checklist"}
                        </button>
                    </div>
                );
            case "failed":
                return (
                    <div className="bs-actions">
                        <button type="button" className="bs-action"
                            disabled={!audit.public_audit_id}
                            onClick={() => handleViewScanResults(audit)}>
                            <FiEye aria-hidden="true" /> View Details
                        </button>
                    </div>
                );
            default:
                return <span className="bs-faint">Scan running</span>;
        }
    };

    return (
        <div className="bs-page">
            <style>{pageStyles}</style>

            <div className="bs-top">
                <nav className="bs-crumb" aria-label="Breadcrumb">
                    <FiShield aria-hidden="true" />
                    <span>Auditor Workspace</span>
                    <FiChevronRight aria-hidden="true" />
                    <strong aria-current="page">PII-in-Transit Scanner</strong>
                </nav>
                <div className="bs-top-actions">
                    <button type="button" className="bs-button"
                        onClick={() => navigate("/auditdashboard")}>
                        <FiArrowLeft aria-hidden="true" /> Dashboard
                    </button>
                    <button type="button" className="bs-button bs-button--primary"
                        disabled={loading || refreshing}
                        onClick={() => fetchDataBreachAudits("manual")}>
                        <FiRefreshCw className={refreshing ? "bs-spin" : ""} aria-hidden="true" />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            <header className="bs-heading">
                <p className="bs-kicker"><FiActivity aria-hidden="true" /> SECURITY TOOLS</p>
                <h1 className="bs-title">PII-in-Transit Scanner</h1>
                <p className="bs-description">
                    Monitor scan execution, review findings, and map completed results to audit checklists.
                    Status refreshes automatically every 4 seconds.
                </p>
            </header>

            {error && (
                <div className="bs-alert" role="alert">
                    <FiAlertCircle aria-hidden="true" />
                    <div>
                        <strong>Unable to refresh scan information.</strong>
                        <div style={{ marginTop: 5 }}>{error}</div>
                        <button type="button" style={{ marginTop: 8 }}
                            onClick={() => fetchDataBreachAudits("manual")}>Retry</button>
                    </div>
                </div>
            )}

            <section className="bs-panel" aria-labelledby="bs-register-title">
                <div className="bs-toolbar">
                    <div>
                        <h2 id="bs-register-title" className="bs-register-title">PII Scan Register</h2>
                        <p className="bs-register-subtitle">
                            {loading ? "Loading scanner assignments..." :
                                `${counts.all} assigned ${counts.all === 1 ? "audit" : "audits"}`}
                            {!loading && lastUpdated ? ` · Last updated ${lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}` : ""}
                        </p>
                    </div>
                    <div className="bs-filters">
                        <label className="bs-search">
                            <FiSearch aria-hidden="true" />
                            <input type="search" aria-label="Search scanner assignments"
                                placeholder="Search application, audit ID..."
                                value={search} onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }} />
                        </label>
                        <select className="bs-select" aria-label="Sort scanner assignments"
                            value={sort} onChange={(event) => {
                                setSort(event.target.value);
                                setPage(1);
                            }}>
                            <option value="name">Application A–Z</option>
                            <option value="newest">Most recent scan</option>
                            <option value="oldest">Oldest scan</option>
                        </select>
                    </div>
                </div>

                <div className="bs-tabs" aria-label="Filter by scan status">
                    {STATUS_OPTIONS.map(({ key, label }) => (
                        <button key={key} type="button" className="bs-tab"
                            aria-pressed={activeStatus === key}
                            onClick={() => { setActiveStatus(key); setPage(1); }}>
                            {label} <span className="bs-tab-count">{loading ? "—" : counts[key]}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="bs-empty" role="status">
                        <FiLoader className="bs-empty-icon bs-spin" aria-hidden="true" />
                        <p className="bs-empty-title">Loading scanner assignments</p>
                        <p>Retrieving audit applications and current scan statuses.</p>
                    </div>
                ) : filteredAudits.length === 0 ? (
                    <div className="bs-empty">
                        <FiInbox className="bs-empty-icon" aria-hidden="true" />
                        <p className="bs-empty-title">No matching scan records</p>
                        <p>{search ? "Try another search term or status filter." :
                            "There are no audit records for this scan status."}</p>
                    </div>
                ) : (
                    <>
                        <div className="bs-table-scroll">
                            <table className="bs-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Application</th>
                                        <th scope="col">Auditor</th>
                                        <th scope="col">Scan Status</th>
                                        <th scope="col">Progress / Findings</th>
                                        <th scope="col">Scan Activity</th>
                                        <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleAudits.map((audit) => {
                                        const isExpanded = expanded.has(audit.rowKey);
                                        const lastActivity = audit.completed_at || audit.started_at;
                                        return (
                                            <Fragment key={audit.rowKey}>
                                                <tr className="bs-row">
                                                    <td>
                                                        <div className="bs-application">
                                                            <span className="bs-app-icon"><FiFileText aria-hidden="true" /></span>
                                                            <div>
                                                                <div className="bs-app-name">{audit.name}</div>
                                                                <div className="bs-app-id">{audit.public_audit_id || "Public audit ID unavailable"}</div>
                                                                <button type="button" className="bs-expand"
                                                                    aria-expanded={isExpanded}
                                                                    onClick={() => toggleExpanded(audit.rowKey)}>
                                                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                                    {isExpanded ? "Less details" : "More details"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{audit.auditor_name}</td>
                                                    <td><ScanStatus status={audit.scan_status} /></td>
                                                    <td><ProgressSummary audit={audit} /></td>
                                                    <td>
                                                        {lastActivity ? (
                                                            <span className="bs-date">
                                                                <FiCalendar aria-hidden="true" />
                                                                {formatDateTime(lastActivity)}
                                                            </span>
                                                        ) : <span className="bs-faint">Not started</span>}
                                                    </td>
                                                    <td>{renderActions(audit)}</td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="bs-details-row">
                                                        <td colSpan={6}><AuditDetails audit={audit} /></td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="bs-mobile-list">
                            {visibleAudits.map((audit) => {
                                const isExpanded = expanded.has(audit.rowKey);
                                return (
                                    <article key={audit.rowKey} className="bs-mobile-card">
                                        <div className="bs-mobile-head">
                                            <div className="bs-application">
                                                <span className="bs-app-icon"><FiFileText aria-hidden="true" /></span>
                                                <div>
                                                    <div className="bs-app-name">{audit.name}</div>
                                                    <div className="bs-app-id">{audit.public_audit_id || "Public audit ID unavailable"}</div>
                                                </div>
                                            </div>
                                            <ScanStatus status={audit.scan_status} />
                                        </div>
                                        <dl className="bs-mobile-meta">
                                            <div><dt>Auditor</dt><dd>{audit.auditor_name}</dd></div>
                                            <div><dt>Progress / Findings</dt><dd><ProgressSummary audit={audit} /></dd></div>
                                            <div><dt>Started</dt><dd>{formatDateTime(audit.started_at)}</dd></div>
                                            <div><dt>Completed</dt><dd>{formatDateTime(audit.completed_at)}</dd></div>
                                        </dl>
                                        <div className="bs-mobile-actions">
                                            <button type="button" className="bs-expand"
                                                aria-expanded={isExpanded}
                                                onClick={() => toggleExpanded(audit.rowKey)}>
                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                {isExpanded ? "Less details" : "More details"}
                                            </button>
                                            {renderActions(audit)}
                                        </div>
                                        {isExpanded && (
                                            <div className="bs-mobile-details"><AuditDetails audit={audit} /></div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>

                        <div className="bs-footer">
                            <span>Showing {rangeStart}–{rangeEnd} of {filteredAudits.length} scans</span>
                            <div className="bs-pager">
                                <label htmlFor="bs-page-size">Rows per page</label>
                                <select id="bs-page-size" className="bs-select"
                                    value={pageSize} onChange={(event) => {
                                        setPageSize(Number(event.target.value));
                                        setPage(1);
                                    }}>
                                    {[10, 25, 50].map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <button type="button" className="bs-pager-button"
                                    aria-label="Previous page"
                                    disabled={currentPage <= 1}
                                    onClick={() => setPage((value) => Math.max(1, value - 1))}>
                                    <FiChevronLeft aria-hidden="true" />
                                </button>
                                <span>Page {currentPage} of {pageCount}</span>
                                <button type="button" className="bs-pager-button"
                                    aria-label="Next page"
                                    disabled={currentPage >= pageCount}
                                    onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                                    <FiChevronRight aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* Keep the existing view modal component unchanged. */}
            <AuditViewModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
        </div>
    );
}
