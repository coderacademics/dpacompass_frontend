import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiAlertCircle, FiArrowLeft, FiCalendar, FiCheckCircle,
    FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp,
    FiDownload, FiExternalLink, FiEye, FiFileText, FiInbox,
    FiLoader, FiRefreshCw, FiSearch, FiShield, FiX,
} from "react-icons/fi";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

// Styling is scoped to Completed Audits; DashboardLayout owns the shell.
const pageStyles = String.raw`
.ca-page {
    --ca-ink: #17324f;
    --ca-muted: #64788d;
    --ca-border: #dfe7f0;
    --ca-blue: #205b90;
    --ca-danger: #b42332;
    width: 100%;
    min-width: 0;
    color: var(--ca-ink);
    font-size: 14px;
}
.ca-page *, .ca-page *::before, .ca-page *::after { box-sizing: border-box; }
.ca-page button, .ca-page input, .ca-page select { font: inherit; }
.ca-page :is(button,input,select):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.ca-page button:disabled { cursor: not-allowed; opacity: .45; }
.ca-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
.ca-crumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--ca-muted); font-size: 13px; }
.ca-crumb strong { color: var(--ca-ink); }
.ca-top-actions { display: flex; gap: 9px; flex-wrap: wrap; }
.ca-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 9px 13px; border: 1px solid #d6e2ed; border-radius: 9px; background: #fff; color: #285676; font-size: 13px; font-weight: 700; cursor: pointer; }
.ca-button:hover:not(:disabled) { background: #eff5fb; }
.ca-button--primary { background: var(--ca-blue); border-color: var(--ca-blue); color: #fff; }
.ca-button--primary:hover:not(:disabled) { background: #17476f; }
.ca-heading { margin-bottom: 22px; }
.ca-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #9b3440; }
.ca-title { margin: 0; font-size: clamp(23px, 2vw, 29px); font-weight: 760; line-height: 1.25; letter-spacing: -.025em; }
.ca-description { margin: 7px 0 0; max-width: 760px; color: var(--ca-muted); line-height: 1.6; }

/* List-first register: same visual rhythm as Accepted and In-Progress Audits. */
.ca-panel { min-width: 0; overflow: hidden; border: 1px solid var(--ca-border); border-radius: 14px; background: #fff; box-shadow: 0 4px 22px rgba(23,50,79,.035); }
.ca-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; padding: 19px 20px; border-bottom: 1px solid var(--ca-border); }
.ca-register-title { margin: 0; color: var(--ca-ink); font-size: 17px; font-weight: 750; }
.ca-register-subtitle { margin: 4px 0 0; color: var(--ca-muted); font-size: 12px; }
.ca-filters { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.ca-search { display: flex; align-items: center; gap: 9px; width: min(100%, 320px); min-height: 40px; padding: 0 12px; border: 1px solid #d5e0eb; border-radius: 9px; color: #68829b; background: #f9fbfe; }
.ca-search:focus-within { border-color: #93b9dd; box-shadow: 0 0 0 3px #e4f0ff; }
.ca-search input { width: 100%; min-width: 0; outline: 0; border: 0; background: transparent; color: var(--ca-ink); }
.ca-select { min-height: 40px; padding: 8px 11px; border: 1px solid #d5e0eb; border-radius: 9px; background: #fff; color: #31526e; cursor: pointer; }
.ca-table-scroll { width: 100%; overflow-x: auto; }
.ca-table { width: 100%; min-width: 1050px; border-collapse: collapse; text-align: left; }
.ca-table thead { background: #f6f9fc; }
.ca-table th { padding: 14px 16px; color: #526c83; font-size: 12px; font-weight: 750; white-space: nowrap; border-bottom: 1px solid var(--ca-border); }
.ca-table td { padding: 16px; color: #38556d; font-size: 14px; vertical-align: middle; border-bottom: 1px solid #edf1f5; }
.ca-table tbody tr.ca-row:hover { background: #f9fbfe; }
.ca-application { display: flex; align-items: flex-start; gap: 11px; min-width: 210px; }
.ca-app-icon { flex: 0 0 35px; display: grid; place-items: center; width: 35px; height: 35px; border-radius: 9px; background: #edf4fb; color: #245c90; }
.ca-app-name { color: #193955; font-weight: 750; font-size: 14px; overflow-wrap: anywhere; }
.ca-app-id { margin-top: 4px; color: #74889b; font-size: 11px; overflow-wrap: anywhere; }
.ca-expand { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; padding: 0; color: var(--ca-blue); background: transparent; border: 0; font-size: 12px; font-weight: 650; cursor: pointer; }
.ca-date { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.ca-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid #f0c6ca; border-radius: 999px; background: #fff1f2; color: var(--ca-danger); font-size: 12px; font-weight: 750; white-space: nowrap; }
.ca-reason { max-width: 240px; color: #5d6777; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow-wrap: anywhere; }
.ca-view { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 13px; min-height: 37px; border-radius: 8px; border: 1px solid #c9dff3; background: #eef5fd; color: var(--ca-blue); font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.ca-view:hover:not(:disabled) { background: #dcecfb; border-color: #a8c8e5; }
.ca-details-row td { padding: 0 16px 15px; background: #f9fbfe; }
.ca-details { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; padding: 16px; border: 1px solid #dce7f1; border-radius: 10px; background: #fff; }
.ca-detail-label { font-size: 11px; font-weight: 750; text-transform: uppercase; letter-spacing: .02em; color: #74889b; }
.ca-detail-value { margin-top: 5px; color: #2d4961; line-height: 1.5; overflow-wrap: anywhere; }
.ca-details-reason { grid-column: 1 / -1; padding: 12px 14px; border-radius: 9px; border: 1px solid #f1d8dc; background: #fff8f8; }
.ca-details-reason .ca-detail-value { white-space: pre-wrap; color: #7f303b; }
.ca-domains { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
.ca-domain { padding: 4px 8px; border-radius: 6px; color: #285b85; background: #eef5fd; font-size: 12px; }
.ca-url { color: var(--ca-blue); text-decoration: underline; text-underline-offset: 3px; }
.ca-empty { display: grid; justify-items: center; gap: 9px; padding: 48px 20px; text-align: center; color: var(--ca-muted); }
.ca-empty-icon { color: #7c9cba; font-size: 32px; }
.ca-empty-title { margin: 0; color: var(--ca-ink); font-size: 17px; font-weight: 750; }
.ca-empty p { max-width: 460px; margin: 0; line-height: 1.6; }
.ca-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid var(--ca-border); color: var(--ca-muted); font-size: 12px; }
.ca-pager { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.ca-pager-button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #dce5ee; border-radius: 7px; color: var(--ca-blue); background: #fff; cursor: pointer; }
.ca-pager-button:hover:not(:disabled) { background: #eff5fb; }

/* Mobile cards replace the wide desktop table. */
.ca-mobile-list { display: none; }
.ca-mobile-card { padding: 16px; border-bottom: 1px solid var(--ca-border); }
.ca-mobile-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ca-mobile-meta { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 15px 0; }
.ca-mobile-meta dt { color: var(--ca-muted); font-size: 11px; font-weight: 750; }
.ca-mobile-meta dd { margin: 5px 0 0; color: var(--ca-ink); font-size: 13px; overflow-wrap: anywhere; }
.ca-mobile-reason { margin: 0 0 15px; padding: 11px 12px; border: 1px solid #f1d8dc; border-radius: 9px; background: #fff8f8; }
.ca-mobile-reason .ca-detail-value { color: #7f303b; white-space: pre-wrap; }
.ca-mobile-actions { display: flex; align-items: center; gap: 12px; justify-content: space-between; }
.ca-mobile-actions .ca-view { flex: 1; }
.ca-mobile-details { margin-top: 12px; }
.ca-mobile-details .ca-details { grid-template-columns: 1fr; }
.ca-spin { animation: ca-spin .9s linear infinite; }
@keyframes ca-spin { to { transform: rotate(360deg); } }

@media (max-width: 1000px) {
    .ca-table-scroll { display: none; }
    .ca-mobile-list { display: block; }
    .ca-filters { width: 100%; }
    .ca-search { flex: 1; width: auto; }
}
@media (max-width: 640px) {
    .ca-toolbar { padding: 16px; }
    .ca-top-actions { width: 100%; }
    .ca-top-actions .ca-button { flex: 1; }
    .ca-filters { flex-direction: column; align-items: stretch; }
    .ca-search, .ca-select { width: 100%; }
    .ca-footer { padding: 13px 16px; }
    .ca-mobile-card-head { flex-direction: column; }
    .ca-mobile-meta { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) { .ca-spin { animation: none; } }

/* Report-specific additions that retain the Declined Audits visual language. */
.ca-page { --ca-success: #16724f; }
.ca-kicker { color: #2e648e; }
.ca-status--published { color: #176b4f; border-color: #b9e1ce; background: #effaf4; }
.ca-status--generated { color: #275e95; border-color: #c6def3; background: #edf5fe; }
.ca-status svg { flex-shrink: 0; }
.ca-count { color: #536f89; font-size: 12px; white-space: nowrap; }
.ca-tags { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; padding: 11px 20px; background: #fbfcfe; border-bottom: 1px solid #e4ebf2; }
.ca-tag { display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; background: #f1f6fb; border: 1px solid #e0e8f0; padding: 5px 10px; font-size: 12px; font-weight: 650; color: #45627b; }
.ca-tag strong { color: #224f78; font-variant-numeric: tabular-nums; }
.ca-status-filter { display: inline-flex; gap: 4px; flex-wrap: wrap; padding: 3px; border: 1px solid #dbe5ee; border-radius: 9px; background: #f6f9fc; }
.ca-status-filter button { border: 0; border-radius: 7px; padding: 7px 11px; background: transparent; color: #5a7186; cursor: pointer; font-size: 12px; font-weight: 700; }
.ca-status-filter button[aria-pressed="true"] { background: #fff; color: #205b90; box-shadow: 0 1px 4px rgba(15,39,68,.1); }
.ca-form-control { min-height: 40px; border: 1px solid #d5e0eb; border-radius: 9px; background: #fff; padding: 8px 11px; color: #31526e; cursor: pointer; }
.ca-date { white-space: normal; line-height: 1.55; }
.ca-date svg { align-self: flex-start; margin-top: 3px; }
.ca-badge-code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; color: #607b93; overflow-wrap: anywhere; }
.ca-detail-note { grid-column: 1 / -1; color: #64788d; padding: 11px 12px; border: 1px solid #e1e9f1; border-radius: 8px; background: #f8fbfe; font-size: 12px; }
.ca-alert { display: flex; align-items: flex-start; gap: 10px; background: #fff7f7; color: #9f2839; border: 1px solid #f3ccd2; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; font-size: 13px; }
.ca-alert svg { flex-shrink: 0; margin-top: 2px; }
.ca-alert button { color: #7f2632; text-decoration: underline; cursor: pointer; font-weight: 700; }
.ca-action-error { display: block; margin-top: 7px; color: #b42332; max-width: 210px; overflow-wrap: anywhere; font-size: 11px; line-height: 1.45; }
.ca-preview-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(15,23,42,.64); }
.ca-preview { width: min(1120px,100%); max-height: min(94dvh,1100px); min-height: 0; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #dae5ef; border-radius: 15px; background: #fff; box-shadow: 0 22px 70px rgba(15,23,42,.28); }
.ca-preview-header { flex-shrink: 0; padding: 18px 22px; border-bottom: 1px solid #e2eaf1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 13px; }
.ca-preview-title { display: flex; gap: 11px; align-items: center; min-width: 0; }
.ca-preview-icon { width: 37px; height: 37px; border-radius: 9px; display: grid; place-items: center; background: #edf4fb; color: #245b90; flex-shrink: 0; }
.ca-preview-title h2 { font-size: 18px; font-weight: 750; margin: 0; color: #17324f; }
.ca-preview-title p { margin: 4px 0 0; color: #64788d; font-size: 12px; overflow-wrap: anywhere; }
.ca-preview-buttons { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }
.ca-preview-close { display: grid; place-items: center; width: 36px; height: 36px; color: #526c83; background: #fff; border: 1px solid #dce5ee; border-radius: 8px; cursor: pointer; }
.ca-preview-meta { flex-shrink: 0; display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; padding: 14px 22px; background: #fbfcff; border-bottom: 1px solid #e4ebf2; }
.ca-preview-meta dt { font-size: 11px; text-transform: uppercase; letter-spacing: .02em; color: #72879b; font-weight: 700; }
.ca-preview-meta dd { margin: 5px 0 0; font-size: 13px; color: #254158; overflow-wrap: anywhere; }
.ca-preview-body { flex: 1; min-height: 180px; background: #edf2f7; padding: 12px; overflow: auto; }
.ca-report-frame { display: block; border: 1px solid #d1dde8; border-radius: 8px; width: 100%; height: min(60dvh,670px); min-height: 240px; background: #fff; }
.ca-preview-footer { flex-shrink: 0; border-top: 1px solid #e3ebf3; padding: 10px 22px; color: #667f95; font-size: 12px; }
@media (max-width: 1000px) {
  .ca-preview-meta { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .ca-filters { gap: 7px; }
}
@media (max-width: 640px) {
  .ca-preview-backdrop { padding: 8px; }
  .ca-preview { max-height: 97dvh; border-radius: 12px; }
  .ca-preview-header { padding: 12px; }
  .ca-preview-buttons { width: 100%; }
  .ca-preview-buttons .ca-button { flex: 1; }
  .ca-preview-meta { padding: 12px; gap: 10px; }
  .ca-preview-body { padding: 8px; }
  .ca-report-frame { height: 50dvh; }
  .ca-status-filter { width: 100%; justify-content: space-between; }
  .ca-status-filter button { flex: 1; }
  .ca-count { white-space: normal; }
}
`;

