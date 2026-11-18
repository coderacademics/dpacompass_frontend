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
    FiClipboard,
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
import { fetchWithAuth } from "../../../utilities/fetchWithAuth";

// Page-specific styles only. DashboardLayout owns the sidebar, background and footer.
// Palette and spacing match the Declined Audits and PII-in-Transit Scanner registers.
const pageStyles = String.raw`
.cs-page {
    --cs-ink: #17324f; --cs-muted: #64788d; --cs-line: #dfe7f0;
    --cs-blue: #205b90;
    width: 100%; min-width: 0; color: var(--cs-ink); font-size: 14px;
}
.cs-page *, .cs-page *::before, .cs-page *::after { box-sizing: border-box; }
.cs-page button, .cs-page input, .cs-page select { font: inherit; }
.cs-page :is(button,input,select,a):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.cs-page button:disabled { opacity: .48; cursor: not-allowed; }
.cs-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.cs-crumb { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; color: var(--cs-muted); font-size: 13px; }
.cs-crumb strong { color: var(--cs-ink); }
.cs-top-actions { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.cs-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 9px 13px; border: 1px solid #d6e2ed; border-radius: 9px; color: #285676; background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
.cs-button:hover:not(:disabled) { background: #eff5fb; }
.cs-button--primary { color: #fff; background: var(--cs-blue); border-color: var(--cs-blue); }
.cs-button--primary:hover:not(:disabled) { background: #17476f; }
.cs-heading { margin-bottom: 22px; }
.cs-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; color: #386b96; font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.cs-title { margin: 0; font-size: clamp(23px,2vw,29px); line-height: 1.25; letter-spacing: -.025em; font-weight: 760; }
.cs-description { margin: 7px 0 0; color: var(--cs-muted); line-height: 1.6; max-width: 790px; }
.cs-panel { min-width: 0; overflow: hidden; background: #fff; border: 1px solid var(--cs-line); border-radius: 14px; box-shadow: 0 4px 22px rgba(23,50,79,.035); }
.cs-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 19px 20px; border-bottom: 1px solid var(--cs-line); }
.cs-register-title { margin: 0; font-size: 17px; font-weight: 750; }
.cs-register-subtitle { margin: 4px 0 0; color: var(--cs-muted); font-size: 12px; }
.cs-filters { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.cs-search { display: flex; align-items: center; gap: 9px; width: min(100%,300px); min-height: 40px; padding: 0 12px; border: 1px solid #d5e0eb; border-radius: 9px; background: #f9fbfe; color: #68829b; }
.cs-search:focus-within { border-color: #93b9dd; box-shadow: 0 0 0 3px #e4f0ff; }
.cs-search input { border: 0; outline: 0; width: 100%; min-width: 0; color: var(--cs-ink); background: transparent; }
.cs-select { min-height: 40px; padding: 8px 11px; border: 1px solid #d5e0eb; border-radius: 9px; color: #31526e; background: #fff; cursor: pointer; }
.cs-tabs { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; padding: 11px 20px; background: #fbfcfe; border-bottom: 1px solid var(--cs-line); }
.cs-tab { display: inline-flex; align-items: center; gap: 7px; min-height: 33px; padding: 7px 11px; border-radius: 8px; border: 1px solid #e0e8f0; background: #fff; color: #536d83; font-size: 12px; font-weight: 700; cursor: pointer; }
.cs-tab:hover { background: #eff5fb; }
.cs-tab[aria-pressed="true"] { color: #205b90; background: #eaf3fc; border-color: #b8d3eb; }
.cs-tab-count { display: grid; place-items: center; min-width: 21px; height: 21px; padding: 0 5px; background: #f0f4f8; color: #3f5b72; border-radius: 6px; font-size: 11px; }
.cs-tab[aria-pressed="true"] .cs-tab-count { background: #fff; color: #205b90; }
.cs-table-scroll { width: 100%; overflow-x: auto; }
.cs-table { width: 100%; min-width: 950px; border-collapse: collapse; text-align: left; }
.cs-table thead { background: #f6f9fc; }
.cs-table th { padding: 14px 16px; color: #526c83; font-size: 12px; font-weight: 750; white-space: nowrap; border-bottom: 1px solid var(--cs-line); }
.cs-table td { padding: 16px; color: #38556d; font-size: 13px; vertical-align: middle; border-bottom: 1px solid #edf1f5; }
.cs-table tbody tr.cs-row:hover { background: #f9fbfe; }
.cs-application { display: flex; align-items: flex-start; gap: 11px; min-width: 200px; }
.cs-app-icon { display: grid; place-items: center; flex: 0 0 35px; width: 35px; height: 35px; border-radius: 9px; color: #245c90; background: #edf4fb; }
.cs-app-name { color: #193955; font-size: 14px; font-weight: 750; overflow-wrap: anywhere; }
.cs-app-id { margin-top: 4px; color: #74889b; font-size: 11px; overflow-wrap: anywhere; }
.cs-expand { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; padding: 0; color: var(--cs-blue); background: transparent; border: 0; font-size: 12px; font-weight: 650; cursor: pointer; }
.cs-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid; border-radius: 999px; font-size: 12px; font-weight: 750; white-space: nowrap; }
.cs-status--pending { color: #916512; background: #fffbeb; border-color: #f3dea3; }
.cs-status--queued { color: #6a4baa; background: #f6f1ff; border-color: #ded0fa; }
.cs-status--running { color: #205b90; background: #edf5fe; border-color: #c6def3; }
.cs-status--completed { color: #16724f; background: #effaf4; border-color: #b9e1ce; }
.cs-status--failed { color: #b42332; background: #fff1f2; border-color: #f0c6ca; }
.cs-faint { color: #7890a4; font-size: 12px; }
.cs-date { display: inline-flex; align-items: flex-start; gap: 7px; line-height: 1.5; }
.cs-date svg { margin-top: 2px; flex-shrink: 0; }
.cs-progress { display: flex; flex-direction: column; gap: 5px; min-width: 110px; }
.cs-progress-track { width: 100%; height: 6px; overflow: hidden; background: #e7eef5; border-radius: 99px; }
.cs-progress-fill { height: 100%; background: #3878ab; border-radius: inherit; transition: width .25s ease; }
.cs-progress-label { color: #547189; font-size: 11px; font-variant-numeric: tabular-nums; }
.cs-actions { display: flex; align-items: center; justify-content: flex-end; gap: 7px; flex-wrap: wrap; }
.cs-action { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; padding: 8px 10px; border: 1px solid #c9dff3; border-radius: 8px; background: #eef5fd; color: var(--cs-blue); font-size: 12px; font-weight: 700; white-space: nowrap; cursor: pointer; }
.cs-action:hover:not(:disabled) { background: #dcecfb; border-color: #a8c8e5; }
.cs-action--primary { background: var(--cs-blue); color: #fff; border-color: var(--cs-blue); }
.cs-action--primary:hover:not(:disabled) { background: #17476f; }
.cs-action--success { background: #f0faf4; color: #16724f; border-color: #b9e1ce; }
.cs-action--success:hover:not(:disabled) { background: #e2f4e9; }
.cs-details-row td { padding: 0 16px 15px; background: #f9fbfe; }
.cs-details { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; padding: 16px; border: 1px solid #dce7f1; border-radius: 10px; background: #fff; }
.cs-detail-label { color: #74889b; font-size: 11px; font-weight: 750; text-transform: uppercase; letter-spacing: .02em; }
.cs-detail-value { margin-top: 5px; color: #2d4961; line-height: 1.55; overflow-wrap: anywhere; }
.cs-detail-wide { grid-column: 1 / -1; }
.cs-detail-error { padding: 12px 14px; border: 1px solid #f1d8dc; border-radius: 9px; background: #fff8f8; color: #93313b; white-space: pre-wrap; }
.cs-link { color: var(--cs-blue); text-decoration: underline; text-underline-offset: 3px; }
.cs-row-feedback { margin: 7px 0 0; font-size: 11px; line-height: 1.5; max-width: 260px; overflow-wrap: anywhere; }
.cs-row-feedback--error { color: #b42332; }
.cs-row-feedback--success { color: #14724e; }
.cs-alert { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; padding: 14px 16px; background: #fff7f7; border: 1px solid #f3ccd2; border-radius: 10px; color: #9f2839; font-size: 13px; }
.cs-alert svg { margin-top: 2px; flex-shrink: 0; }
.cs-alert button { color: #8b2c36; text-decoration: underline; font-weight: 700; cursor: pointer; }
.cs-empty { display: grid; justify-items: center; gap: 9px; padding: 48px 20px; text-align: center; color: var(--cs-muted); }
.cs-empty-icon { color: #7c9cba; font-size: 32px; }
.cs-empty-title { margin: 0; color: var(--cs-ink); font-size: 17px; font-weight: 750; }
.cs-empty p { max-width: 490px; margin: 0; line-height: 1.6; }
.cs-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid var(--cs-line); color: var(--cs-muted); font-size: 12px; }
.cs-pager { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.cs-pager-button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #dce5ee; border-radius: 7px; color: var(--cs-blue); background: #fff; cursor: pointer; }
.cs-pager-button:hover:not(:disabled) { background: #eff5fb; }
.cs-mobile-list { display: none; }
.cs-mobile-card { padding: 16px; border-bottom: 1px solid var(--cs-line); }
.cs-mobile-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.cs-mobile-meta { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 15px 0; }
.cs-mobile-meta dt { color: var(--cs-muted); font-size: 11px; font-weight: 750; }
.cs-mobile-meta dd { margin: 5px 0 0; color: var(--cs-ink); font-size: 13px; overflow-wrap: anywhere; }
.cs-mobile-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cs-mobile-actions > div { flex: 1 1 100%; min-width: 0; }
.cs-mobile-actions .cs-actions { width: 100%; justify-content: stretch; }
.cs-mobile-actions .cs-action { flex: 1; }
.cs-mobile-details { margin-top: 13px; }
.cs-mobile-details .cs-details { grid-template-columns: 1fr; }
.cs-spin { animation: cs-spin .9s linear infinite; }
@keyframes cs-spin { to { transform: rotate(360deg); } }
@media (max-width: 1020px) {
    .cs-table-scroll { display: none; }
    .cs-mobile-list { display: block; }
    .cs-filters { width: 100%; }
    .cs-search { flex: 1; width: auto; }
}
@media (max-width: 640px) {
    .cs-top-actions { width: 100%; }
    .cs-top-actions .cs-button { flex: 1; }
    .cs-toolbar { padding: 16px; }
    .cs-filters { flex-direction: column; align-items: stretch; }
    .cs-search, .cs-select { width: 100%; }
    .cs-tabs { padding: 10px 14px; }
    .cs-tab { flex: 1; justify-content: center; }
    .cs-mobile-head { flex-direction: column; }
    .cs-footer { padding: 13px 16px; }
}
@media (prefers-reduced-motion: reduce) { .cs-spin { animation: none; } .cs-progress-fill { transition: none; } }
`;

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "queued", label: "Queued" },
    { key: "running", label: "Running" },
    { key: "completed", label: "Completed" },
    { key: "failed", label: "Failed" },
];

