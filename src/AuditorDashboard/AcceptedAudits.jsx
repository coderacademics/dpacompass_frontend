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
    FiExternalLink,
    FiFileText,
    FiInbox,
    FiLoader,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiCheckCircle
} from "react-icons/fi";

import { fetchWithAuth } from "../utilities/fetchWithAuth";

// Page styling is scoped to this component. DashboardLayout owns the page background.
const pageStyles = String.raw`
.aa-page {
    --aa-text: #17324f;
    --aa-muted: #64788d;
    --aa-border: #dfe7f0;
    --aa-blue: #205b90;
    width: 100%;
    min-width: 0;
    color: var(--aa-text);
    font-size: 14px;
}
.aa-page *, .aa-page *::before, .aa-page *::after { box-sizing: border-box; }
.aa-page button, .aa-page input, .aa-page select { font: inherit; }
.aa-page :is(button,input,select):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.aa-page button:disabled { opacity: .5; cursor: not-allowed; }

/* Compact heading: keep the list as the main focus */
.aa-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
.aa-crumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--aa-muted); font-size: 13px; }
.aa-crumb strong { color: var(--aa-text); }
.aa-top-actions { display: flex; gap: 9px; flex-wrap: wrap; }
.aa-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 9px 13px; border: 1px solid #d6e2ed; border-radius: 9px; background: #fff; color: #285676; font-size: 13px; font-weight: 700; cursor: pointer; }
.aa-button:hover:not(:disabled) { background: #eff5fb; }
.aa-button--primary { background: #205b90; border-color: #205b90; color: white; }
.aa-button--primary:hover:not(:disabled) { background: #17476f; }
.aa-heading { margin-bottom: 22px; }
.aa-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #397358; }
.aa-title { margin: 0; font-size: clamp(23px, 2vw, 29px); font-weight: 760; line-height: 1.25; letter-spacing: -.025em; }
.aa-description { margin: 7px 0 0; max-width: 720px; line-height: 1.55; color: var(--aa-muted); }

/* Register / filters */
.aa-panel { min-width: 0; overflow: hidden; border: 1px solid var(--aa-border); border-radius: 14px; background: #fff; box-shadow: 0 4px 22px rgba(23,50,79,.035); }
.aa-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; padding: 19px 20px; border-bottom: 1px solid var(--aa-border); }
.aa-register-title { margin: 0; font-size: 17px; font-weight: 750; }
.aa-register-subtitle { margin: 4px 0 0; color: var(--aa-muted); font-size: 12px; }
.aa-filters { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.aa-search { display: flex; align-items: center; gap: 9px; width: min(100%, 300px); min-height: 40px; padding: 0 12px; border: 1px solid #d5e0eb; border-radius: 9px; color: #68829b; background: #f9fbfe; }
.aa-search:focus-within { border-color: #93b9dd; box-shadow: 0 0 0 3px #e4f0ff; }
.aa-search input { width: 100%; min-width: 0; outline: 0; border: 0; background: transparent; color: var(--aa-text); }
.aa-select { min-height: 40px; padding: 8px 11px; border: 1px solid #d5e0eb; border-radius: 9px; background: #fff; color: #31526e; cursor: pointer; }
.aa-table-scroll { overflow-x: auto; width: 100%; }
.aa-table { width: 100%; border-collapse: collapse; min-width: 800px; text-align: left; }
.aa-table thead { background: #f6f9fc; }
.aa-table th { padding: 14px 17px; font-size: 12px; font-weight: 750; color: #526c83; white-space: nowrap; border-bottom: 1px solid var(--aa-border); }
.aa-table td { padding: 16px 17px; border-bottom: 1px solid #edf1f5; vertical-align: middle; color: #38556d; }
.aa-table tbody tr.aa-row:hover { background: #f9fbfe; }
.aa-application { display: flex; align-items: flex-start; gap: 11px; min-width: 220px; }
.aa-app-icon { flex: 0 0 35px; display: grid; place-items: center; width: 35px; height: 35px; border-radius: 9px; background: #edf4fb; color: #245c90; }
.aa-app-name { color: #193955; font-weight: 750; font-size: 14px; overflow-wrap: anywhere; }
.aa-app-id { margin-top: 4px; font-size: 11px; color: #74889b; overflow-wrap: anywhere; }
.aa-expand { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; padding: 0; color: var(--aa-blue); background: transparent; border: 0; font-size: 12px; font-weight: 650; cursor: pointer; }
.aa-date { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.aa-open { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 13px; min-height: 37px; border-radius: 8px; border: 1px solid #c9dff3; background: #eef5fd; color: #205b90; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; }
.aa-open:hover:not(:disabled) { background: #dcecfb; border-color: #a8c8e5; }
.aa-details-row td { padding: 0 17px 15px; background: #f9fbfe; }
.aa-details { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 15px; padding: 16px; border: 1px solid #dce7f1; border-radius: 10px; background: #fff; }
.aa-detail-label { font-size: 11px; font-weight: 750; letter-spacing: .02em; text-transform: uppercase; color: #74889b; }
.aa-detail-value { margin-top: 5px; color: #2d4961; overflow-wrap: anywhere; }
.aa-empty { display: grid; justify-items: center; gap: 9px; padding: 48px 20px; text-align: center; color: var(--aa-muted); }
.aa-empty-icon { font-size: 32px; color: #6c94b8; }
.aa-empty-title { margin: 0; color: var(--aa-text); font-size: 17px; font-weight: 750; }
.aa-empty p { max-width: 470px; margin: 0; line-height: 1.55; }

/* Pager */
.aa-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid var(--aa-border); color: var(--aa-muted); font-size: 12px; }
.aa-pagination { display: flex; align-items: center; gap: 7px; }
.aa-page-button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #dce5ee; border-radius: 7px; background: #fff; color: var(--aa-blue); cursor: pointer; }
.aa-page-button:hover:not(:disabled) { background: #eff5fb; }

/* Card list on mobile (no horizontal scrolling) */
.aa-mobile-list { display: none; }
.aa-mobile-card { padding: 16px; border-bottom: 1px solid var(--aa-border); }
.aa-mobile-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.aa-mobile-meta { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 16px 0; }
.aa-mobile-meta dt { font-size: 11px; font-weight: 750; color: var(--aa-muted); }
.aa-mobile-meta dd { margin: 5px 0 0; font-size: 13px; color: var(--aa-text); overflow-wrap: anywhere; }
.aa-mobile-actions { display: flex; gap: 9px; align-items: center; justify-content: space-between; }
.aa-mobile-actions .aa-open { flex: 1; }
.aa-mobile-details { margin-top: 12px; padding: 12px; border-radius: 9px; background: #f5f9fd; }
.aa-mobile-details .aa-details { grid-template-columns: 1fr; }
.aa-spin { animation: aa-spin .9s linear infinite; }
@keyframes aa-spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
    .aa-table-scroll { display: none; }
    .aa-mobile-list { display: block; }
    .aa-filters { width: 100%; }
    .aa-search { flex: 1; width: auto; }
}
@media (max-width: 600px) {
    .aa-toolbar { padding: 16px; }
    .aa-top-actions { width: 100%; }
    .aa-top-actions .aa-button { flex: 1; }
    .aa-filters { flex-direction: column; align-items: stretch; }
    .aa-search, .aa-select { width: 100%; }
    .aa-footer { padding: 13px 16px; }
    .aa-mobile-card-head { flex-direction: column; }
    .aa-mobile-meta { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) { .aa-spin { animation: none; } }
`;

