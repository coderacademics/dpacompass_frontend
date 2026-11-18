import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCalendar,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
    FiEye,
    FiExternalLink,
    FiFileText,
    FiInbox,
    FiLoader,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiSlash,
} from "react-icons/fi";

import DeclinedAuditsViewModal from "./DeclinedAuditsViewModal";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

// Only Declined Audits page styles are defined here.
// DashboardLayout controls the application background, sidebar and footer.
const pageStyles = String.raw`
.da-page {
    --da-ink: #17324f;
    --da-muted: #64788d;
    --da-border: #dfe7f0;
    --da-blue: #205b90;
    --da-danger: #b42332;
    width: 100%;
    min-width: 0;
    color: var(--da-ink);
    font-size: 14px;
}
.da-page *, .da-page *::before, .da-page *::after { box-sizing: border-box; }
.da-page button, .da-page input, .da-page select { font: inherit; }
.da-page :is(button,input,select):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.da-page button:disabled { cursor: not-allowed; opacity: .45; }
.da-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
.da-crumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--da-muted); font-size: 13px; }
.da-crumb strong { color: var(--da-ink); }
.da-top-actions { display: flex; gap: 9px; flex-wrap: wrap; }
.da-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 9px 13px; border: 1px solid #d6e2ed; border-radius: 9px; background: #fff; color: #285676; font-size: 13px; font-weight: 700; cursor: pointer; }
.da-button:hover:not(:disabled) { background: #eff5fb; }
.da-button--primary { background: var(--da-blue); border-color: var(--da-blue); color: #fff; }
.da-button--primary:hover:not(:disabled) { background: #17476f; }
.da-heading { margin-bottom: 22px; }
.da-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #9b3440; }
.da-title { margin: 0; font-size: clamp(23px, 2vw, 29px); font-weight: 760; line-height: 1.25; letter-spacing: -.025em; }
.da-description { margin: 7px 0 0; max-width: 760px; color: var(--da-muted); line-height: 1.6; }

/* List-first register: same visual rhythm as Accepted and In-Progress Audits. */
.da-panel { min-width: 0; overflow: hidden; border: 1px solid var(--da-border); border-radius: 14px; background: #fff; box-shadow: 0 4px 22px rgba(23,50,79,.035); }
.da-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; padding: 19px 20px; border-bottom: 1px solid var(--da-border); }
.da-register-title { margin: 0; color: var(--da-ink); font-size: 17px; font-weight: 750; }
.da-register-subtitle { margin: 4px 0 0; color: var(--da-muted); font-size: 12px; }
.da-filters { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.da-search { display: flex; align-items: center; gap: 9px; width: min(100%, 320px); min-height: 40px; padding: 0 12px; border: 1px solid #d5e0eb; border-radius: 9px; color: #68829b; background: #f9fbfe; }
.da-search:focus-within { border-color: #93b9dd; box-shadow: 0 0 0 3px #e4f0ff; }
.da-search input { width: 100%; min-width: 0; outline: 0; border: 0; background: transparent; color: var(--da-ink); }
.da-select { min-height: 40px; padding: 8px 11px; border: 1px solid #d5e0eb; border-radius: 9px; background: #fff; color: #31526e; cursor: pointer; }
.da-table-scroll { width: 100%; overflow-x: auto; }
.da-table { width: 100%; min-width: 1050px; border-collapse: collapse; text-align: left; }
.da-table thead { background: #f6f9fc; }
.da-table th { padding: 14px 16px; color: #526c83; font-size: 12px; font-weight: 750; white-space: nowrap; border-bottom: 1px solid var(--da-border); }
.da-table td { padding: 16px; color: #38556d; font-size: 14px; vertical-align: middle; border-bottom: 1px solid #edf1f5; }
.da-table tbody tr.da-row:hover { background: #f9fbfe; }
.da-application { display: flex; align-items: flex-start; gap: 11px; min-width: 210px; }
.da-app-icon { flex: 0 0 35px; display: grid; place-items: center; width: 35px; height: 35px; border-radius: 9px; background: #edf4fb; color: #245c90; }
.da-app-name { color: #193955; font-weight: 750; font-size: 14px; overflow-wrap: anywhere; }
.da-app-id { margin-top: 4px; color: #74889b; font-size: 11px; overflow-wrap: anywhere; }
.da-expand { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; padding: 0; color: var(--da-blue); background: transparent; border: 0; font-size: 12px; font-weight: 650; cursor: pointer; }
.da-date { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.da-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid #f0c6ca; border-radius: 999px; background: #fff1f2; color: var(--da-danger); font-size: 12px; font-weight: 750; white-space: nowrap; }
.da-reason { max-width: 240px; color: #5d6777; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow-wrap: anywhere; }
.da-view { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 13px; min-height: 37px; border-radius: 8px; border: 1px solid #c9dff3; background: #eef5fd; color: var(--da-blue); font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.da-view:hover:not(:disabled) { background: #dcecfb; border-color: #a8c8e5; }
.da-details-row td { padding: 0 16px 15px; background: #f9fbfe; }
.da-details { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; padding: 16px; border: 1px solid #dce7f1; border-radius: 10px; background: #fff; }
.da-detail-label { font-size: 11px; font-weight: 750; text-transform: uppercase; letter-spacing: .02em; color: #74889b; }
.da-detail-value { margin-top: 5px; color: #2d4961; line-height: 1.5; overflow-wrap: anywhere; }
.da-details-reason { grid-column: 1 / -1; padding: 12px 14px; border-radius: 9px; border: 1px solid #f1d8dc; background: #fff8f8; }
.da-details-reason .da-detail-value { white-space: pre-wrap; color: #7f303b; }
.da-domains { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
.da-domain { padding: 4px 8px; border-radius: 6px; color: #285b85; background: #eef5fd; font-size: 12px; }
.da-url { color: var(--da-blue); text-decoration: underline; text-underline-offset: 3px; }
.da-empty { display: grid; justify-items: center; gap: 9px; padding: 48px 20px; text-align: center; color: var(--da-muted); }
.da-empty-icon { color: #7c9cba; font-size: 32px; }
.da-empty-title { margin: 0; color: var(--da-ink); font-size: 17px; font-weight: 750; }
.da-empty p { max-width: 460px; margin: 0; line-height: 1.6; }
.da-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid var(--da-border); color: var(--da-muted); font-size: 12px; }
.da-pager { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.da-pager-button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #dce5ee; border-radius: 7px; color: var(--da-blue); background: #fff; cursor: pointer; }
.da-pager-button:hover:not(:disabled) { background: #eff5fb; }

/* Mobile cards replace the wide desktop table. */
.da-mobile-list { display: none; }
.da-mobile-card { padding: 16px; border-bottom: 1px solid var(--da-border); }
.da-mobile-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.da-mobile-meta { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 15px 0; }
.da-mobile-meta dt { color: var(--da-muted); font-size: 11px; font-weight: 750; }
.da-mobile-meta dd { margin: 5px 0 0; color: var(--da-ink); font-size: 13px; overflow-wrap: anywhere; }
.da-mobile-reason { margin: 0 0 15px; padding: 11px 12px; border: 1px solid #f1d8dc; border-radius: 9px; background: #fff8f8; }
.da-mobile-reason .da-detail-value { color: #7f303b; white-space: pre-wrap; }
.da-mobile-actions { display: flex; align-items: center; gap: 12px; justify-content: space-between; }
.da-mobile-actions .da-view { flex: 1; }
.da-mobile-details { margin-top: 12px; }
.da-mobile-details .da-details { grid-template-columns: 1fr; }
.da-spin { animation: da-spin .9s linear infinite; }
@keyframes da-spin { to { transform: rotate(360deg); } }

/* Light-surface compatibility for the existing DeclinedAuditsViewModal.
   It keeps the modal's logic and the checklist/evidence renderer untouched. */
.da-page > .fixed.inset-0 > div { background: #fff !important; color: var(--da-ink) !important; border-color: var(--da-border) !important; box-shadow: 0 24px 80px rgba(15,23,42,.20); }
.da-page > .fixed.inset-0 > div [class*="bg-[#020617]"],
.da-page > .fixed.inset-0 > div [class*="bg-[#0f172a]"],
.da-page > .fixed.inset-0 > div [class*="bg-[#111827]"],
.da-page > .fixed.inset-0 > div [class*="bg-[#1e293b]"] { background: #f7fafd !important; border-color: var(--da-border) !important; }
.da-page > .fixed.inset-0 > div [class*="text-indigo-300"] { color: #245b90 !important; }
.da-page > .fixed.inset-0 > div [class*="text-gray-400"] { color: var(--da-muted) !important; }
.da-page > .fixed.inset-0 > div [class*="text-white"],
.da-page > .fixed.inset-0 > div [class*="text-slate-200"],
.da-page > .fixed.inset-0 > div [class*="text-gray-300"] { color: var(--da-ink) !important; }
.da-page > .fixed.inset-0 > div input:not([type="checkbox"]),
.da-page > .fixed.inset-0 > div textarea { background: #fff !important; color: var(--da-ink) !important; border-color: #d6e1ec !important; }
.da-page > .fixed.inset-0 > div [class*="text-red-300"] { color: #97303a !important; }
.da-page > .fixed.inset-0 > div [class*="text-red-400"] { color: var(--da-danger) !important; }

@media (max-width: 1000px) {
    .da-table-scroll { display: none; }
    .da-mobile-list { display: block; }
    .da-filters { width: 100%; }
    .da-search { flex: 1; width: auto; }
}
@media (max-width: 640px) {
    .da-toolbar { padding: 16px; }
    .da-top-actions { width: 100%; }
    .da-top-actions .da-button { flex: 1; }
    .da-filters { flex-direction: column; align-items: stretch; }
    .da-search, .da-select { width: 100%; }
    .da-footer { padding: 13px 16px; }
    .da-mobile-card-head { flex-direction: column; }
    .da-mobile-meta { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) { .da-spin { animation: none; } }
`;

