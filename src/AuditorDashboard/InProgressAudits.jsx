import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCalendar,
    FiActivity,
    FiClock,
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
} from "react-icons/fi";

import { fetchWithAuth } from "../utilities/fetchWithAuth";

// Page styling is scoped to this component. DashboardLayout owns the page background.
const pageStyles = String.raw`
.ip-page {
    --ip-text: #17324f;
    --ip-muted: #64788d;
    --ip-border: #dfe7f0;
    --ip-blue: #205b90;
    width: 100%;
    min-width: 0;
    color: var(--ip-text);
    font-size: 14px;
}
.ip-page *, .ip-page *::before, .ip-page *::after { box-sizing: border-box; }
.ip-page button, .ip-page input, .ip-page select { font: inherit; }
.ip-page :is(button,input,select):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.ip-page button:disabled { opacity: .5; cursor: not-allowed; }

/* Compact heading: keep the list as the main focus */
.ip-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
.ip-crumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--ip-muted); font-size: 13px; }
.ip-crumb strong { color: var(--ip-text); }
.ip-top-actions { display: flex; gap: 9px; flex-wrap: wrap; }
.ip-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 9px 13px; border: 1px solid #d6e2ed; border-radius: 9px; background: #fff; color: #285676; font-size: 13px; font-weight: 700; cursor: pointer; }
.ip-button:hover:not(:disabled) { background: #eff5fb; }
.ip-button--primary { background: #205b90; border-color: #205b90; color: white; }
.ip-button--primary:hover:not(:disabled) { background: #17476f; }
.ip-heading { margin-bottom: 22px; }
.ip-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #245b93; }
.ip-title { margin: 0; font-size: clamp(23px, 2vw, 29px); font-weight: 760; line-height: 1.25; letter-spacing: -.025em; }
.ip-description { margin: 7px 0 0; max-width: 720px; line-height: 1.55; color: var(--ip-muted); }

/* Register / filters */
.ip-panel { min-width: 0; overflow: hidden; border: 1px solid var(--ip-border); border-radius: 14px; background: #fff; box-shadow: 0 4px 22px rgba(23,50,79,.035); }
.ip-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; padding: 19px 20px; border-bottom: 1px solid var(--ip-border); }
.ip-register-title { margin: 0; font-size: 17px; font-weight: 750; }
.ip-register-subtitle { margin: 4px 0 0; color: var(--ip-muted); font-size: 12px; }
.ip-filters { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.ip-search { display: flex; align-items: center; gap: 9px; width: min(100%, 300px); min-height: 40px; padding: 0 12px; border: 1px solid #d5e0eb; border-radius: 9px; color: #68829b; background: #f9fbfe; }
.ip-search:focus-within { border-color: #93b9dd; box-shadow: 0 0 0 3px #e4f0ff; }
.ip-search input { width: 100%; min-width: 0; outline: 0; border: 0; background: transparent; color: var(--ip-text); }
.ip-select { min-height: 40px; padding: 8px 11px; border: 1px solid #d5e0eb; border-radius: 9px; background: #fff; color: #31526e; cursor: pointer; }
.ip-table-scroll { overflow-x: auto; width: 100%; }
.ip-table { width: 100%; border-collapse: collapse; min-width: 800px; text-align: left; }
.ip-table thead { background: #f6f9fc; }
.ip-table th { padding: 14px 17px; font-size: 12px; font-weight: 750; color: #526c83; white-space: nowrap; border-bottom: 1px solid var(--ip-border); }
.ip-table td { padding: 16px 17px; font-size: 14px; border-bottom: 1px solid #edf1f5; vertical-align: middle; color: #38556d; }
.ip-table tbody tr.ip-row:hover { background: #f9fbfe; }
.ip-application { display: flex; align-items: flex-start; gap: 11px; min-width: 220px; }
.ip-app-icon { flex: 0 0 35px; display: grid; place-items: center; width: 35px; height: 35px; border-radius: 9px; background: #edf4fb; color: #245c90; }
.ip-app-name { color: #193955; font-weight: 750; font-size: 14px; overflow-wrap: anywhere; }
.ip-app-id { margin-top: 4px; font-size: 11px; color: #74889b; overflow-wrap: anywhere; }
.ip-expand { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; padding: 0; color: var(--ip-blue); background: transparent; border: 0; font-size: 12px; font-weight: 650; cursor: pointer; }
.ip-date { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.ip-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid #c8dcf4; border-radius: 999px; background: #eef5ff; color: #235f9a; font-size: 12px; font-weight: 750; }
.ip-open { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 13px; min-height: 37px; border-radius: 8px; border: 1px solid #c9dff3; background: #eef5fd; color: #205b90; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; }
.ip-open:hover:not(:disabled) { background: #dcecfb; border-color: #a8c8e5; }
.ip-details-row td { padding: 0 17px 15px; background: #f9fbfe; }
.ip-details { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 15px; padding: 16px; border: 1px solid #dce7f1; border-radius: 10px; background: #fff; }
.ip-detail-label { font-size: 11px; font-weight: 750; letter-spacing: .02em; text-transform: uppercase; color: #74889b; }
.ip-detail-value { margin-top: 5px; color: #2d4961; overflow-wrap: anywhere; }
.ip-empty { display: grid; justify-items: center; gap: 9px; padding: 48px 20px; text-align: center; color: var(--ip-muted); }
.ip-empty-icon { font-size: 32px; color: #6c94b8; }
.ip-empty-title { margin: 0; color: var(--ip-text); font-size: 17px; font-weight: 750; }
.ip-empty p { max-width: 470px; margin: 0; line-height: 1.55; }

/* Pager */
.ip-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid var(--ip-border); color: var(--ip-muted); font-size: 12px; }
.ip-pagination { display: flex; align-items: center; gap: 7px; }
.ip-page-button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #dce5ee; border-radius: 7px; background: #fff; color: var(--ip-blue); cursor: pointer; }
.ip-page-button:hover:not(:disabled) { background: #eff5fb; }

/* Card list on mobile (no horizontal scrolling) */
.ip-mobile-list { display: none; }
.ip-mobile-card { padding: 16px; border-bottom: 1px solid var(--ip-border); }
.ip-mobile-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ip-mobile-meta { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 16px 0; }
.ip-mobile-meta dt { font-size: 11px; font-weight: 750; color: var(--ip-muted); }
.ip-mobile-meta dd { margin: 5px 0 0; font-size: 13px; color: var(--ip-text); overflow-wrap: anywhere; }
.ip-mobile-actions { display: flex; gap: 9px; align-items: center; justify-content: space-between; }
.ip-mobile-actions .ip-open { flex: 1; }
.ip-mobile-details { margin-top: 12px; padding: 12px; border-radius: 9px; background: #f5f9fd; }
.ip-mobile-details .ip-details { grid-template-columns: 1fr; }
.ip-spin { animation: ip-spin .9s linear infinite; }
@keyframes ip-spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
    .ip-table-scroll { display: none; }
    .ip-mobile-list { display: block; }
    .ip-filters { width: 100%; }
    .ip-search { flex: 1; width: auto; }
}
@media (max-width: 600px) {
    .ip-toolbar { padding: 16px; }
    .ip-top-actions { width: 100%; }
    .ip-top-actions .ip-button { flex: 1; }
    .ip-filters { flex-direction: column; align-items: stretch; }
    .ip-search, .ip-select { width: 100%; }
    .ip-footer { padding: 13px 16px; }
    .ip-mobile-card-head { flex-direction: column; }
    .ip-mobile-meta { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) { .ip-spin { animation: none; } }
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
        <div className="ip-details">
            <div>
                <div className="ip-detail-label">Audit ID</div>
                <div className="ip-detail-value">{audit.id ?? "Not available"}</div>
            </div>
            <div>
                <div className="ip-detail-label">Public audit ID</div>
                <div className="ip-detail-value">{audit.public_audit_id ?? "Not available"}</div>
            </div>
            <div>
                <div className="ip-detail-label">Application URL</div>
                <div className="ip-detail-value">{audit.url || "Not provided"}</div>
            </div>
        </div>
    );
}

export default function InProgressAudits() {
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

    const fetchInProgressAudits = useCallback(async ({ signal, silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const response = await fetchWithAuth("/api/audits/inprogress", { signal });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.message || payload.detail || "Unable to load in-progress audits.");
            }

            const inProgress = getList(payload);
            const ids = [...new Set(inProgress.map((audit) => audit.application_id).filter((id) => id != null))];

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
                setAudits(inProgress.map((audit) => ({
                    ...audit,
                    application_details: appMap.get(String(audit.application_id)) || null,
                })));
            }
        } catch (err) {
            if (err?.name !== "AbortError" && !signal?.aborted) {
                setError(err.message || "Unable to retrieve in-progress audits.");
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
        void fetchInProgressAudits({ signal: controller.signal });
        return () => controller.abort();
    }, [fetchInProgressAudits]);

    const formatted = useMemo(() => audits.map((audit, index) => ({
        id: audit.audit_id ?? audit.id,
        rowKey: String(audit.audit_id ?? audit.id ?? `row-${index}`),
        public_audit_id: audit.public_audit_id,
        application_id: audit.application_id,
        name: audit.application_details?.name || "Application name unavailable",
        url: audit.application_details?.url || "",
        auditor_name: audit.auditor_name || "Not provided",
        // status: audit.status || "in_progress",
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
        <div className="ip-page">
            <style>{pageStyles}</style>

            <div className="ip-top">
                <div className="ip-crumb" aria-label="Breadcrumb">
                    <FiShield aria-hidden="true" />
                    <span>Auditor Workspace</span>
                    <FiChevronRight aria-hidden="true" />
                    <strong>In-Progress Audits</strong>
                </div>
                <div className="ip-top-actions">
                    <button type="button" className="ip-button" onClick={() => navigate("/auditdashboard")}>
                        <FiArrowLeft aria-hidden="true" /> Dashboard
                    </button>
                    <button
                        type="button"
                        className="ip-button ip-button--primary"
                        onClick={() => fetchInProgressAudits({ silent: true })}
                        disabled={loading || refreshing}
                    >
                        <FiRefreshCw className={refreshing ? "ip-spin" : ""} aria-hidden="true" />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            <header className="ip-heading">
                <p className="ip-kicker"><FiActivity aria-hidden="true" /> AUDIT MANAGEMENT</p>
                <h1 className="ip-title">In-Progress Audits</h1>
                <p className="ip-description">
                    View ongoing audits and resume checklist work directly from the assignment register.
                </p>
            </header>

            <section className="ip-panel" aria-labelledby="ip-register-title">
                <div className="ip-toolbar">
                    <div>
                        <h2 className="ip-register-title" id="ip-register-title">In-Progress Audit Register</h2>
                        <p className="ip-register-subtitle">
                            {loading ? "Loading records..." : `${formatted.length} active ${formatted.length === 1 ? "audit" : "audits"}`}
                        </p>
                    </div>
                    <div className="ip-filters">
                        <label className="ip-search">
                            <FiSearch aria-hidden="true" />
                            <input
                                aria-label="Search in-progress audits"
                                placeholder="Search application, ID or auditor..."
                                value={query}
                                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                            />
                        </label>
                        <select
                            className="ip-select"
                            aria-label="Sort in-progress audits"
                            value={sort}
                            onChange={(event) => { setSort(event.target.value); setPage(1); }}
                        >
                            <option value="newest">Newest records</option>
                            <option value="oldest">Oldest records</option>
                            <option value="name">Application A–Z</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="ip-empty" role="status">
                        <FiLoader className="ip-empty-icon ip-spin" aria-hidden="true" />
                        <p className="ip-empty-title">Loading in-progress audits</p>
                        <p>Retrieving your assignments and application details.</p>
                    </div>
                ) : error ? (
                    <div className="ip-empty" role="alert">
                        <FiAlertCircle className="ip-empty-icon" aria-hidden="true" />
                        <p className="ip-empty-title">Unable to load in-progress audits</p>
                        <p>{error}</p>
                        <button type="button" className="ip-button" onClick={() => fetchInProgressAudits()}>Try again</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="ip-empty">
                        <FiInbox className="ip-empty-icon" aria-hidden="true" />
                        <p className="ip-empty-title">{query ? "No matching audits" : "No in-progress audits"}</p>
                        <p>{query ? "Try another application name or audit ID." : "Audits currently being worked on will appear here."}</p>
                    </div>
                ) : (
                    <>
                        <div className="ip-table-scroll">
                            <table className="ip-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Application</th>
                                        {/* <th scope="col">Auditor</th> */}
                                        <th scope="col">Created on</th>
                                        {/* <th scope="col">Status</th> */}
                                        <th scope="col" style={{ textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((audit) => {
                                        const isExpanded = expanded.has(audit.rowKey);
                                        return (
                                            <Fragment key={audit.rowKey}>
                                                <tr className="ip-row">
                                                    <td>
                                                        <div className="ip-application">
                                                            <span className="ip-app-icon"><FiFileText aria-hidden="true" /></span>
                                                            <div>
                                                                <div className="ip-app-name">{audit.name}</div>
                                                                <div className="ip-app-id">Application ID: {audit.application_id ?? "N/A"}</div>
                                                                <button
                                                                    type="button"
                                                                    className="ip-expand"
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
                                                    <td><span className="ip-date"><FiCalendar aria-hidden="true" />{formatDate(audit.created_at)}</span></td>
                                                    {/* <td><span className="ip-status"><FiClock aria-hidden="true" />In Progress</span></td> */}
                                                    <td style={{ textAlign: "right" }}>
                                                        <button
                                                            type="button"
                                                            className="ip-open"
                                                            disabled={!canOpen(audit)}
                                                            title={canOpen(audit) ? "Continue audit in the Auditor Workspace" : "Workspace unavailable: public audit ID is missing"}
                                                            onClick={() => openWorkspace(audit)}
                                                        >
                                                            Continue Audit <FiExternalLink aria-hidden="true" />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="ip-details-row"><td colSpan={5}><Details audit={audit} /></td></tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="ip-mobile-list">
                            {visible.map((audit) => {
                                const isExpanded = expanded.has(audit.rowKey);
                                return (
                                    <article className="ip-mobile-card" key={audit.rowKey}>
                                        <div className="ip-mobile-card-head">
                                            <div className="ip-application">
                                                <span className="ip-app-icon"><FiFileText aria-hidden="true" /></span>
                                                <div>
                                                    <div className="ip-app-name">{audit.name}</div>
                                                    <div className="ip-app-id">Application ID: {audit.application_id ?? "N/A"}</div>
                                                </div>
                                            </div>
                                            <span className="ip-status"><FiClock aria-hidden="true" />In Progress</span>
                                        </div>
                                        <dl className="ip-mobile-meta">
                                            <div><dt>Auditor</dt><dd>{audit.auditor_name}</dd></div>
                                            <div><dt>Created on</dt><dd>{formatDate(audit.created_at)}</dd></div>
                                        </dl>
                                        <div className="ip-mobile-actions">
                                            <button
                                                type="button"
                                                className="ip-expand"
                                                aria-expanded={isExpanded}
                                                onClick={() => toggleExpanded(audit.rowKey)}
                                            >
                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                {isExpanded ? "Less details" : "Details"}
                                            </button>
                                            <button
                                                type="button"
                                                className="ip-open"
                                                disabled={!canOpen(audit)}
                                                title={canOpen(audit) ? "Continue audit in the Auditor Workspace" : "Workspace unavailable: public audit ID is missing"}
                                                onClick={() => openWorkspace(audit)}
                                            >
                                                Continue Audit <FiExternalLink aria-hidden="true" />
                                            </button>
                                        </div>
                                        {isExpanded && <div className="ip-mobile-details"><Details audit={audit} /></div>}
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="ip-footer">
                    <span>{filtered.length ? `Showing ${start}–${end} of ${filtered.length}` : "0 records"}</span>
                    <div className="ip-pagination">
                        <label htmlFor="ip-page-size">Rows:</label>
                        <select
                            id="ip-page-size"
                            className="ip-select"
                            value={pageSize}
                            onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <button type="button" className="ip-page-button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} aria-label="Previous page">
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <span>Page {currentPage} / {pageCount}</span>
                        <button type="button" className="ip-page-button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage >= pageCount} aria-label="Next page">
                            <FiChevronRight aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