function getList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    return [];
}

function formatDate(value) {
    if (!value) return "Not provided";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not provided"
        : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Details({ audit }) {
    return (
        <div className="aa-details">
            <div>
                <div className="aa-detail-label">Audit ID</div>
                <div className="aa-detail-value">{audit.id ?? "Not available"}</div>
            </div>
            <div>
                <div className="aa-detail-label">Public audit ID</div>
                <div className="aa-detail-value">{audit.public_audit_id ?? "Not available"}</div>
            </div>
            <div>
                <div className="aa-detail-label">Application URL</div>
                <div className="aa-detail-value">{audit.url || "Not provided"}</div>
            </div>
        </div>
    );
}

export default function AcceptedAudits() {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(() => new Set());

    const fetchAcceptedAudits = useCallback(async ({ signal, silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const response = await fetchWithAuth("/api/audits/assignments/accepted/", { signal });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.message || payload.detail || "Unable to load accepted audits.");
            }

            const accepted = getList(payload);
            const ids = [...new Set(accepted.map((audit) => audit.application_id).filter((id) => id != null))];

            // Auxiliary lookups are best-effort: an unavailable application must not hide an audit.
            const appResults = await Promise.allSettled(ids.map(async (id) => {
                const res = await fetchWithAuth(
                    `/api/applications/applications/${encodeURIComponent(id)}/`,
                    { signal }
                );
                return res.ok ? res.json() : null;
            }));

            const appMap = new Map();
            ids.forEach((id, index) => {
                const item = appResults[index];
                if (item.status === "fulfilled") {
                    appMap.set(String(id), item.value?.data || item.value?.application || item.value || null);
                }
            });

            if (!signal?.aborted) {
                setAudits(accepted.map((audit) => ({
                    ...audit,
                    application_details: appMap.get(String(audit.application_id)) || null,
                })));
            }
        } catch (err) {
            if (err?.name !== "AbortError" && !signal?.aborted) {
                setError(err.message || "Unable to retrieve accepted audits.");
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
        void fetchAcceptedAudits({ signal: controller.signal });
        return () => controller.abort();
    }, [fetchAcceptedAudits]);

    const formatted = useMemo(() => audits.map((audit, index) => ({
        id: audit.audit_id ?? audit.id,
        rowKey: String(audit.audit_id ?? audit.id ?? `row-${index}`),
        public_audit_id: audit.public_audit_id,
        application_id: audit.application_id,
        name: audit.application_details?.name || "Application name unavailable",
        url: audit.application_details?.url || "",
        auditor_name: audit.auditor_name || "Not provided",
        status: audit.status || "accepted",
        created_at: audit.created_at,
    })), [audits]);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        const list = formatted.filter((audit) => !term || [
            audit.name, audit.application_id, audit.id,
            audit.public_audit_id, audit.auditor_name, audit.status,
        ].some((value) => String(value ?? "").toLowerCase().includes(term)));

        return [...list].sort((a, b) => {
            if (sort === "name") return a.name.localeCompare(b.name);
            const difference = (new Date(a.created_at).getTime() || 0) -
                (new Date(b.created_at).getTime() || 0);
            return sort === "oldest" ? difference : -difference;
        });
    }, [formatted, query, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const start = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, filtered.length);

    const toggleExpanded = (key) => {
        setExpanded((previous) => {
            const next = new Set(previous);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const openWorkspace = (audit) => {
        if (audit.public_audit_id == null || String(audit.public_audit_id).trim() === "") return;
        navigate(`/auditor-workspace/${encodeURIComponent(String(audit.public_audit_id))}`);
    };

    const canOpen = (audit) => audit.public_audit_id != null &&
        String(audit.public_audit_id).trim() !== "";

    return (
        <div className="aa-page">
            <style>{pageStyles}</style>

            <div className="aa-top">
                <div className="aa-crumb" aria-label="Breadcrumb">
                    <FiShield aria-hidden="true" />
                    <span>Auditor Workspace</span>
                    <FiChevronRight aria-hidden="true" />
                    <strong>Accepted Audits</strong>
                </div>
                <div className="aa-top-actions">
                    <button type="button" className="aa-button" onClick={() => navigate("/auditdashboard")}>
                        <FiArrowLeft aria-hidden="true" /> Dashboard
                    </button>
                    <button
                        type="button"
                        className="aa-button aa-button--primary"
                        onClick={() => fetchAcceptedAudits({ silent: true })}
                        disabled={loading || refreshing}
                    >
                        <FiRefreshCw className={refreshing ? "aa-spin" : ""} aria-hidden="true" />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            <header className="aa-heading">
                <p className="aa-kicker"><FiCheckCircle aria-hidden="true" /> AUDIT MANAGEMENT</p>
                <h1 className="aa-title">Accepted Audits</h1>
                <p className="aa-description">
                    Review accepted assignments and open the auditor workspace to continue your audit work.
                </p>
            </header>

            <section className="aa-panel" aria-labelledby="aa-register-title">
                <div className="aa-toolbar">
                    <div>
                        <h2 className="aa-register-title" id="aa-register-title">Accepted Audit Register</h2>
                        <p className="aa-register-subtitle">
                            {loading ? "Loading records..." : `${formatted.length} accepted ${formatted.length === 1 ? "assignment" : "assignments"}`}
                        </p>
                    </div>
                    <div className="aa-filters">
                        <label className="aa-search">
                            <FiSearch aria-hidden="true" />
                            <input
                                aria-label="Search accepted audits"
                                placeholder="Search application, ID or auditor..."
                                value={query}
                                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                            />
                        </label>
                        <select
                            className="aa-select"
                            aria-label="Sort accepted audits"
                            value={sort}
                            onChange={(event) => { setSort(event.target.value); setPage(1); }}
                        >
                            <option value="newest">Newest assigned</option>
                            <option value="oldest">Oldest assigned</option>
                            <option value="name">Application A–Z</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="aa-empty" role="status">
                        <FiLoader className="aa-empty-icon aa-spin" aria-hidden="true" />
                        <p className="aa-empty-title">Loading accepted audits</p>
                        <p>Retrieving your assignments and application details.</p>
                    </div>
                ) : error ? (
                    <div className="aa-empty" role="alert">
                        <FiAlertCircle className="aa-empty-icon" aria-hidden="true" />
                        <p className="aa-empty-title">Unable to load accepted audits</p>
                        <p>{error}</p>
                        <button type="button" className="aa-button" onClick={() => fetchAcceptedAudits()}>Try again</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="aa-empty">
                        <FiInbox className="aa-empty-icon" aria-hidden="true" />
                        <p className="aa-empty-title">{query ? "No matching audits" : "No accepted audits"}</p>
                        <p>{query ? "Try another application name or audit ID." : "Accepted assignments will appear here."}</p>
                    </div>
                ) : (
                    <>
                        <div className="aa-table-scroll">
                            <table className="aa-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Application</th>
                                        {/* <th scope="col">Auditor</th> */}
                                        <th scope="col">Assignment date</th>
                                        <th scope="col" style={{ textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((audit) => {
                                        const isExpanded = expanded.has(audit.rowKey);
                                        return (
                                            <Fragment key={audit.rowKey}>
                                                <tr className="aa-row">
                                                    <td>
                                                        <div className="aa-application">
                                                            <span className="aa-app-icon"><FiFileText aria-hidden="true" /></span>
                                                            <div>
                                                                <div className="aa-app-name">{audit.name}</div>
                                                                <div className="aa-app-id">Application ID: {audit.application_id ?? "N/A"}</div>
                                                                <button
                                                                    type="button"
                                                                    className="aa-expand"
                                                                    aria-expanded={isExpanded}
                                                                    onClick={() => toggleExpanded(audit.rowKey)}
                                                                >
                                                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                                    {isExpanded ? "Hide details" : "More details"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* <td>{audit.auditor_name}</td> */}
                                                    <td><span className="aa-date"><FiCalendar aria-hidden="true" />{formatDate(audit.created_at)}</span></td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <button
                                                            type="button"
                                                            className="aa-open"
                                                            disabled={!canOpen(audit)}
                                                            title={canOpen(audit) ? "Open Auditor Workspace" : "Public audit ID is unavailable"}
                                                            onClick={() => openWorkspace(audit)}
                                                        >
                                                            Open Workspace <FiExternalLink aria-hidden="true" />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="aa-details-row"><td colSpan={3}><Details audit={audit} /></td></tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="aa-mobile-list">
                            {visible.map((audit) => {
                                const isExpanded = expanded.has(audit.rowKey);
                                return (
                                    <article className="aa-mobile-card" key={audit.rowKey}>
                                        <div className="aa-mobile-card-head">
                                            <div className="aa-application">
                                                <span className="aa-app-icon"><FiFileText aria-hidden="true" /></span>
                                                <div>
                                                    <div className="aa-app-name">{audit.name}</div>
                                                    <div className="aa-app-id">Application ID: {audit.application_id ?? "N/A"}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <dl className="aa-mobile-meta">
                                            <div><dt>Auditor</dt><dd>{audit.auditor_name}</dd></div>
                                            <div><dt>Assignment date</dt><dd>{formatDate(audit.created_at)}</dd></div>
                                        </dl>
                                        <div className="aa-mobile-actions">
                                            <button
                                                type="button"
                                                className="aa-expand"
                                                aria-expanded={isExpanded}
                                                onClick={() => toggleExpanded(audit.rowKey)}
                                            >
                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                {isExpanded ? "Less details" : "Details"}
                                            </button>
                                            <button
                                                type="button"
                                                className="aa-open"
                                                disabled={!canOpen(audit)}
                                                title={canOpen(audit) ? "Open Auditor Workspace" : "Public audit ID is unavailable"}
                                                onClick={() => openWorkspace(audit)}
                                            >
                                                Open Workspace <FiExternalLink aria-hidden="true" />
                                            </button>
                                        </div>
                                        {isExpanded && <div className="aa-mobile-details"><Details audit={audit} /></div>}
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="aa-footer">
                    <span>{filtered.length ? `Showing ${start}–${end} of ${filtered.length}` : "0 records"}</span>
                    <div className="aa-pagination">
                        <label htmlFor="aa-page-size">Rows:</label>
                        <select
                            id="aa-page-size"
                            className="aa-select"
                            value={pageSize}
                            onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <button type="button" className="aa-page-button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} aria-label="Previous page">
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <span>Page {currentPage} / {pageCount}</span>
                        <button type="button" className="aa-page-button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage >= pageCount} aria-label="Next page">
                            <FiChevronRight aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