function scanStatus(value) {
    const status = String(value || "NOT_EXECUTED").toUpperCase();
    if (status === "QUEUED") return "queued";
    if (status === "RUNNING") return "running";
    if (status === "COMPLETED") return "completed";
    if (status === "FAILED") return "failed";
    return "pending";
}

function normalizeAudit(item, index) {
    const application = item?.application || {};
    const auditor = item?.auditor || {};
    const consentTool = item?.tools?.consent_management || {};
    const status = scanStatus(consentTool.status);
    const rawProgress = Number(consentTool.progress);

    return {
        ...item,
        rowKey: item.public_audit_id != null
            ? `public-${item.public_audit_id}`
            : item.audit_id != null ? `audit-${item.audit_id}` : `item-${index}`,
        audit_id: item.audit_id,
        public_audit_id: item.public_audit_id,
        application_id: application.id ?? item.application_id,
        name: application.name || item.application_name || item.name || "Application name unavailable",
        auditor_name: auditor.username || auditor.name || "Not provided",
        url: application.url || item.url || "",
        application,
        auditor,
        consent_management: consentTool,
        scan_status: status,
        tool_status: String(consentTool.status || "NOT_EXECUTED").toUpperCase(),
        progress: consentTool.progress == null || !Number.isFinite(rawProgress)
            ? null : Math.max(0, Math.min(100, rawProgress)),
        started_at: consentTool.started_at || null,
        completed_at: consentTool.completed_at || null,
        error_message: consentTool.error_message || null,
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

function safeHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function StatusBadge({ status }) {
    const icons = {
        pending: FiClock, queued: FiClock, running: FiActivity,
        completed: FiCheckCircle, failed: FiAlertCircle,
    };
    const Icon = icons[status] || FiClock;
    const label = STATUS_TABS.find((tab) => tab.key === status)?.label || "Pending";
    return (
        <span className={`cs-status cs-status--${status}`}>
            <Icon aria-hidden="true" /> {label}
        </span>
    );
}

function ProgressInfo({ audit }) {
    if (audit.scan_status === "queued") {
        return <span className="cs-faint">Waiting to start</span>;
    }
    if (audit.scan_status === "running") {
        if (audit.progress == null) return <span className="cs-faint">Scanning in progress</span>;
        return (
            <div className="cs-progress">
                <div className="cs-progress-track" role="progressbar" aria-label="Consent scan progress"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={audit.progress}>
                    <div className="cs-progress-fill" style={{ width: `${audit.progress}%` }} />
                </div>
                <span className="cs-progress-label">{audit.progress}%</span>
            </div>
        );
    }
    if (audit.scan_status === "completed") return <span className="cs-faint">Scan complete</span>;
    if (audit.scan_status === "failed") return <span className="cs-faint">Scan unsuccessful</span>;
    return <span className="cs-faint">Not started</span>;
}

function AuditDetails({ audit }) {
    return (
        <div className="cs-details">
            <div>
                <div className="cs-detail-label">Audit ID</div>
                <div className="cs-detail-value">{audit.audit_id ?? "Not available"}</div>
            </div>
            <div>
                <div className="cs-detail-label">Public Audit ID</div>
                <div className="cs-detail-value">{audit.public_audit_id ?? "Not available"}</div>
            </div>
            <div>
                <div className="cs-detail-label">Application ID</div>
                <div className="cs-detail-value">{audit.application_id ?? "Not available"}</div>
            </div>
            <div className="cs-detail-wide">
                <div className="cs-detail-label">Application URL</div>
                <div className="cs-detail-value">
                    {safeHttpUrl(audit.url) ? (
                        <a className="cs-link" href={audit.url} target="_blank" rel="noopener noreferrer">
                            {audit.url} <FiExternalLink aria-hidden="true" style={{ display: "inline" }} />
                        </a>
                    ) : (audit.url || "Not provided")}
                </div>
            </div>
            <div>
                <div className="cs-detail-label">Started on</div>
                <div className="cs-detail-value">{formatDateTime(audit.started_at)}</div>
            </div>
            <div>
                <div className="cs-detail-label">Completed on</div>
                <div className="cs-detail-value">{formatDateTime(audit.completed_at)}</div>
            </div>
            <div>
                <div className="cs-detail-label">Tool status</div>
                <div className="cs-detail-value">{audit.tool_status}</div>
            </div>
            {audit.error_message && (
                <div className="cs-detail-wide cs-detail-error">
                    <div className="cs-detail-label">Scan error</div>
                    <div style={{ marginTop: 4 }}>{audit.error_message}</div>
                </div>
            )}
        </div>
    );
}

export default function ConsentScanner() {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(() => new Set());
    const [mappingAuditId, setMappingAuditId] = useState(null);
    const [mappingFeedback, setMappingFeedback] = useState({});
    const isFetchingRef = useRef(false);
    const mountedRef = useRef(false);

    // GET /api/audits/assigned/tool-status/ — polling every four seconds.
    const fetchAllData = useCallback(async ({ initial = false, manual = false } = {}) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        if (initial) setLoading(true);
        if (manual) setRefreshing(true);

        try {
            const response = await fetchWithAuth("/api/audits/assigned/tool-status/");
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || data.detail || `Tool Status API returned ${response.status}`);
            }
            if (!Array.isArray(data.results)) {
                throw new Error("The tool status API did not return a results array.");
            }
            if (mountedRef.current) {
                setAudits(data.results.map(normalizeAudit));
                setError("");
            }
        } catch (err) {
            if (mountedRef.current) {
                console.error("Consent Scanner status error:", err);
                setError(err?.message || "Failed to fetch consent applications.");
            }
        } finally {
            isFetchingRef.current = false;
            if (mountedRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        void fetchAllData({ initial: true });
        const interval = setInterval(() => void fetchAllData(), 4000);
        return () => {
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, [fetchAllData]);

    // Preserve the existing scan configuration route and payload.
    const handleRunScanner = (audit) => {
        const publicAuditId = audit.public_audit_id;
        const url = audit.application?.url || audit.url || "";
        if (!publicAuditId) {
            setError("Unable to start scanner: Public Audit ID is missing.");
            return;
        }
        if (!url) {
            setError("Unable to start scanner: Application URL is missing.");
            return;
        }
        navigate("/consent-auto-audit", {
            state: {
                configuration: {
                    public_audit_id: publicAuditId,
                    url,
                    username: audit.application?.username || "",
                    password: audit.application?.password || "",
                    audit_id: publicAuditId,
                },
            },
        });
    };

    // Existing result route: public audit ID is mandatory.
    const handleViewResults = (audit) => {
        if (!audit.public_audit_id) {
            setError("Public Audit ID is missing. Cannot view consent scan results.");
            return;
        }
        navigate(`/consent-management/${encodeURIComponent(String(audit.public_audit_id))}`);
    };

    // POST /api/checklists/fetch-consent-result/{public_audit_id}/
    const handleMapToChecklist = async (audit) => {
        const publicAuditId = audit.public_audit_id;
        const auditKey = String(audit.audit_id ?? publicAuditId ?? audit.rowKey);
        if (!publicAuditId) {
            setMappingFeedback((prev) => ({ ...prev, [auditKey]: { type: "error", message: "Public Audit ID is missing." } }));
            return;
        }
        if (mappingAuditId !== null) return;
        setMappingAuditId(auditKey);
        setMappingFeedback((prev) => ({ ...prev, [auditKey]: null }));
        try {
            const response = await fetchWithAuth(
                `/api/checklists/fetch-consent-result/${encodeURIComponent(String(publicAuditId))}/`,
                { method: "POST" }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data?.success !== true) {
                throw new Error(data?.message || data?.detail || data?.error ||
                    `Checklist mapping failed (HTTP ${response.status}).`);
            }
            setMappingFeedback((prev) => ({
                ...prev,
                [auditKey]: {
                    type: "success",
                    message: "Checklist mapping completed successfully.",
                    details: data,
                },
            }));
        } catch (err) {
            setMappingFeedback((prev) => ({
                ...prev,
                [auditKey]: { type: "error", message: err?.message || "Failed to map consent results." },
            }));
        } finally {
            setMappingAuditId(null);
        }
    };

    const counts = useMemo(() => {
        const next = { all: audits.length, pending: 0, queued: 0, running: 0, completed: 0, failed: 0 };
        audits.forEach((audit) => { next[audit.scan_status] += 1; });
        return next;
    }, [audits]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        const matches = audits.filter((audit) => {
            if (selectedStatus !== "all" && audit.scan_status !== selectedStatus) return false;
            return !query || [audit.name, audit.audit_id, audit.public_audit_id,
            audit.application_id, audit.auditor_name, audit.url, audit.scan_status]
                .some((value) => String(value ?? "").toLowerCase().includes(query));
        });
        return [...matches].sort((a, b) => {
            if (sort === "name") return a.name.localeCompare(b.name);
            if (sort === "status") return a.scan_status.localeCompare(b.scan_status) || a.name.localeCompare(b.name);
            const dateA = new Date(a.started_at || a.completed_at || 0).getTime() || 0;
            const dateB = new Date(b.started_at || b.completed_at || 0).getTime() || 0;
            return sort === "oldest" ? dateA - dateB : dateB - dateA;
        });
    }, [audits, selectedStatus, search, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const from = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, filtered.length);

    const toggleExpanded = (key) => setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });

    const renderActions = (audit) => {
        const auditKey = String(audit.audit_id ?? audit.public_audit_id ?? audit.rowKey);
        const isMapping = mappingAuditId === auditKey;
        const feedback = mappingFeedback[auditKey];
        const canView = Boolean(audit.public_audit_id);
        const canRun = canView && Boolean(audit.url);

        return (
            <div>
                <div className="cs-actions">
                    {audit.scan_status === "pending" ? (
                        <button className="cs-action cs-action--primary" type="button"
                            disabled={!canRun} onClick={() => handleRunScanner(audit)}
                            title={!canRun ? "Application URL or public audit ID missing" : "Configure consent scan"}>
                            <FiPlay aria-hidden="true" /> Run Scanner
                        </button>
                    ) : (
                        <button className="cs-action" type="button" disabled={!canView}
                            onClick={() => handleViewResults(audit)} title="View consent scan results">
                            <FiEye aria-hidden="true" /> View Results
                        </button>
                    )}
                    {audit.scan_status === "completed" && (
                        <button className="cs-action cs-action--success" type="button"
                            disabled={mappingAuditId !== null || !canView}
                            onClick={() => handleMapToChecklist(audit)}
                            title="Map completed consent results to checklist">
                            {isMapping ? <FiLoader className="cs-spin" aria-hidden="true" /> :
                                <FiClipboard aria-hidden="true" />}
                            {isMapping ? "Mapping..." : "Map to Checklist"}
                        </button>
                    )}
                </div>
                {feedback?.message && (
                    <p role={feedback.type === "error" ? "alert" : "status"}
                        className={`cs-row-feedback cs-row-feedback--${feedback.type}`}>
                        {feedback.message}
                        {feedback.type === "success" && typeof feedback.details?.total_saved === "number" &&
                            ` (${feedback.details.total_saved} saved)`}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="cs-page">
            <style>{pageStyles}</style>

            <div className="cs-top">
                <nav className="cs-crumb" aria-label="Breadcrumb">
                    <FiShield aria-hidden="true" />
                    <span>Auditor Workspace</span>
                    <FiChevronRight aria-hidden="true" />
                    <strong aria-current="page">Consent Management Scanner</strong>
                </nav>
                <div className="cs-top-actions">
                    <button type="button" className="cs-button" onClick={() => navigate("/auditdashboard")}>
                        <FiArrowLeft aria-hidden="true" /> Dashboard
                    </button>
                    <button type="button" className="cs-button cs-button--primary"
                        disabled={loading || refreshing}
                        onClick={() => void fetchAllData({ manual: true })}>
                        <FiRefreshCw className={refreshing ? "cs-spin" : ""} aria-hidden="true" />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            <header className="cs-heading">
                <p className="cs-kicker"><FiActivity aria-hidden="true" /> SECURITY TOOLS</p>
                <h1 className="cs-title">Consent Management Scanner</h1>
                <p className="cs-description">
                    Run and monitor consent checks on assigned applications, review scan results,
                    and map completed findings to audit checklists. Status updates automatically every 4 seconds.
                </p>
            </header>

            {error && (
                <div className="cs-alert" role="alert">
                    <FiAlertCircle aria-hidden="true" />
                    <div>
                        <strong>Unable to refresh consent scan data.</strong>
                        <div style={{ marginTop: 3 }}>{error}</div>
                        <button type="button" onClick={() => void fetchAllData({ manual: true })}>
                            Try again
                        </button>
                    </div>
                </div>
            )}

            <section className="cs-panel" aria-labelledby="cs-register-heading">
                <div className="cs-toolbar">
                    <div>
                        <h2 id="cs-register-heading" className="cs-register-title">Consent Scan Register</h2>
                        <p className="cs-register-subtitle">
                            {loading ? "Loading consent audits..." : `${audits.length} applications · live status monitoring`}
                        </p>
                    </div>
                    <div className="cs-filters">
                        <label className="cs-search">
                            <FiSearch aria-hidden="true" />
                            <input type="search" aria-label="Search consent scan audits"
                                placeholder="Search application, audit ID..."
                                value={search}
                                onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
                        </label>
                        <select className="cs-select" aria-label="Sort consent scans" value={sort}
                            onChange={(event) => { setSort(event.target.value); setPage(1); }}>
                            <option value="name">Application A–Z</option>
                            <option value="newest">Recent activity</option>
                            <option value="oldest">Oldest activity</option>
                            <option value="status">Status A–Z</option>
                        </select>
                    </div>
                </div>

                <div className="cs-tabs" aria-label="Filter consent scan status">
                    {STATUS_TABS.map(({ key, label }) => (
                        <button type="button" key={key} className="cs-tab"
                            aria-pressed={selectedStatus === key}
                            onClick={() => { setSelectedStatus(key); setPage(1); }}>
                            {label} <span className="cs-tab-count">{loading ? "—" : counts[key]}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="cs-empty" role="status">
                        <FiLoader className="cs-empty-icon cs-spin" aria-hidden="true" />
                        <p className="cs-empty-title">Loading consent scans</p>
                        <p>Retrieving assigned applications and consent tool statuses.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="cs-empty">
                        <FiInbox className="cs-empty-icon" aria-hidden="true" />
                        <p className="cs-empty-title">{search || selectedStatus !== "all" ? "No matching scans" : "No consent scans found"}</p>
                        <p>{search || selectedStatus !== "all" ? "Try another filter or search term." :
                            "Assigned applications will appear here when available."}</p>
                    </div>
                ) : (
                    <>
                        <div className="cs-table-scroll">
                            <table className="cs-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Application</th>
                                        <th scope="col">Auditor</th>
                                        <th scope="col">Scan Status</th>
                                        <th scope="col">Scan Activity</th>
                                        <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((audit) => (
                                        <Fragment key={audit.rowKey}>
                                            <tr className="cs-row">
                                                <td>
                                                    <div className="cs-application">
                                                        <span className="cs-app-icon"><FiFileText aria-hidden="true" /></span>
                                                        <div>
                                                            <div className="cs-app-name">{audit.name}</div>
                                                            <div className="cs-app-id">{audit.public_audit_id || "Public audit ID unavailable"}</div>
                                                            <button type="button" className="cs-expand"
                                                                aria-expanded={expanded.has(audit.rowKey)}
                                                                onClick={() => toggleExpanded(audit.rowKey)}>
                                                                {expanded.has(audit.rowKey) ?
                                                                    <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                                                {expanded.has(audit.rowKey) ? "Hide details" : "More details"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{audit.auditor_name}</td>
                                                <td><StatusBadge status={audit.scan_status} /></td>
                                                <td><ProgressInfo audit={audit} /></td>
                                                <td>{renderActions(audit)}</td>
                                            </tr>
                                            {expanded.has(audit.rowKey) && (
                                                <tr className="cs-details-row">
                                                    <td colSpan={5}><AuditDetails audit={audit} /></td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="cs-mobile-list">
                            {visible.map((audit) => (
                                <article className="cs-mobile-card" key={audit.rowKey}>
                                    <div className="cs-mobile-head">
                                        <div>
                                            <div className="cs-app-name">{audit.name}</div>
                                            <div className="cs-app-id">{audit.public_audit_id || "Public audit ID unavailable"}</div>
                                        </div>
                                        <StatusBadge status={audit.scan_status} />
                                    </div>
                                    <dl className="cs-mobile-meta">
                                        <div><dt>Auditor</dt><dd>{audit.auditor_name}</dd></div>
                                        <div><dt>Scan activity</dt><dd><ProgressInfo audit={audit} /></dd></div>
                                    </dl>
                                    <div className="cs-mobile-actions">
                                        <button type="button" className="cs-expand"
                                            aria-expanded={expanded.has(audit.rowKey)}
                                            onClick={() => toggleExpanded(audit.rowKey)}>
                                            {expanded.has(audit.rowKey) ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                            {expanded.has(audit.rowKey) ? "Hide details" : "More details"}
                                        </button>
                                        {renderActions(audit)}
                                    </div>
                                    {expanded.has(audit.rowKey) && (
                                        <div className="cs-mobile-details"><AuditDetails audit={audit} /></div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </>
                )}

                <footer className="cs-footer">
                    <span>Showing {loading ? "—" : from}–{loading ? "—" : to} of {loading ? "—" : filtered.length} scans</span>
                    <div className="cs-pager">
                        <label htmlFor="consent-page-size">Rows per page</label>
                        <select id="consent-page-size" className="cs-select" value={pageSize}
                            onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
                            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                        </select>
                        <button type="button" className="cs-pager-button" aria-label="Previous page"
                            disabled={currentPage <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button type="button" className="cs-pager-button" aria-label="Next page"
                            disabled={currentPage >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                            <FiChevronRight aria-hidden="true" />
                        </button>
                    </div>
                </footer>
            </section>
        </div>
    );
}