const COMPLETED_AUDITS_ENDPOINT =
    "/api/audits/report-generated-audits/";

const PUBLISHED_REPORTS_ENDPOINT =
    "/api/checklists/audits/published-reports/";

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}


function isSafeHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function ReportStatus({ published }) {
    return (
        <span className={`ca-status ${published ? "ca-status--published" : "ca-status--generated"}`}>
            <FiCheckCircle aria-hidden="true" />
            {published ? "Published" : "Report Generated"}
        </span>
    );
}

function ReportDetails({ audit }) {
    return (
        <div className="ca-details">
            <div><div className="ca-detail-label">Public Audit ID</div><div className="ca-detail-value ca-badge-code">{audit.public_audit_id}</div></div>
            <div><div className="ca-detail-label">Internal Audit ID</div><div className="ca-detail-value ca-badge-code">{audit.audit_id ?? "Not available"}</div></div>
            <div><div className="ca-detail-label">Application Type</div><div className="ca-detail-value">{audit.application_type || "Not provided"}</div></div>
            <div><div className="ca-detail-label">Application URL</div><div className="ca-detail-value">
                {isSafeHttpUrl(audit.application_url) ? <a className="ca-url" href={audit.application_url} target="_blank" rel="noopener noreferrer">
                    {audit.application_url} <FiExternalLink aria-hidden="true" style={{ display: "inline" }} />
                </a> : (audit.application_url || "Not provided")}
            </div></div>
            <div><div className="ca-detail-label">Auditor</div><div className="ca-detail-value">{audit.auditor_name || "Not provided"}</div></div>
            <div><div className="ca-detail-label">Report status</div><div className="ca-detail-value"><ReportStatus published={audit.published_report} /></div></div>
            <div className="ca-detail-note">Generation time: {formatDateTime(audit.report_generated_at)} · Publication time: {formatDateTime(audit.report_published_at)}</div>
        </div>
    );
}