function extractList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    return null;
}

function formatDate(value) {
    if (!value) return "Not provided";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not provided"
        : date.toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
        });
}

function normalizeStatus(status) {
    const value = String(status || "declined").toLowerCase();
    return value.includes("reject") ? "Rejected" : "Declined";
}

function isSafeHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function AuditDetails({ audit }) {
    return (
        <div className="da-details">
            <div>
                <div className="da-detail-label">Audit ID</div>
                <div className="da-detail-value">{audit.id ?? "Not available"}</div>
            </div>
            <div>
                <div className="da-detail-label">Application URL</div>
                <div className="da-detail-value">
                    {isSafeHttpUrl(audit.url) ? (
                        <a className="da-url" href={audit.url} target="_blank" rel="noopener noreferrer">
                            {audit.url} <FiExternalLink aria-hidden="true" style={{ display: "inline" }} />
                        </a>
                    ) : (audit.url || "Not provided")}
                </div>
            </div>
            <div>
                <div className="da-detail-label">Checklist domains</div>
                <div className="da-detail-value">
                    {audit.domains.length ? (
                        <div className="da-domains">
                            {audit.domains.map((domain, index) => (
                                <span className="da-domain" key={domain.domain_id ?? `domain-${index}`}>
                                    {domain.domain_name || `Domain ${index + 1}`}
                                </span>
                            ))}
                        </div>
                    ) : "No linked domains available"}
                </div>
            </div>
            <div className="da-details-reason">
                <div className="da-detail-label">Reason for declining</div>
                <div className="da-detail-value">{audit.rejection_reason}</div>
            </div>
        </div>
    );
}

