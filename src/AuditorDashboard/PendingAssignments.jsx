import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCalendar,
    FiCheck,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
    FiClipboard,
    FiExternalLink,
    FiEye,
    FiFileText,
    FiLoader,
    FiRefreshCw,
    FiSearch,
    FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import AuditViewModal from "./AuditViewModal";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

// Only list/page styling lives here. The overall background, sidebar and
// footer continue to belong exclusively to DashboardLayout.jsx.
const styles = String.raw`
.pa-list-page {
  --pa-ink: #193550; --pa-muted: #60758b; --pa-border: #e1e8f0;
  --pa-blue: #245b91; --pa-green: #18744e; --pa-red: #b42331;
  width: 100%; min-width: 0; color: var(--pa-ink); font-size: 14px;
}
.pa-list-page *, .pa-list-page *::before, .pa-list-page *::after { box-sizing: border-box; }
.pa-list-page :is(button,input,select,textarea) { font: inherit; }
.pa-list-page :is(button,input,select,textarea):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.pa-list-page button:disabled { opacity: .47; cursor: not-allowed; }

/* Compact page title: the assignment register is the visual priority */
.pa-titlebar { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.pa-back { display: inline-flex; gap: 7px; align-items: center; padding: 0; color: var(--pa-blue); background: none; border: 0; font-size: 13px; font-weight: 650; cursor: pointer; margin-bottom: 7px; }
.pa-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pa-title h1 { margin: 0; font-weight: 760; font-size: clamp(22px,2vw,28px); letter-spacing: -.035em; }
.pa-count { border: 1px solid #f0d3a2; background: #fff7e9; color: #8f570f; padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight: 750; }
.pa-intro { margin: 5px 0 0; font-size: 13px; color: var(--pa-muted); line-height: 1.5; }
.pa-refresh { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; color: #244e77; background: #fff; border: 1px solid #cfdeea; border-radius: 9px; cursor: pointer; font-weight: 700; }
.pa-refresh:hover:not(:disabled) { background: #eef5fc; }

/* Assignment list surface */
.pa-register { min-width: 0; overflow: hidden; background: #fff; border: 1px solid var(--pa-border); border-radius: 14px; box-shadow: 0 3px 16px rgba(19,42,66,.04); }
.pa-register-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 18px 20px; border-bottom: 1px solid var(--pa-border); }
.pa-register-label { display: flex; align-items: center; gap: 10px; min-width: 0; }
.pa-register-icon { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; background: #eaf2fb; color: var(--pa-blue); border-radius: 10px; font-size: 19px; }
.pa-register-label h2 { font-size: 17px; line-height: 1.3; font-weight: 760; margin: 0; }
.pa-register-label p { font-size: 12px; color: var(--pa-muted); margin: 3px 0 0; }
.pa-tools { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
.pa-search { display: flex; align-items: center; gap: 8px; border: 1px solid #cfdeeb; border-radius: 9px; padding: 0 11px; min-height: 40px; background: #fff; color: #668097; min-width: min(100%,240px); }
.pa-search:focus-within { border-color: #6da3d4; box-shadow: 0 0 0 3px #e6f1fe; }
.pa-search input { width: 100%; border: 0; outline: none; background: transparent; color: var(--pa-ink); min-width: 0; font-size: 13px; }
.pa-search input:focus-visible { outline: none; }
.pa-select { color: #34536f; padding: 0 9px; height: 40px; border-radius: 9px; border: 1px solid #cfdeeb; background: white; font-size: 13px; }
.pa-table-scroll { width: 100%; overflow-x: auto; scrollbar-width: thin; }
.pa-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 950px; text-align: left; }
.pa-table thead { background: #f5f8fc; }
.pa-table th { position: sticky; top: 0; padding: 13px 15px; color: #526e88; font-size: 12px; font-weight: 750; white-space: nowrap; border-bottom: 1px solid #dfe8f0; }
.pa-table td { padding: 15px; border-bottom: 1px solid #ebf0f5; font-size: 13px; color: #3a556e; vertical-align: middle; }
.pa-table tbody tr.pa-row:hover { background: #f8fbff; }
.pa-table tbody tr.pa-row:last-child td { border-bottom: 0; }
.pa-cell-app { display: flex; align-items: flex-start; gap: 10px; min-width: 190px; }
.pa-doc-icon { width: 35px; height: 35px; flex: 0 0 35px; display: grid; place-items: center; border-radius: 9px; background: #edf4fd; color: #2f6198; font-size: 18px; }
.pa-app-name { color: #16324d; font-size: 14px; line-height: 1.45; font-weight: 740; overflow-wrap: anywhere; }
.pa-app-id { font-size: 11px; margin-top: 3px; color: #73879b; overflow-wrap: anywhere; }
.pa-minor { color: #61788e; font-size: 12px; }
.pa-date { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.pa-domains-count { display: inline-flex; align-items: center; gap: 6px; color: #355b7f; font-weight: 650; }
.pa-status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border: 1px solid; border-radius: 999px; font-size: 12px; font-weight: 730; white-space: nowrap; text-transform: capitalize; }
.pa-status--warning { background: #fff7eb; border-color: #f0d8ad; color: #915a13; }
.pa-status--success { background: #edf9f2; border-color: #bde4ce; color: #17704b; }
.pa-status--danger { background: #fff1f2; border-color: #f2c9ce; color: #ad2c38; }
.pa-status--neutral { background: #f4f7fa; border-color: #dae4ed; color: #53697c; }
.pa-actions { display: flex; justify-content: flex-end; align-items: center; gap: 6px; white-space: nowrap; }
.pa-act { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 35px; padding: 8px 10px; border-radius: 8px; border: 1px solid; background: white; font-size: 12px; font-weight: 700; cursor: pointer; transition: background-color .15s ease; }
.pa-act--view { color: #265b90; background: #eef5fd; border-color: #d9e8f6; }
.pa-act--view:hover:not(:disabled) { background: #deecfc; }
.pa-act--accept { color: #16714b; background: #eaf8f0; border-color: #c9e8d6; }
.pa-act--accept:hover:not(:disabled) { background: #d7f1e3; }
.pa-act--decline { color: #b42331; background: #fff0f2; border-color: #f2d1d6; }
.pa-act--decline:hover:not(:disabled) { background: #ffe1e5; }
.pa-expand { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; border: 0; background: transparent; padding: 0; color: #286399; font-size: 12px; font-weight: 700; cursor: pointer; }
.pa-detail-row > td { padding: 0 15px 15px; background: #f8fbff; }
.pa-details { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 18px; background: #fff; border: 1px solid #dce7f1; border-radius: 10px; padding: 16px; }
.pa-detail-heading { display: block; color: #73879b; text-transform: uppercase; letter-spacing: .04em; font-size: 11px; font-weight: 750; margin-bottom: 5px; }
.pa-detail-value { display: block; color: #284660; overflow-wrap: anywhere; line-height: 1.55; font-size: 13px; }
.pa-link { color: #205b93; text-decoration: underline; text-underline-offset: 2px; }
.pa-domain-tags { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 6px; }
.pa-domain-tag { display: inline-block; border-radius: 6px; background: #eff5fb; color: #285780; padding: 5px 8px; font-size: 12px; overflow-wrap: anywhere; }
.pa-empty { display: grid; justify-items: center; text-align: center; gap: 10px; padding: 55px 20px; color: var(--pa-muted); }
.pa-empty > svg { font-size: 30px; color: #7797b5; }
.pa-empty h3 { margin: 0; font-size: 17px; color: var(--pa-ink); font-weight: 740; }
.pa-empty p { margin: 0; max-width: 440px; line-height: 1.55; }
.pa-register-foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 13px 20px; border-top: 1px solid var(--pa-border); color: var(--pa-muted); font-size: 12px; }
.pa-pagination { display: flex; align-items: center; gap: 8px; }
.pa-page-btn { display: grid; place-items: center; width: 32px; height: 32px; background: #fff; border: 1px solid #d4e0ea; border-radius: 8px; color: #2c5b86; cursor: pointer; }
.pa-mobile-list { display: none; }

/* Confirmation dialog */
.pa-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(16,34,53,.55); padding: 16px; display: grid; place-items: center; }
.pa-dialog { width: min(100%,500px); max-height: 90dvh; overflow-y: auto; background: #fff; border: 1px solid #dce5ed; border-radius: 15px; box-shadow: 0 22px 70px rgba(0,0,0,.2); }
.pa-dialog-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 20px; border-bottom: 1px solid var(--pa-border); }
.pa-dialog-head h2 { margin: 0; font-weight: 750; color: var(--pa-ink); font-size: 19px; }
.pa-dialog-body { padding: 20px; color: #546c82; line-height: 1.6; }
.pa-dialog-body strong { display: block; color: var(--pa-ink); margin: 7px 0 16px; }
.pa-dialog-body label { display: block; font-size: 13px; font-weight: 720; margin-bottom: 7px; color: #254761; }
.pa-dialog-body textarea { width: 100%; min-height: 115px; padding: 12px; background: #fff; border: 1px solid #cbd9e6; border-radius: 9px; color: #18324d; resize: vertical; }
.pa-dialog-foot { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 20px; background: #f8fafc; border-top: 1px solid var(--pa-border); }
.pa-dialog-button { border: 1px solid #d0dce8; background: white; color: #345570; border-radius: 8px; padding: 10px 14px; cursor: pointer; font-weight: 700; }
.pa-dialog-button--accept { color: white; background: #18744e; border-color: #18744e; }
.pa-dialog-button--decline { color: white; background: #b42331; border-color: #b42331; }
.pa-spin { animation: pa-spin .9s linear infinite; }
@keyframes pa-spin { to { transform: rotate(360deg); } }

@media (max-width: 800px) {
  .pa-table-scroll { display: none; }
  .pa-mobile-list { display: grid; gap: 12px; padding: 14px; background: #f8fafc; }
  .pa-mobile-card { min-width: 0; background: #fff; padding: 15px; border: 1px solid var(--pa-border); border-radius: 12px; }
  .pa-mobile-head { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; }
  .pa-mobile-head .pa-app-name { margin-bottom: 5px; }
  .pa-mobile-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0; }
  .pa-mobile-meta > div { min-width: 0; }
  .pa-mobile-actions { display: flex; gap: 7px; flex-wrap: wrap; padding-top: 13px; border-top: 1px solid var(--pa-border); }
  .pa-mobile-actions .pa-actions { width: 100%; }
  .pa-mobile-actions .pa-act { flex: 1; }
  .pa-mobile-card .pa-details { grid-template-columns: 1fr; margin: 12px 0 0; gap: 12px; }
}
@media (max-width: 640px) {
  .pa-titlebar { gap: 12px; }
  .pa-intro { max-width: 35ch; }
  .pa-register-top { padding: 16px; }
  .pa-tools, .pa-search { width: 100%; }
  .pa-select { flex: 1; min-width: 0; }
  .pa-register-foot { padding: 13px 15px; }
  .pa-mobile-list { padding: 10px; }
  .pa-dialog-foot .pa-dialog-button { flex: 1; }
}
@media (prefers-reduced-motion: reduce) { .pa-spin { animation: none; } }
`;