export default function CompletedAudits({ onBack }) {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(() => new Set());

    const [generatingIds, setGeneratingIds] = useState([]);
    const [generatedReports, setGeneratedReports] = useState({});

    const [errors, setErrors] = useState({});
    const [selectedReport, setSelectedReport] = useState(null);

    // ========================================================
    // FETCH GENERATED + PUBLISHED REPORTS
    //
    // Generated:
    // GET /api/audits/report-generated-audits/
    //
    // Published:
    // GET /api/checklists/audits/published-reports/
    //
    // Merge both endpoints by public_audit_id.
    // ========================================================

    const fetchCompletedAudits = useCallback(async () => {
        setRefreshing(true);

        setErrors((previous) => {
            const next = { ...previous };
            delete next.refresh;
            return next;
        });

        try {
            const [generatedResponse, publishedResponse] =
                await Promise.all([
                    fetchWithAuth(COMPLETED_AUDITS_ENDPOINT, {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    }),
                    fetchWithAuth(PUBLISHED_REPORTS_ENDPOINT, {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    }),
                ]);

            if (!generatedResponse.ok) {
                throw new Error(
                    `Unable to fetch generated reports. HTTP ${generatedResponse.status}`
                );
            }

            if (!publishedResponse.ok) {
                throw new Error(
                    `Unable to fetch published reports. HTTP ${publishedResponse.status}`
                );
            }

            const [generatedData, publishedData] = await Promise.all([
                generatedResponse.json(),
                publishedResponse.json(),
            ]);

            const generatedRows = Array.isArray(generatedData.results)
                ? generatedData.results
                : Array.isArray(generatedData.data)
                    ? generatedData.data
                    : null;

            const publishedRows = Array.isArray(publishedData.data)
                ? publishedData.data
                : Array.isArray(publishedData.results)
                    ? publishedData.results
                    : null;

            if (!generatedRows) {
                throw new Error(
                    "Invalid generated-reports response: expected results or data array."
                );
            }

            if (!publishedRows) {
                throw new Error(
                    "Invalid published-reports response: expected data or results array."
                );
            }

            const reportMap = new Map();

            // Normalize generated reports first.
            generatedRows.forEach((audit) => {
                const publicAuditId = audit.public_audit_id;

                if (!publicAuditId) return;

                const reportStatus = String(
                    audit.report?.status ||
                    audit.report_status ||
                    ""
                ).toUpperCase();

                const auditStatus = String(
                    audit.audit_status || ""
                ).toLowerCase();

                const isPublished =
                    reportStatus === "PUBLISHED" ||
                    auditStatus === "published" ||
                    audit.published === true ||
                    audit.published_report === true ||
                    Boolean(
                        audit.report?.published_at ||
                        audit.report?.published_on ||
                        audit.published_at ||
                        audit.published_on
                    );

                reportMap.set(String(publicAuditId), {
                    ...audit,
                    id: audit.audit_id || publicAuditId,
                    audit_id: audit.audit_id || publicAuditId,
                    public_audit_id: String(publicAuditId),

                    application_name:
                        audit.application?.name ||
                        audit.application_name ||
                        "Unnamed application",

                    application_type:
                        audit.application?.type ||
                        audit.application_type ||
                        "—",

                    application_url:
                        audit.application?.url ||
                        audit.application_url ||
                        "—",

                    report_generated: true,
                    published_report: isPublished,
                    report_exists: true,

                    report_status: isPublished
                        ? "PUBLISHED"
                        : "REPORT_GENERATED",

                    report_generated_at:
                        audit.report?.generated_at ||
                        audit.report_generated_at ||
                        audit.generated_at ||
                        null,

                    report_published_at:
                        audit.report?.published_at ||
                        audit.report?.published_on ||
                        audit.published_at ||
                        audit.published_on ||
                        null,
                });
            });

            // Merge published reports. This endpoint is authoritative
            // for publication status and also contributes published-only rows.
            publishedRows.forEach((published) => {
                const publicAuditId = published.public_audit_id;

                if (!publicAuditId) return;

                const key = String(publicAuditId);
                const existing = reportMap.get(key) || {};

                const normalizedPublished = {
                    ...existing,
                    ...published,

                    id:
                        existing.audit_id ||
                        published.audit_id ||
                        published.application_id ||
                        key,

                    audit_id:
                        existing.audit_id ||
                        published.audit_id ||
                        published.application_id ||
                        key,

                    public_audit_id: key,

                    application_name:
                        published.application_name ||
                        published.application?.name ||
                        existing.application_name ||
                        "Unnamed application",

                    application_type:
                        published.application_type ||
                        published.application?.type ||
                        existing.application_type ||
                        "—",

                    application_url:
                        published.application_url ||
                        published.application?.url ||
                        existing.application_url ||
                        "—",

                    report_generated: true,
                    published_report: true,
                    report_exists: true,
                    report_status: "PUBLISHED",

                    report_generated_at:
                        published.generated_at ||
                        published.report_generated_at ||
                        existing.report_generated_at ||
                        null,

                    report_published_at:
                        published.published_at ||
                        published.published_on ||
                        published.report_published_at ||
                        existing.report_published_at ||
                        null,

                    auditor_name:
                        published.auditor_name ||
                        existing.auditor_name ||
                        published.auditor?.name ||
                        "—",
                };

                reportMap.set(key, normalizedPublished);
            });

            const mergedAudits = Array.from(reportMap.values()).sort(
                (a, b) => {
                    const dateA = new Date(
                        a.report_published_at ||
                        a.report_generated_at ||
                        0
                    ).getTime();

                    const dateB = new Date(
                        b.report_published_at ||
                        b.report_generated_at ||
                        0
                    ).getTime();

                    return dateB - dateA;
                }
            );

            setAudits(mergedAudits);

        } catch (error) {
            setErrors((previous) => ({
                ...previous,
                refresh:
                    error.message ||
                    "Unable to load generated and published reports.",
            }));

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCompletedAudits();
    }, [fetchCompletedAudits]);

    const handleRefresh = () => {
        fetchCompletedAudits();
    };

    // ========================================================
    // STATISTICS AND FILTERING
    // ========================================================

    const eligibleAudits = useMemo(
        () => audits,
        [audits]
    );

    const generatedCount = eligibleAudits.length;

    const publishedCount = eligibleAudits.filter(
        (audit) => audit.published_report
    ).length;

    const filteredAudits = useMemo(() => {
        const query = search.trim().toLowerCase();

        return eligibleAudits.filter((audit) => {
            const matchesSearch =
                !query ||
                [
                    audit.application_name,
                    audit.application_type,
                    audit.application_url,
                    audit.public_audit_id,
                    audit.audit_status,
                    String(audit.audit_id),
                ].some((value) =>
                    String(value || "")
                        .toLowerCase()
                        .includes(query)
                );

            const matchesFilter =
                filter === "all" ||
                (filter === "generated" &&
                    !audit.published_report) ||
                (filter === "published" &&
                    audit.published_report);

            return matchesSearch && matchesFilter;
        });
    }, [eligibleAudits, search, filter]);

    // ========================================================
    // FETCH SAVED HTML REPORT
    //
    // GET /api/checklists/html_report/{public_audit_id}/
    // ========================================================

    const fetchReportHTML = async (audit) => {
        const auditId = audit.audit_id || audit.public_audit_id;
        const publicAuditId = audit.public_audit_id;

        if (!publicAuditId) {
            throw new Error(
                "The public audit ID is missing; the report cannot be fetched."
            );
        }

        const endpoint =
            `/api/checklists/html_report/${encodeURIComponent(
                String(publicAuditId)
            )}/`;

        const response = await fetchWithAuth(endpoint, {
            method: "GET",
            headers: {
                Accept: "text/html, application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Report request failed. HTTP ${response.status}`
            );
        }

        const responseText = await response.text();

        const contentType =
            response.headers.get("content-type") || "";

        let html = responseText;

        if (contentType.includes("application/json")) {
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "The report API returned invalid JSON."
                );
            }

            html =
                data.html ||
                data.report_html ||
                data.content ||
                "";

            if (data.success === false) {
                throw new Error(
                    data.message ||
                    "The backend could not retrieve the report."
                );
            }
        }

        if (typeof html !== "string" || !html.trim()) {
            throw new Error(
                "The server returned an empty HTML report."
            );
        }

        if (
            !contentType.includes("application/json") &&
            !/<(?:!doctype\s+html|html|body|head)\b/i.test(html)
        ) {
            throw new Error(
                "The API response does not appear to contain an HTML document."
            );
        }

        const report = {
            audit_id: auditId,
            public_audit_id: publicAuditId,
            application: audit.application_name,
            application_name: audit.application_name,
            html,
            generated_at: audit.report_generated_at,
        };

        setGeneratedReports((previous) => ({
            ...previous,
            [auditId]: report,
        }));

        return report;
    };

    // ========================================================
    // LOAD REPORT FOR VIEW / DOWNLOAD
    // ========================================================

    const loadReportForAction = async (audit, action) => {
        const auditId = audit.audit_id || audit.public_audit_id;

        setErrors((previous) => {
            const next = { ...previous };
            delete next[auditId];
            return next;
        });

        setGeneratingIds((previous) =>
            previous.includes(auditId)
                ? previous
                : [...previous, auditId]
        );

        try {
            const report =
                generatedReports[auditId] ||
                await fetchReportHTML(audit);

            if (action === "view") {
                setSelectedReport({
                    ...audit,
                    report_html: report.html,
                });
            } else if (action === "html") {
                downloadHTMLFile(audit, report);
            } else if (action === "pdf") {
                printPDFFile(audit, report);
            }

        } catch (error) {
            setErrors((previous) => ({
                ...previous,
                [auditId]:
                    error.message ||
                    "Unable to load the saved report.",
            }));

        } finally {
            setGeneratingIds((previous) =>
                previous.filter((id) => id !== auditId)
            );
        }
    };

    // ========================================================
    // DOWNLOAD HTML
    // ========================================================

    const downloadHTMLFile = (audit, report) => {
        if (!report?.html) return;

        const blob = new Blob(
            [report.html],
            { type: "text/html;charset=utf-8" }
        );

        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = objectUrl;

        link.download =
            `${audit.public_audit_id || audit.audit_id}_report.html`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.setTimeout(
            () => URL.revokeObjectURL(objectUrl),
            1000
        );
    };

    // ========================================================
    // PRINT / SAVE AS PDF
    // ========================================================

    const printPDFFile = (audit, report) => {
        if (!report?.html) return;

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            setErrors((previous) => ({
                ...previous,
                [audit.audit_id]:
                    "The report window was blocked. Allow pop-ups and try again.",
            }));

            return;
        }

        printWindow.document.open();
        printWindow.document.write(report.html);
        printWindow.document.close();

        printWindow.document.title =
            `${audit.public_audit_id || audit.audit_id}_report`;

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    const handleDownloadHTML = (audit) =>
        loadReportForAction(audit, "html");

    const handleDownloadPDF = (audit) =>
        loadReportForAction(audit, "pdf");

    const openReport = (audit) =>
        loadReportForAction(audit, "view");


    const sortedAudits = useMemo(() => {
        const dateValue = (audit) => {
            const ms = new Date(audit.report_published_at || audit.report_generated_at || 0).getTime();
            return Number.isFinite(ms) ? ms : 0;
        };
        return [...filteredAudits].sort((a, b) => {
            if (sort === "name") return String(a.application_name).localeCompare(String(b.application_name));
            return sort === "oldest" ? dateValue(a) - dateValue(b) : dateValue(b) - dateValue(a);
        });
    }, [filteredAudits, sort]);

    const pageCount = Math.max(1, Math.ceil(sortedAudits.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visible = sortedAudits.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const startItem = sortedAudits.length ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, sortedAudits.length);

    const toggleExpanded = (key) => setExpanded((old) => {
        const next = new Set(old);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });

    useEffect(() => {
        if (!selectedReport) return undefined;
        const onKeyDown = (event) => {
            if (event.key === "Escape") setSelectedReport(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedReport]);

    useEffect(() => {
        if (!selectedReport) return undefined;
        const oldOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = oldOverflow; };
    }, [selectedReport]);


    return (
        <div className="ca-page">
            <style>{pageStyles}</style>
            <div className="ca-top">
                <nav className="ca-crumb" aria-label="Breadcrumb">
                    <FiShield aria-hidden="true" />
                    <span>Auditor Workspace</span>
                    <FiChevronRight aria-hidden="true" />
                    <strong aria-current="page">Completed Audits</strong>
                </nav>
                <div className="ca-top-actions">
                    <button type="button" className="ca-button" onClick={onBack || (() => navigate("/auditdashboard"))}>
                        <FiArrowLeft aria-hidden="true" /> Dashboard
                    </button>
                    <button type="button" className="ca-button ca-button--primary" onClick={handleRefresh} disabled={refreshing || loading}>
                        <FiRefreshCw className={refreshing ? "ca-spin" : ""} aria-hidden="true" />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            <header className="ca-heading">
                <p className="ca-kicker"><FiCheckCircle aria-hidden="true" /> AUDIT MANAGEMENT</p>
                <h1 className="ca-title">Completed Audits</h1>
                <p className="ca-description">
                    Review completed audit reports, inspect their details, and view or download the generated report.
                </p>
            </header>

            <section className="ca-panel" aria-labelledby="ca-register-title">
                <div className="ca-toolbar">
                    <div>
                        <h2 className="ca-register-title" id="ca-register-title">Completed Audit Register</h2>
                        <p className="ca-register-subtitle">
                            {loading ? "Loading records..." : `${generatedCount} total reports · ${publishedCount} published`}
                        </p>
                    </div>
                    <div className="ca-filters">
                        <label className="ca-search">
                            <FiSearch aria-hidden="true" />
                            <input type="search" aria-label="Search completed audits" value={search}
                                placeholder="Search application, audit ID..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                        </label>
                        <select className="ca-select" aria-label="Sort completed audits" value={sort}
                            onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                            <option value="newest">Newest records</option>
                            <option value="oldest">Oldest records</option>
                            <option value="name">Application A–Z</option>
                        </select>
                    </div>
                </div>
                <div className="ca-tags">
                    <div className="ca-status-filter" role="group" aria-label="Filter reports by status">
                        {[
                            ["all", "All"],
                            ["generated", "Generated"],
                            ["published", "Published"],
                        ].map(([value, label]) => (
                            <button key={value} type="button" aria-pressed={filter === value}
                                onClick={() => { setFilter(value); setPage(1); }}>{label}</button>
                        ))}
                    </div>
                    <span className="ca-tag">Total <strong>{loading ? "—" : generatedCount}</strong></span>
                    <span className="ca-tag">Published <strong>{loading ? "—" : publishedCount}</strong></span>
                </div>

                {errors.refresh && (
                    <div className="ca-alert" role="alert">
                        <FiAlertCircle aria-hidden="true" />
                        <div><strong>Unable to refresh reports.</strong> {errors.refresh}{" "}
                            <button type="button" onClick={handleRefresh}>Try again</button></div>
                    </div>
                )}
                {loading ? (
                    <div className="ca-empty" role="status">
                        <FiLoader className="ca-empty-icon ca-spin" aria-hidden="true" />
                        <p className="ca-empty-title">Loading completed audits</p>
                        <p>Retrieving generated and published audit reports.</p>
                    </div>
                ) : sortedAudits.length === 0 ? (
                    <div className="ca-empty">
                        <FiInbox className="ca-empty-icon" aria-hidden="true" />
                        <p className="ca-empty-title">{search || filter !== "all" ? "No matching reports" : "No completed audits"}</p>
                        <p>{search || filter !== "all" ? "Try a different search or filter." : "Generated audit reports will appear here when available."}</p>
                    </div>
                ) : (
                    <>
                        <div className="ca-table-scroll">
                            <table className="ca-table">
                                <thead><tr>
                                    <th scope="col">Application</th>
                                    <th scope="col">Auditor</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Generated on</th>
                                    <th scope="col">Published on</th>
                                    <th scope="col" style={{ textAlign: "right" }}>Action</th>
                                </tr></thead>
                                <tbody>
                                    {visible.map((audit) => {
                                        const key = audit.public_audit_id;
                                        const busy = generatingIds.includes(audit.audit_id || key);
                                        const isExpanded = expanded.has(key);
                                        return <Fragment key={key}>
                                            <tr className="ca-row">
                                                <td>
                                                    <div className="ca-application">
                                                        <span className="ca-app-icon"><FiFileText aria-hidden="true" /></span>
                                                        <div>
                                                            <div className="ca-app-name">{audit.application_name}</div>
                                                            <div className="ca-app-id">Audit ID: {audit.public_audit_id}</div>
                                                            <button type="button" className="ca-expand" aria-expanded={isExpanded}
                                                                onClick={() => toggleExpanded(key)}>
                                                                {isExpanded ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                                                {isExpanded ? "Hide details" : "More details"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{audit.auditor_name || "Not provided"}</td>
                                                <td><ReportStatus published={audit.published_report} /></td>
                                                <td><span className="ca-date"><FiCalendar aria-hidden="true" />{formatDateTime(audit.report_generated_at)}</span></td>
                                                <td><span className="ca-date"><FiCalendar aria-hidden="true" />{audit.published_report ? formatDateTime(audit.report_published_at) : "—"}</span></td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button type="button" className="ca-view" disabled={busy} onClick={() => openReport(audit)}>
                                                        {busy ? <FiLoader className="ca-spin" /> : <FiEye aria-hidden="true" />}
                                                        {busy ? "Loading..." : "View Details"}
                                                    </button>
                                                    {errors[audit.audit_id || key] && <span className="ca-action-error" role="alert">{errors[audit.audit_id || key]}</span>}
                                                </td>
                                            </tr>
                                            {isExpanded && <tr className="ca-details-row"><td colSpan={6}><ReportDetails audit={audit} /></td></tr>}
                                        </Fragment>;
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="ca-mobile-list">
                            {visible.map((audit) => {
                                const key = audit.public_audit_id;
                                const isExpanded = expanded.has(key);
                                const busy = generatingIds.includes(audit.audit_id || key);
                                return <article className="ca-mobile-card" key={key}>
                                    <div className="ca-mobile-card-head">
                                        <div>
                                            <div className="ca-app-name">{audit.application_name}</div>
                                            <div className="ca-app-id">Audit ID: {key}</div>
                                        </div>
                                        <ReportStatus published={audit.published_report} />
                                    </div>
                                    <dl className="ca-mobile-meta">
                                        <div><dt>Auditor</dt><dd>{audit.auditor_name || "Not provided"}</dd></div>
                                        <div><dt>Generated on</dt><dd>{formatDateTime(audit.report_generated_at)}</dd></div>
                                        {audit.published_report && <div><dt>Published on</dt><dd>{formatDateTime(audit.report_published_at)}</dd></div>}
                                    </dl>
                                    <div className="ca-mobile-actions">
                                        <button type="button" className="ca-expand" aria-expanded={isExpanded} onClick={() => toggleExpanded(key)}>
                                            {isExpanded ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                                            {isExpanded ? "Hide details" : "More details"}
                                        </button>
                                        <button type="button" className="ca-view" disabled={busy} onClick={() => openReport(audit)}>
                                            {busy ? <FiLoader className="ca-spin" /> : <FiEye aria-hidden="true" />}
                                            {busy ? "Loading..." : "View Details"}
                                        </button>
                                    </div>
                                    {errors[audit.audit_id || key] && <span className="ca-action-error" role="alert">{errors[audit.audit_id || key]}</span>}
                                    {isExpanded && <div className="ca-mobile-details"><ReportDetails audit={audit} /></div>}
                                </article>;
                            })}
                        </div>
                    </>
                )}

                <div className="ca-footer">
                    <span>{sortedAudits.length ? `Showing ${startItem}–${endItem} of ${sortedAudits.length}` : "0 records"}
                        {(search || filter !== "all") ? ` · ${audits.length} total` : ""}</span>
                    <div className="ca-pager">
                        <label htmlFor="ca-page-size">Rows per page</label>
                        <select id="ca-page-size" className="ca-select" value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                        </select>
                        <button type="button" className="ca-pager-button" aria-label="Previous page"
                            disabled={currentPage <= 1} onClick={() => setPage(Math.max(1, currentPage - 1))}>
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <span>Page {currentPage} / {pageCount}</span>
                        <button type="button" className="ca-pager-button" aria-label="Next page"
                            disabled={currentPage >= pageCount} onClick={() => setPage(Math.min(pageCount, currentPage + 1))}>
                            <FiChevronRight aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </section>

            {selectedReport && (
                <div className="ca-preview-backdrop" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setSelectedReport(null);
                }}>
                    <section className="ca-preview" role="dialog" aria-modal="true" aria-labelledby="ca-preview-title">
                        <header className="ca-preview-header">
                            <div className="ca-preview-title">
                                <span className="ca-preview-icon"><FiFileText aria-hidden="true" /></span>
                                <div>
                                    <h2 id="ca-preview-title">Audit Report Details</h2>
                                    <p>{selectedReport.application_name} · {selectedReport.public_audit_id}</p>
                                </div>
                            </div>
                            <div className="ca-preview-buttons">
                                <button type="button" className="ca-button" onClick={() => handleDownloadHTML(selectedReport)}>
                                    <FiDownload aria-hidden="true" /> HTML
                                </button>
                                <button type="button" className="ca-button ca-button--primary" onClick={() => handleDownloadPDF(selectedReport)}>
                                    <FiDownload aria-hidden="true" /> Print / Save PDF
                                </button>
                                <button type="button" className="ca-preview-close" onClick={() => setSelectedReport(null)} aria-label="Close report preview">
                                    <FiX aria-hidden="true" />
                                </button>
                            </div>
                        </header>
                        <dl className="ca-preview-meta">
                            <div><dt>Auditor</dt><dd>{selectedReport.auditor_name || "Not provided"}</dd></div>
                            <div><dt>Report status</dt><dd><ReportStatus published={selectedReport.published_report} /></dd></div>
                            <div><dt>Generated on</dt><dd>{formatDateTime(selectedReport.report_generated_at)}</dd></div>
                            <div><dt>Published on</dt><dd>{selectedReport.published_report ? formatDateTime(selectedReport.report_published_at) : "—"}</dd></div>
                        </dl>
                        <div className="ca-preview-body">
                            <iframe className="ca-report-frame" title={`Audit Report - ${selectedReport.public_audit_id}`}
                                srcDoc={selectedReport.report_html} sandbox="" />
                        </div>
                        <div className="ca-preview-footer">Report preview loaded from the audit report API. PDF opens your browser's Print / Save as PDF dialog.</div>
                    </section>
                </div>
            )}
        </div>
    );
}