export default function DeclinedAudits() {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(() => new Set());

    const fetchDeclinedAudits = useCallback(async ({ signal, silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const response = await fetchWithAuth("/api/audits/assignments/declined/", { signal });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.message || payload.detail || "Failed to fetch declined audits.");
            }
            const declined = extractList(payload);
            if (!declined) {
                throw new Error("Unexpected declined-audits response from the server.");
            }

            const ids = [...new Set(declined.map((audit) => audit.application_id)
                .filter((id) => id !== null && id !== undefined))];

            // Secondary lookups are best-effort: a failed lookup must not hide the declined audit.
            const [applicationResults, checklistResults] = await Promise.all([
                Promise.allSettled(ids.map(async (id) => {
                    const res = await fetchWithAuth(
                        `/api/applications/applications/${encodeURIComponent(id)}/`, { signal }
                    );
                    return res.ok ? res.json() : null;
                })),
                Promise.allSettled(ids.map(async (id) => {
                    const res = await fetchWithAuth(
                        `/api/checklists/application/${encodeURIComponent(id)}/`, { signal }
                    );
                    return res.ok ? res.json() : null;
                })),
            ]);

            const applicationMap = new Map();
            const checklistMap = new Map();
            ids.forEach((id, index) => {
                const appResult = applicationResults[index];
                if (appResult.status === "fulfilled") {
                    applicationMap.set(String(id),
                        appResult.value?.data || appResult.value?.application || appResult.value || null
                    );
                }
                const checklistResult = checklistResults[index];
                if (checklistResult.status === "fulfilled") {
                    checklistMap.set(String(id), Array.isArray(checklistResult.value?.domains)
                        ? checklistResult.value.domains : []);
                }
            });

            if (!signal?.aborted) {
                setAudits(declined.map((audit) => ({
                    ...audit,
                    application_details: applicationMap.get(String(audit.application_id)) || null,
                    domains: checklistMap.get(String(audit.application_id)) || [],
                    rejection_reason: audit.rejection_reason || audit.reason || audit.remarks ||
                        "No rejection reason provided.",
                })));
            }
        } catch (err) {
            if (err?.name !== "AbortError" && !signal?.aborted) {
                console.error("Declined audits fetch error:", err);
                setError(err.message || "Server error while loading declined audits.");
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void fetchDeclinedAudits({ signal: controller.signal });
        return () => controller.abort();
    }, [fetchDeclinedAudits]);

    const formatted = useMemo(() => audits.map((audit, index) => ({
        id: audit.audit_id ?? audit.id,
        rowKey: `${audit.audit_id ?? audit.id ?? "audit"}-${audit.application_id ?? "application"}-${index}`,
        audit_id: audit.audit_id ?? audit.id,
        application_id: audit.application_id,
        name: audit.application_details?.name || "Application name unavailable",
        url: audit.application_details?.url || "",
        auditor_name: audit.auditor_name || "Not provided",
        status: audit.status || "declined",
        created_at: audit.created_at,
        rejection_reason: audit.rejection_reason,
        remarks: audit.remarks,
        domains: Array.isArray(audit.domains) ? audit.domains : [],
    })), [audits]);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        const matching = formatted.filter((audit) => !term || [
            audit.name, audit.application_id, audit.id, audit.auditor_name,
            audit.status, audit.rejection_reason,
        ].some((value) => String(value ?? "").toLowerCase().includes(term)));

        return [...matching].sort((a, b) => {
            if (sort === "name") return a.name.localeCompare(b.name);
            const difference = (new Date(a.created_at).getTime() || 0) -
                (new Date(b.created_at).getTime() || 0);
            return sort === "oldest" ? difference : -difference;
        });
    }, [formatted, query, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const start = filtered.length ? ((currentPage - 1) * pageSize + 1) : 0;
    const end = Math.min(currentPage * pageSize, filtered.length);

    const toggleExpanded = (key) => setExpanded((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });

    return (
        <div className="da-page">
            <style>{pageStyles}</style>

            <div className="da-top">
                <nav className="da-crumb" aria-label="Breadcrumb">
                    <FiShield aria-hidden="true" />
                    <span>Auditor Workspace</span>
                    <FiChevronRight aria-hidden="true" />
                    <strong aria-current="page">Declined Audits</strong>
                </nav>
                <div className="da-top-actions">
                    <button type="button" className="da-button" onClick={() => navigate("/auditdashboard")}>
                        <FiArrowLeft aria-hidden="true" /> Dashboard
                    </button>
                    <button type="button" className="da-button da-button--primary"
                        onClick={() => fetchDeclinedAudits({ silent: true })} disabled={loading || refreshing}>
                        <FiRefreshCw className={refreshing ? "da-spin" : ""} aria-hidden="true" />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            <header className="da-heading">
                <p className="da-kicker"><FiSlash aria-hidden="true" /> AUDIT MANAGEMENT</p>
                <h1 className="da-title">Declined Audits</h1>
                <p className="da-description">
                    Review declined assignments, understand the recorded reasons, and inspect the related application checklists.
                </p>
            </header>

            <section className="da-panel" aria-labelledby="da-register-title">
                <div className="da-toolbar">
                    <div>
                        <h2 id="da-register-title" className="da-register-title">Declined Audit Register</h2>
                        <p className="da-register-subtitle">
                            {loading ? "Loading records..." : `${formatted.length} declined ${formatted.length === 1 ? "assignment" : "assignments"}`}
                        </p>
                    </div>
                    <div className="da-filters">
                        <label className="da-search">
                            <FiSearch aria-hidden="true" />
                            <input type="search" aria-label="Search declined audits"
                                placeholder="Search application, ID, reason..."
                                value={query}
                                onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
                        </label>
                        <select className="da-select" aria-label="Sort declined audits" value={sort}
                            onChange={(event) => { setSort(event.target.value); setPage(1); }}>
                            <option value="newest">Newest records</option>
                            <option value="oldest">Oldest records</option>
                            <option value="name">Application A–Z</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="da-empty" role="status">
                        <FiLoader className="da-empty-icon da-spin" aria-hidden="true" />
                        <p className="da-empty-title">Loading declined audits</p>
                        <p>Retrieving assignments, application details and checklist domains.</p>
                    </div>
                ) : error ? (
                    <div className="da-empty" role="alert">
                        <FiAlertCircle className="da-empty-icon" aria-hidden="true" />
                        <p className="da-empty-title">Unable to load declined audits</p>
                        <p>{error}</p>
                        <button type="button" className="da-button" onClick={() => fetchDeclinedAudits()}>Try again</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="da-empty">
                        <FiInbox className="da-empty-icon" aria-hidden="true" />
                        <p className="da-empty-title">{query ? "No matching records" : "No declined audits"}</p>
                        <p>{query ? "Try another search term." : "Declined assignments will appear here when available."}</p>
                    </div>
                ) : (
                    <>
                        <div className="da-table-scroll">
                            <table className="da-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Application</th>
                                        <th scope="col">Auditor</th>
                                        <th scope="col">Reason</th>
                                        <th scope="col">Assigned on</th>
                                        {/* <th scope="col">Status</th> */}
                                        <th scope="col" style={{ textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((audit) => {
                                        const isExpanded = expanded.has(audit.rowKey);
                                        return (
                                            <Fragment key={audit.rowKey}>
                                                <tr className="da-row">
                                                    <td>
                                                        <div className="da-application">
                                                            <span className="da-app-icon"><FiFileText aria-hidden="true" /></span>
                                                            <div>
                                                                <div className="da-app-name">{audit.name}</div>
                                                                <div className="da-app-id">Application ID: {audit.application_id ?? "N/A"}</div>
                                                                <button type="button" className="da-expand"
                                                                    aria-expanded={isExpanded} onClick={() => toggleExpanded(audit.rowKey)}>
                                                                    {isExpanded ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                                                    {isExpanded ? "Hide details" : "More details"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{audit.auditor_name}</td>
                                                    <td><div className="da-reason" title={audit.rejection_reason}>{audit.rejection_reason}</div></td>
                                                    <td><span className="da-date"><FiCalendar aria-hidden="true" />{formatDate(audit.created_at)}</span></td>
                                                    {/* <td><span className="da-status"><FiSlash aria-hidden="true" />{normalizeStatus(audit.status)}</span></td> */}
                                                    <td style={{ textAlign: "right" }}>
                                                        <button type="button" className="da-view"
                                                            onClick={() => setSelectedAudit(audit)} aria-label={`View ${audit.name}`}>
                                                            <FiEye aria-hidden="true" /> View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="da-details-row">
                                                        <td colSpan={6}><AuditDetails audit={audit} /></td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="da-mobile-list">
                            {visible.map((audit) => {
                                const isExpanded = expanded.has(audit.rowKey);
                                return (
                                    <article className="da-mobile-card" key={audit.rowKey}>
                                        <div className="da-mobile-card-head">
                                            <div>
                                                <div className="da-app-name">{audit.name}</div>
                                                <div className="da-app-id">Application ID: {audit.application_id ?? "N/A"}</div>
                                            </div>
                                            <span className="da-status"><FiSlash aria-hidden="true" />{normalizeStatus(audit.status)}</span>
                                        </div>
                                        <dl className="da-mobile-meta">
                                            <div><dt>Auditor</dt><dd>{audit.auditor_name}</dd></div>
                                            <div><dt>Assigned on</dt><dd>{formatDate(audit.created_at)}</dd></div>
                                        </dl>
                                        <div className="da-mobile-reason">
                                            <div className="da-detail-label">Reason for declining</div>
                                            <div className="da-detail-value">{audit.rejection_reason}</div>
                                        </div>
                                        <div className="da-mobile-actions">
                                            <button type="button" className="da-expand"
                                                aria-expanded={isExpanded} onClick={() => toggleExpanded(audit.rowKey)}>
                                                {isExpanded ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                                {isExpanded ? "Hide details" : "More details"}
                                            </button>
                                            <button type="button" className="da-view"
                                                onClick={() => setSelectedAudit(audit)}>
                                                <FiEye aria-hidden="true" /> View Details
                                            </button>
                                        </div>
                                        {isExpanded && <div className="da-mobile-details"><AuditDetails audit={audit} /></div>}
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="da-footer">
                    <span>{filtered.length ? `Showing ${start}–${end} of ${filtered.length}` : "0 records"}{query ? ` · ${formatted.length} total` : ""}</span>
                    <div className="da-pager">
                        <label htmlFor="da-page-size">Rows per page</label>
                        <select id="da-page-size" className="da-select" value={pageSize}
                            onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <button type="button" className="da-pager-button"
                            aria-label="Previous page" disabled={currentPage <= 1}
                            onClick={() => setPage(Math.max(1, currentPage - 1))}>
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <span>Page {currentPage} / {pageCount}</span>
                        <button type="button" className="da-pager-button"
                            aria-label="Next page" disabled={currentPage >= pageCount}
                            onClick={() => setPage(Math.min(pageCount, currentPage + 1))}>
                            <FiChevronRight aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </section>

            <DeclinedAuditsViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />
        </div>
    );
}