const toList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const formatDate = (value) => {
    if (!value) return "Not provided";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not provided"
        : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getStatusTone = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (/pending|assigned|awaiting/.test(value)) return "warning";
    if (/accepted|approved/.test(value)) return "success";
    if (/reject|declin/.test(value)) return "danger";
    return "neutral";
};

const isActionable = (status) => /pending|assigned|awaiting/.test(String(status || "pending").toLowerCase());

const safeHttpUrl = (value) => {
    if (typeof value !== "string") return null;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
        return null;
    }
};

function StatusBadge({ status }) {
    return <span className={`pa-status pa-status--${getStatusTone(status)}`}>{status || "Pending"}</span>;
}

function Details({ audit }) {
    const href = safeHttpUrl(audit.url);
    return (
        <div className="pa-details">
            <div>
                <span className="pa-detail-heading">Assigned auditor</span>
                <span className="pa-detail-value">{audit.auditor_name || "Not provided"}</span>
            </div>
            <div>
                <span className="pa-detail-heading">Application URL</span>
                <span className="pa-detail-value">
                    {href ? (
                        <a className="pa-link" href={href} target="_blank" rel="noopener noreferrer">
                            Open application <FiExternalLink style={{ display: "inline", marginLeft: 3 }} aria-hidden="true" />
                        </a>
                    ) : audit.url || "Not provided"}
                </span>
            </div>
            <div>
                <span className="pa-detail-heading">Checklist domains</span>
                {audit.domains.length > 0 ? (
                    <div className="pa-domain-tags">
                        {audit.domains.map((domain, index) => (
                            <span className="pa-domain-tag" key={domain.domain_id ?? index}>
                                {domain.domain_name || `Domain ${index + 1}`}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="pa-detail-value">No domains available</span>
                )}
            </div>
        </div>
    );
}

function Actions({ audit, busy, onView, onDecide }) {
    const actionable = isActionable(audit.status);
    return (
        <div className="pa-actions">
            <button type="button" className="pa-act pa-act--view" onClick={() => onView(audit)} aria-label={`View ${audit.name}`}>
                <FiEye aria-hidden="true" /> View
            </button>
            <button type="button" className="pa-act pa-act--accept" disabled={busy || !actionable || audit.id == null} onClick={() => onDecide("accept", audit)} aria-label={`Accept ${audit.name}`}>
                <FiCheck aria-hidden="true" /> Accept
            </button>
            <button type="button" className="pa-act pa-act--decline" disabled={busy || !actionable || audit.id == null} onClick={() => onDecide("reject", audit)} aria-label={`Decline ${audit.name}`}>
                <FiX aria-hidden="true" /> Decline
            </button>
        </div>
    );
}

export default function PendingAssignments() {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(() => new Set());
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [decision, setDecision] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const loadAssignments = useCallback(async ({ signal, silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const response = await fetchWithAuth("/api/audits/assignments/pending/", { signal });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.message || payload.detail || "Unable to load pending assignments.");
            const list = toList(payload);
            const applicationIds = [...new Set(list.map((item) => item.application_id).filter((id) => id != null))];

            // Enrichment failures should not remove an assignment from the list.
            const [applications, checklists] = await Promise.all([
                Promise.allSettled(applicationIds.map(async (id) => {
                    const res = await fetchWithAuth(`/api/applications/applications/${encodeURIComponent(id)}/`, { signal });
                    return res.ok ? res.json() : null;
                })),
                Promise.allSettled(applicationIds.map(async (id) => {
                    const res = await fetchWithAuth(`/api/checklists/application/${encodeURIComponent(id)}/`, { signal });
                    return res.ok ? res.json() : null;
                })),
            ]);

            const applicationMap = new Map();
            const checklistMap = new Map();
            applicationIds.forEach((id, index) => {
                if (applications[index].status === "fulfilled") {
                    const value = applications[index].value;
                    applicationMap.set(String(id), value?.data || value?.application || value || null);
                }
                if (checklists[index].status === "fulfilled") {
                    const value = checklists[index].value;
                    checklistMap.set(String(id), Array.isArray(value?.domains) ? value.domains : []);
                }
            });

            const enriched = list.map((item) => ({
                ...item,
                application_details: applicationMap.get(String(item.application_id)) || null,
                domains: checklistMap.get(String(item.application_id)) || [],
            }));
            if (!signal?.aborted) setAudits(enriched);
        } catch (err) {
            if (!signal?.aborted && err?.name !== "AbortError") setError(err?.message || "Unable to retrieve assignments.");
        } finally {
            if (!signal?.aborted) { setLoading(false); setRefreshing(false); }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void loadAssignments({ signal: controller.signal });
        return () => controller.abort();
    }, [loadAssignments]);

    useEffect(() => {
        if (!decision) return;
        const onEscape = (event) => {
            if (event.key === "Escape" && processingId === null) setDecision(null);
        };
        window.addEventListener("keydown", onEscape);
        return () => window.removeEventListener("keydown", onEscape);
    }, [decision, processingId]);

    const formatted = useMemo(() => audits.map((audit) => ({
        id: audit.audit_id ?? audit.id,
        application_id: audit.application_id,
        name: audit.application_details?.name || "Application name unavailable",
        auditor_name: audit.auditor_name || "Not provided",
        created_at: audit.created_at,
        status: audit.status || "Pending",
        url: audit.application_details?.url,
        domains: Array.isArray(audit.domains) ? audit.domains : [],
    })), [audits]);

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        const matched = keyword
            ? formatted.filter((audit) => [audit.name, audit.auditor_name, audit.id, audit.application_id, audit.status]
                .some((value) => String(value ?? "").toLowerCase().includes(keyword)))
            : [...formatted];

        matched.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            const aDate = new Date(a.created_at).getTime() || 0;
            const bDate = new Date(b.created_at).getTime() || 0;
            return sortBy === "oldest" ? aDate - bDate : bDate - aDate;
        });
        return matched;
    }, [formatted, search, sortBy]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const first = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
    const last = Math.min(currentPage * pageSize, filtered.length);
    const busy = processingId !== null;

    const toggleExpanded = (id) => setExpanded((previous) => {
        const next = new Set(previous);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });

    const startDecision = (type, audit) => {
        if (busy) return;
        setDecision({ type, audit });
        setRejectReason("");
    };

    const submitDecision = async () => {
        if (!decision || busy) return;
        const { type, audit } = decision;
        const reason = rejectReason.trim();
        if (type === "reject" && !reason) {
            toast.warning("Please provide a reason for declining the assignment.");
            return;
        }
        setProcessingId(audit.id);
        try {
            const response = await fetchWithAuth(
                `/api/audits/assignments/${encodeURIComponent(audit.id)}/${type === "accept" ? "accept" : "reject"}/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    ...(type === "reject" ? { body: JSON.stringify({ reason }) } : {}),
                }
            );
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.message || payload.detail || "Unable to update assignment.");
            toast.success(type === "accept" ? "Assignment accepted successfully." : "Assignment declined successfully.");
            setDecision(null);
            setSelectedAudit(null);
            await loadAssignments({ silent: true });
        } catch (err) {
            toast.error(err?.message || "Unable to update assignment.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="pa-list-page">
            <style>{styles}</style>

            <div className="pa-titlebar">
                <div>
                    <button type="button" className="pa-back" onClick={() => navigate("/auditdashboard")}>
                        <FiArrowLeft aria-hidden="true" /> Back to dashboard
                    </button>
                    <div className="pa-title">
                        <h1>Pending Assignments</h1>
                        <span className="pa-count">{loading ? "…" : formatted.length} pending</span>
                    </div>
                    <p className="pa-intro">Review audit assignments and take action directly from the register.</p>
                </div>
                <button type="button" className="pa-refresh" onClick={() => loadAssignments({ silent: true })} disabled={loading || refreshing || busy}>
                    <FiRefreshCw className={refreshing ? "pa-spin" : ""} aria-hidden="true" />
                    {refreshing ? "Refreshing…" : "Refresh list"}
                </button>
            </div>

            <section className="pa-register" aria-labelledby="pa-register-heading">
                <div className="pa-register-top">
                    <div className="pa-register-label">
                        <span className="pa-register-icon"><FiClipboard aria-hidden="true" /></span>
                        <div>
                            <h2 id="pa-register-heading">Assignment Register</h2>
                            <p>Search, examine and respond to assigned applications</p>
                        </div>
                    </div>
                    <div className="pa-tools">
                        <label className="pa-search">
                            <FiSearch aria-hidden="true" />
                            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} aria-label="Search assignments" placeholder="Search applications or IDs" />
                        </label>
                        <select className="pa-select" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }} aria-label="Sort assignments">
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="name">Application A–Z</option>
                        </select>
                        <select className="pa-select" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Assignments per page">
                            <option value={10}>10 rows</option>
                            <option value={25}>25 rows</option>
                            <option value={50}>50 rows</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="pa-empty" role="status"><FiLoader className="pa-spin" aria-hidden="true" /><h3>Loading assignments</h3><p>Retrieving pending audits and linked checklist data.</p></div>
                ) : error ? (
                    <div className="pa-empty" role="alert"><FiAlertCircle aria-hidden="true" /><h3>Couldn't load assignments</h3><p>{error}</p><button type="button" className="pa-refresh" onClick={() => loadAssignments()}>Try again</button></div>
                ) : filtered.length === 0 ? (
                    <div className="pa-empty"><FiClipboard aria-hidden="true" /><h3>{search ? "No matching assignments" : "No pending assignments"}</h3><p>{search ? "Try a different application name or ID." : "There are no audit assignments waiting for a response."}</p></div>
                ) : (
                    <>
                        <div className="pa-table-scroll">
                            <table className="pa-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Application</th>
                                        <th scope="col">Audit ID</th>
                                        <th scope="col">Assigned on</th>
                                        <th scope="col">Checklist</th>
                                        {/* <th scope="col">Status</th> */}
                                        <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((audit) => {
                                        const expandedRow = expanded.has(audit.id);
                                        return (
                                            <FragmentRow key={audit.id ?? `${audit.application_id}-${audit.created_at}`}>
                                                <tr className="pa-row">
                                                    <td>
                                                        <div className="pa-cell-app">
                                                            <span className="pa-doc-icon"><FiFileText aria-hidden="true" /></span>
                                                            <div>
                                                                <div className="pa-app-name">{audit.name}</div>
                                                                <div className="pa-app-id">Application: {audit.application_id ?? "—"}</div>
                                                                <button type="button" className="pa-expand" aria-expanded={expandedRow} onClick={() => toggleExpanded(audit.id)}>
                                                                    {expandedRow ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                                                    {expandedRow ? "Less details" : "More details"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="pa-minor">{audit.id ?? "—"}</td>
                                                    <td><span className="pa-date"><FiCalendar aria-hidden="true" /> {formatDate(audit.created_at)}</span></td>
                                                    <td><span className="pa-domains-count">{audit.domains.length} {audit.domains.length === 1 ? "domain" : "domains"}</span></td>
                                                    {/* <td><StatusBadge status={audit.status} /></td> */}
                                                    <td><Actions audit={audit} busy={busy} onView={setSelectedAudit} onDecide={startDecision} /></td>
                                                </tr>
                                                {expandedRow && (
                                                    <tr className="pa-detail-row"><td colSpan={6}><Details audit={audit} /></td></tr>
                                                )}
                                            </FragmentRow>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="pa-mobile-list">
                            {pageRows.map((audit) => {
                                const expandedRow = expanded.has(audit.id);
                                return (
                                    <article className="pa-mobile-card" key={audit.id ?? `${audit.application_id}-${audit.created_at}`}>
                                        <div className="pa-mobile-head">
                                            <div style={{ minWidth: 0 }}>
                                                <div className="pa-app-name">{audit.name}</div>
                                                <div className="pa-app-id">Application ID: {audit.application_id ?? "—"}</div>
                                            </div>
                                            <StatusBadge status={audit.status} />
                                        </div>
                                        <div className="pa-mobile-meta">
                                            <div><span className="pa-detail-heading">Assigned on</span><span className="pa-detail-value">{formatDate(audit.created_at)}</span></div>
                                            <div><span className="pa-detail-heading">Checklist</span><span className="pa-detail-value">{audit.domains.length} domains</span></div>
                                        </div>
                                        <button type="button" className="pa-expand" aria-expanded={expandedRow} onClick={() => toggleExpanded(audit.id)}>
                                            {expandedRow ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                            {expandedRow ? "Hide details" : "Show details"}
                                        </button>
                                        {expandedRow && <Details audit={audit} />}
                                        <div className="pa-mobile-actions"><Actions audit={audit} busy={busy} onView={setSelectedAudit} onDecide={startDecision} /></div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="pa-register-foot">
                    <span>Showing {first}–{last} of {filtered.length} assignments</span>
                    <div className="pa-pagination" aria-label="Assignment pagination">
                        <button type="button" className="pa-page-btn" aria-label="Previous page" disabled={currentPage === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}><FiChevronLeft aria-hidden="true" /></button>
                        <span>Page {currentPage} of {pageCount}</span>
                        <button type="button" className="pa-page-btn" aria-label="Next page" disabled={currentPage === pageCount || loading} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><FiChevronRight aria-hidden="true" /></button>
                    </div>
                </div>
            </section>

            <AuditViewModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />

            {decision && (
                <div className="pa-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDecision(null); }}>
                    <div className="pa-dialog" role="dialog" aria-modal="true" aria-labelledby="pa-dialog-title">
                        <div className="pa-dialog-head">
                            <h2 id="pa-dialog-title">{decision.type === "accept" ? "Accept assignment" : "Decline assignment"}</h2>
                            <button type="button" className="pa-page-btn" disabled={busy} aria-label="Close dialog" onClick={() => setDecision(null)}><FiX aria-hidden="true" /></button>
                        </div>
                        <div className="pa-dialog-body">
                            {decision.type === "accept" ? "Confirm that you wish to accept the assignment:" : "Provide a reason for declining this assignment:"}
                            <strong>{decision.audit.name}</strong>
                            {decision.type === "reject" && (
                                <>
                                    <label htmlFor="pa-decline-reason">Reason for declining *</label>
                                    <textarea id="pa-decline-reason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} maxLength={1000} placeholder="Enter a clear, specific reason..." required />
                                    <div style={{ textAlign: "right", fontSize: 11, marginTop: 4 }}>{rejectReason.length}/1000 characters</div>
                                </>
                            )}
                        </div>
                        <div className="pa-dialog-foot">
                            <button type="button" className="pa-dialog-button" disabled={busy} onClick={() => setDecision(null)}>Cancel</button>
                            <button type="button" className={`pa-dialog-button ${decision.type === "accept" ? "pa-dialog-button--accept" : "pa-dialog-button--decline"}`} disabled={busy || (decision.type === "reject" && !rejectReason.trim())} onClick={submitDecision}>
                                {busy ? "Submitting…" : decision.type === "accept" ? "Confirm acceptance" : "Submit decline"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// React fragments keep the DOM valid when expanded rows are inserted in <tbody>.
function FragmentRow({ children }) {
    return <>{children}</>;
}
