import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, ClipboardList, Cookie, ExternalLink, FileCheck2, FileSearch,
  Fingerprint, Globe, Info, LoaderCircle, RefreshCw, Search, ShieldCheck,
  SlidersHorizontal, X
} from "lucide-react";

import {
  getConsentAuditSummary,
  getConsentStepResult,
  getConsentStepFindings,
} from "./selfCheckConsentApi";

const VISIBLE_STEPS = [
  { id: "STEP-01", number: 1, apiNumber: 1, title: "Identify Personal Data Collection Points", description: "Review forms, fields and pages where personal data may be collected.", accent: "blue", icon: Fingerprint },
  { id: "STEP-02", number: 2, apiNumber: 2, title: "Verify Notice Before or at Personal-Data Collection", description: "Check whether privacy notice evidence is available at collection points.", accent: "violet", icon: FileSearch },
  { id: "STEP-04", number: 3, apiNumber: 4, title: "Verify Collection Form and Notice Evidence", description: "Inspect captured form and privacy-notice evidence.", accent: "cyan", icon: FileCheck2 },
  { id: "STEP-05", number: 4, apiNumber: 5, title: "Identify Consent-Dependent Processing", description: "Review processing activities and the scanner's consent-dependency observations.", accent: "amber", icon: ClipboardList },
  { id: "STEP-11", number: 5, apiNumber: 11, title: "Manage Preferences", description: "Check whether a preference-management interface was detected.", accent: "emerald", icon: SlidersHorizontal },
  { id: "STEP-13", number: 6, apiNumber: 13, title: "Collect Cookies and Browser Storage Before Consent", description: "Review cookies and browser-storage records identified by the crawler.", accent: "rose", icon: Cookie },
];

const cx = (...v) => v.filter(Boolean).join(" ");
const norm = (v) => String(v ?? "").trim().toUpperCase().replaceAll("-", "_");
const firstArray = (...values) => values.find(Array.isArray) || [];
const asNumber = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const unwrap = (v) => v?.data ?? v ?? {};

// Resolve evidence URLs returned with localhost/127.0.0.1 hosts to the
// Consent Scanner host configured for this frontend deployment.
const CONSENT_MEDIA_BASE_URL = (
  import.meta.env.VITE_CONSENT_API_BASE_URL || "http://10.240.33.44:8000"
).replace(/\/$/, "");

const resolveConsentMediaUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  try {
    const base = new URL(CONSENT_MEDIA_BASE_URL);
    const url = new URL(value, base);
    if (["localhost", "127.0.0.1"].includes(url.hostname)) {
      url.protocol = base.protocol;
      url.host = base.host;
    }
    return url.toString();
  } catch {
    return value;
  }
};
const stepPayload = (response) => {
  const root = unwrap(response);
  return root?.result && typeof root.result === "object" ? root.result : root;
};
const getStepStatus = (summary, meta) => {
  const steps = summary?.steps ?? summary?.data?.steps ?? {};
  const value = Array.isArray(steps)
    ? steps.find(s => norm(s.step_id ?? s.id) === meta.id)
    : steps?.[`step${meta.apiNumber}`] ?? steps?.[meta.id.toLowerCase().replace("-", "")] ??
      Object.values(steps).find(s => norm(s?.step_id ?? s?.id) === meta.id);
  return norm(value?.status ?? value?.execution_status ?? "NOT_AVAILABLE");
};
const statusTone = (s) => {
  if (["COMPLETED", "SUCCESS"].includes(norm(s))) return "green";
  if (["FAILED", "ERROR", "CANCELLED"].includes(norm(s))) return "red";
  if (["RUNNING"].includes(norm(s))) return "blue";
  if (["QUEUED", "PENDING"].includes(norm(s))) return "amber";
  return "slate";
};
const statusLabel = (s) => norm(s).replaceAll("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());

function Pill({ children, tone = "slate" }) {
  const styles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", styles[tone])}>{children}</span>;
}

function Metric({ label, value, helper, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700", cyan: "bg-cyan-50 text-cyan-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value ?? "—"}</p>{helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}</div>
        <span className={cx("rounded-xl p-2.5", tones[tone])}><Icon size={19}/></span>
      </div>
    </div>
  );
}

function Notice({ tone = "info", children }) {
  const styles = tone === "warning"
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : "border-blue-200 bg-blue-50 text-blue-900";
  return <div className={cx("flex gap-2.5 rounded-xl border p-3.5 text-sm leading-6", styles)}><Info size={17} className="mt-1 shrink-0"/><div>{children}</div></div>;
}

function EmptyState({ title, description }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><FileSearch size={22}/></div><h3 className="mt-4 font-semibold text-slate-800">{title}</h3><p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">{description}</p></div>;
}

function LoadingState({ label = "Loading step details…" }) {
  return <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500"><LoaderCircle className="animate-spin text-blue-600" size={20}/>{label}</div>;
}

function StepNavigationCard({ meta, status, selected, onClick, payload }) {
  const Icon = meta.icon;
  const summary = payload?.summary ?? {};
  const preview = meta.id === "STEP-01"
    ? `${asNumber(summary.personal_data_collection_points)} collection points identified`
    : meta.id === "STEP-05"
      ? `${asNumber(summary.total_processing_activities)} processing activities assessed`
      : meta.id === "STEP-13"
        ? `${asNumber(summary.total)} storage records identified`
        : meta.id === "STEP-11"
          ? (payload?.result?.interface_found ? "Preference interface detected" : "Preference interface not detected")
          : meta.id === "STEP-04"
            ? `${firstArray(payload?.step_04?.forms, payload?.forms).length} forms inspected`
            : `${asNumber(summary.total_pii)} collection records assessed`;
  return (
    <button onClick={onClick} className={cx("group w-full rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg", selected ? "border-blue-300 bg-blue-50/60 shadow-md ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-200")}>
      <div className="flex items-start gap-3">
        <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700")}><Icon size={20}/></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assessment {String(meta.number).padStart(2,"0")}</span><Pill tone={statusTone(status)}>{statusLabel(status)}</Pill></div>
          <h3 className="mt-1 text-sm font-bold leading-5 text-slate-800">{meta.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{preview}</p>
        </div>
        <ChevronRight size={18} className={cx("mt-2 shrink-0 transition group-hover:translate-x-1", selected ? "text-blue-700" : "text-slate-400")}/>
      </div>
    </button>
  );
}

function SearchBar({ value, onChange, placeholder = "Search records…" }) {
  return <div className="relative min-w-55 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"/></div>;
}

function DataTable({ columns, rows, empty = "No records match the current filters.", renderRow }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-170 table-auto text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr>{columns.map(c => <th key={c} className="px-4 py-3 font-bold">{c}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.length ? rows.map(renderRow) : <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-slate-400">{empty}</td></tr>}</tbody></table></div></div>;
}

function Step01View({ result, publicAuditId }) {
  const payload = stepPayload(result);
  const summary = payload.summary ?? {};
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);
  const [pageError, setPageError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const loadPage = useCallback(async (nextPage) => {
    setLoadingPage(true); setPageError("");
    try {
      const data = await getConsentStepFindings(publicAuditId, { page: nextPage, pageSize: 20 });
      setPageData(data); setPage(data.page ?? nextPage);
    } catch (e) { setPageError(e.message || "Unable to load findings."); }
    finally { setLoadingPage(false); }
  }, [publicAuditId]);

  useEffect(() => { loadPage(1); }, [loadPage]);
  const rows = firstArray(pageData?.results).filter(row => {
    const text = `${row.category ?? ""} ${row.field?.label ?? ""} ${row.field?.name ?? ""} ${row.page?.url ?? ""} ${row.form?.form_name ?? ""}`.toLowerCase();
    const classification = norm(row.classification_status);
    return text.includes(query.toLowerCase()) && (filter === "ALL" || classification === filter);
  });
  const total = asNumber(summary.personal_data_collection_points ?? pageData?.count);
  return (
    <div className="space-y-5">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <Metric label="Collection points" value={summary.personal_data_collection_points} icon={Fingerprint}/>
        <Metric label="Confirmed" value={summary.confirmed_personal_data_collection_points} icon={BadgeCheck} tone="green"/>
        <Metric label="Review required" value={summary.review_required_collection_points} icon={CircleAlert} tone="amber"/>
        <Metric label="Forms containing personal data" value={summary.forms_with_personal_data_collection} icon={ClipboardList} tone="violet"/>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold text-slate-800">Collection findings</h3><p className="mt-1 text-xs text-slate-500">Findings are loaded from the server in pages of 20.</p></div><Pill tone="blue">{total} total records</Pill></div>
        <div className="mt-4 flex flex-wrap gap-3"><SearchBar value={query} onChange={setQuery} placeholder="Search field, category, form or page…"/><select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="ALL">All classifications</option><option value="CONFIRMED">Confirmed</option><option value="REVIEW_REQUIRED">Review required</option></select></div>
      </div>
      {pageError && <Notice tone="warning">{pageError} <button onClick={() => loadPage(page)} className="ml-1 font-bold underline">Retry</button></Notice>}
      {loadingPage ? <LoadingState label="Loading collection findings…"/> : (
        <DataTable columns={["Field / label","Category","Page / form","Confidence","Classification",""]} rows={rows} renderRow={row => (
          <tr key={row.finding_id} className="transition hover:bg-blue-50/40">
            <td className="px-4 py-4"><p className="font-semibold text-slate-800">{row.field?.name ?? row.field?.label ?? "Unnamed field"}</p><p className="mt-1 text-xs text-slate-500">{row.field?.label ?? "Label unavailable"}</p></td>
            <td className="px-4 py-4 text-slate-600">{row.category ?? "—"}</td>
            <td className="max-w-65 px-4 py-4"><p className="truncate font-medium text-slate-700">{row.page?.title ?? row.page?.url ?? "Page unavailable"}</p><p className="mt-1 truncate text-xs text-slate-400">{row.form?.form_name ?? "Form unavailable"}</p></td>
            <td className="px-4 py-4 text-slate-600">{row.confidence == null ? "—" : `${Math.round(Number(row.confidence) * (Number(row.confidence) <= 1 ? 100 : 1))}%`}</td>
            <td className="px-4 py-4"><Pill tone={norm(row.classification_status) === "CONFIRMED" ? "green" : "amber"}>{statusLabel(row.classification_status)}</Pill></td>
            <td className="px-4 py-4 text-right"><button onClick={() => setSelected(row)} className="font-semibold text-blue-700 hover:text-blue-900">Inspect</button></td>
          </tr>
        )}/>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs text-slate-500">Page {pageData?.page ?? page} of {pageData?.total_pages ?? "—"} · {pageData?.count ?? total} findings</p>
        <div className="flex gap-2"><button disabled={!pageData?.previous_page || loadingPage} onClick={() => loadPage(pageData.previous_page)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Previous</button><button disabled={!pageData?.next_page || loadingPage} onClick={() => loadPage(pageData.next_page)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Next</button></div>
      </div>
      {selected && <RecordModal title="Collection finding" onClose={() => setSelected(null)} data={selected}/>}
      <Notice>Classification is a crawler observation. The auditor should validate the field, its context and the supporting evidence before making a compliance decision.</Notice>
    </div>
  );
}

function Step02View({ result }) {
  const payload = stepPayload(result);
  const summary = payload.summary ?? {};
  const records = firstArray(payload.notice_results, payload.notice_checks, payload.results, payload.findings);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const rows = records.filter(r => `${r.category ?? ""} ${r.page?.url ?? r.page_url ?? ""} ${r.form?.form_name ?? r.form ?? ""} ${r.position ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Personal-data records" value={summary.total_pii ?? records.length} icon={Fingerprint}/><Metric label="Notice detected" value={summary.notice_found} icon={ShieldCheck} tone="green"/><Metric label="Notice not detected" value={summary.notice_not_found} icon={CircleAlert} tone="amber"/></div>
    <Notice tone="warning">“Notice not detected” is a crawler observation for auditor verification, not a final legal conclusion. A record with an UNKNOWN notice position may still have notice_found set to true; inspect the record details.</Notice>
    <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-800">Notice verification records</h3><p className="mt-1 text-xs text-slate-500">Detailed notice results returned by STEP-02.</p></div><Pill tone="blue">{records.length} records loaded</Pill></div><div className="mt-4"><SearchBar value={query} onChange={setQuery} placeholder="Search category, form, page or position…"/></div></div>
    <DataTable columns={["Category","Page / form","Notice position","Detection",""]} rows={rows} renderRow={(r,i) => {
      const found = r.notice_found === true || r.found === true;
      return <tr key={r.id ?? r.finding_id ?? i} className="hover:bg-blue-50/40"><td className="px-4 py-4 font-medium text-slate-700">{r.category ?? r.data_category ?? "—"}</td><td className="max-w-75 px-4 py-4"><p className="truncate font-medium text-slate-700">{r.page?.title ?? r.page_url ?? r.page?.url ?? "—"}</p><p className="mt-1 truncate text-xs text-slate-400">{r.form?.form_name ?? r.form ?? "Form unavailable"}</p></td><td className="px-4 py-4 text-slate-600">{statusLabel(r.position ?? r.notice_position ?? "UNKNOWN")}</td><td className="px-4 py-4"><Pill tone={found ? "green" : "amber"}>{found ? "Detected" : "Not detected"}</Pill></td><td className="px-4 py-4 text-right"><button onClick={() => setSelected(r)} className="font-semibold text-blue-700">Inspect</button></td></tr>;
    }}/>
    {selected && <RecordModal title="Notice verification detail" data={selected} onClose={() => setSelected(null)}/>}
  </div>;
}

function Step04View({ result }) {
  const payload = stepPayload(result);
  const forms = firstArray(payload?.step_04?.forms, payload?.forms, payload?.form_results);
  const [expanded, setExpanded] = useState({});
  const evidenceCount = forms.reduce((n, f) => n + firstArray(f?.evidence?.items).length, 0);
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Forms inspected" value={forms.length} icon={ClipboardList}/><Metric label="Evidence items" value={evidenceCount} icon={FileCheck2} tone="cyan"/><Metric label="Forms with errors" value={forms.filter(f => firstArray(f.errors).length).length} icon={CircleAlert} tone="amber"/></div>
    {!forms.length ? <EmptyState title="No form evidence returned" description="The STEP-04 response did not include any form records for this audit."/> : forms.map((item,i) => {
      const form = item.form ?? {};
      const evidence = firstArray(item.evidence?.items);
      const open = !!expanded[i];
      return <section key={form.id ?? item.form_index ?? i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
        <button onClick={() => setExpanded(p => ({...p,[i]:!p[i]}))} className="flex w-full items-center justify-between gap-3 p-5 text-left"><div className="flex min-w-0 items-start gap-3"><span className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700"><ClipboardList size={19}/></span><div className="min-w-0"><h3 className="font-bold text-slate-800">{form.name || `Form ${i+1}`}</h3><p className="mt-1 truncate text-xs text-slate-500">{item.page_url || form.action || "Page URL unavailable"}</p><div className="mt-2 flex flex-wrap gap-2"><Pill tone="blue">{String(form.method || "Method unavailable").toUpperCase()}</Pill><Pill tone={item.status === "COMPLETED" ? "green" : "amber"}>{statusLabel(item.status || "Evidence available")}</Pill><Pill>{evidence.length} evidence items</Pill></div></div></div><ChevronDown size={18} className={cx("shrink-0 text-slate-400 transition",open && "rotate-180")}/></button>
        {open && <div className="animate-[fadeIn_.25s_ease-out] border-t border-slate-100 bg-slate-50/70 p-5">
          {firstArray(item.errors).length > 0 && <Notice tone="warning">{item.errors.join(" · ")}</Notice>}
          <div className="mt-3 grid gap-3 md:grid-cols-2"><InfoTile label="Form action" value={form.action}/><InfoTile label="Collection points" value={item.collection_points_count}/><InfoTile label="Page URL" value={item.page_url}/><InfoTile label="Form key" value={item.step_02_reference?.form_key}/></div>
          <h4 className="mb-3 mt-5 text-sm font-bold text-slate-800">Captured evidence</h4>
          <div className="grid gap-3 md:grid-cols-2">{evidence.map((ev,j) => <div key={ev.evidence_id ?? j} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-slate-800">{ev.file_name || ev.evidence_type || `Evidence ${j+1}`}</p><p className="mt-1 text-xs text-slate-500">{statusLabel(ev.evidence_type)} · {statusLabel(ev.capture_status)}</p></div><Pill tone={ev.capture_status === "CAPTURED" ? "green" : "amber"}>{statusLabel(ev.capture_status || "Unknown")}</Pill></div><p className="mt-3 break-all text-xs leading-5 text-slate-500">{ev.source_url || "Source page unavailable"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ev.download_url && <a href={resolveConsentMediaUrl(ev.download_url)} target="_blank" rel="noreferrer" download className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"><ExternalLink size={14}/> Download evidence</a>}
            {ev.screenshot_url && <a href={resolveConsentMediaUrl(ev.screenshot_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"><FileSearch size={14}/> View screenshot</a>}
          </div>
          {ev.reference_only && <p className="mt-2 text-xs text-amber-700">Reference-only evidence</p>}</div>)}</div>
          {!evidence.length && <p className="text-sm text-slate-500">No evidence items were attached to this form.</p>}
        </div>}
      </section>;
    })}
    <Notice>Use the evidence download and screenshot links returned by the scanner API. In deployment, ensure the API returns media URLs reachable by the user's browser and that the media endpoint enforces the intended access controls.</Notice>
  </div>;
}

function Step05View({ result }) {
  const payload = stepPayload(result);
  const summary = payload.summary ?? {};
  const activities = firstArray(payload.processing_activities);
  const [expanded, setExpanded] = useState({});
  return <div className="space-y-5">
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-4"><Metric label="Processing activities" value={summary.total_processing_activities ?? activities.length} icon={ClipboardList}/><Metric label="Consent-dependent" value={summary.consent_dependent} icon={ShieldCheck} tone="amber"/><Metric label="Necessary service processing" value={summary.necessary_service_processing} icon={BadgeCheck} tone="green"/><Metric label="Uncertain" value={summary.uncertain} icon={CircleAlert} tone="violet"/></div>
    <div className="flex flex-wrap items-center gap-2"><Pill tone={payload.validation?.valid ? "green" : "amber"}>{payload.validation?.valid ? "Response validation passed" : "Validation requires attention"}</Pill><Pill tone="slate">{activities.length} activities</Pill></div>
    {activities.map((a,i) => <section key={a.index ?? i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Activity {a.index ?? i+1} · {a.type || "Processing"}</p><h3 className="mt-1 text-base font-bold text-slate-800">{a.signal || a.matched_text || "Processing activity"}</h3><p className="mt-1 text-sm text-slate-500">{a.page_url || "Source page unavailable"}</p></div><Pill tone={a.classification === "consent_dependent" ? "amber" : a.classification === "necessary_service_processing" ? "green" : "slate"}>{statusLabel(a.classification || "Unknown")}</Pill></div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Observed purpose</p><p className="mt-2 text-sm leading-6 text-slate-700">{a.purpose || "Purpose text unavailable"}</p></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3"><InfoTile label="Consent requested" value={a.consent_requested ? "Yes" : "No / not observed"}/><InfoTile label="Optional activity" value={a.optional ? "Yes" : "No"}/><InfoTile label="Necessary" value={a.necessary ? "Yes" : "No"}/></div>
      <button onClick={() => setExpanded(p => ({...p,[i]:!p[i]}))} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">{expanded[i] ? "Hide technical details" : "Show technical details"}<ChevronDown size={16} className={expanded[i] ? "rotate-180" : ""}/></button>
      {expanded[i] && <div className="mt-3 space-y-3 border-t border-slate-100 pt-4"><p className="text-sm leading-6 text-slate-600">{a.reason}</p><InfoTile label="Matched text" value={a.matched_text}/><InfoTile label="Evidence capture" value={`${a.evidence?.status || "Unknown"} · ${a.evidence?.capture_type || "Capture type unavailable"}`}/><p className="text-xs leading-5 text-slate-500">{a.evidence?.note}</p>{firstArray(a.limitations).length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="mb-2 text-xs font-bold uppercase text-amber-800">Interpretation limits</p><ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-amber-900">{a.limitations.map((l,j)=><li key={j}>{l}</li>)}</ul></div>}</div>}
    </section>)}
    {!activities.length && <EmptyState title="No processing activities returned" description="The STEP-05 response did not include processing_activities."/>}
    <Notice tone="warning">A consent-dependent classification is an automated observation, not a legal conclusion that consent is valid, required or freely given. Review the purpose and evidence manually.</Notice>
  </div>;
}

function Step11View({ result }) {
  const payload = stepPayload(result);
  const inner = payload.result ?? {};
  const summary = payload.summary ?? {};
  const found = inner.interface_found === true;
  const categories = firstArray(inner.categories);
  const evidence = firstArray(payload.evidence?.evidence);
  return <div className="space-y-5">
    <div className={cx("rounded-2xl border p-6", found ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70")}>
      <div className="flex items-start gap-4"><span className={cx("rounded-2xl p-3",found ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")}>{found ? <CheckCircle2 size={25}/> : <SlidersHorizontal size={25}/>}</span><div><Pill tone={found ? "green" : "amber"}>{found ? "Interface detected" : "Interface not detected"}</Pill><h3 className="mt-3 text-xl font-bold text-slate-900">{found ? "Preference Management Interface Detected" : "Preference Management Interface Not Detected"}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{found ? "The scanner identified a preference-management interface. Review the categories and evidence below." : "The scanner did not identify a preference-management interface in the inspected pages. This observation alone does not establish a DPDP violation."}</p></div></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Categories found" value={summary.categories_found ?? categories.length} icon={SlidersHorizontal}/><Metric label="Selected categories" value={summary.selected_count} icon={CheckCircle2} tone="green"/><Metric label="Unselected categories" value={summary.unselected_count} icon={CircleAlert} tone="amber"/></div>
    {categories.length ? <div className="grid gap-3 md:grid-cols-2">{categories.map((c,i)=><div key={c.name ?? i} className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-800">{c.name ?? c.category ?? `Category ${i+1}`}</p><p className="mt-2 text-xs text-slate-500">Selected: {String(c.selected ?? c.is_selected ?? "Not specified")}</p></div>)}</div> : <EmptyState title="No preference categories recorded" description="The API returned zero categories for this audit."/>}
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-800">Evidence</h3><p className="mt-1 text-xs text-slate-500">Evidence references returned by the scanner.</p>{evidence.length ? <ul className="mt-3 space-y-2">{evidence.map((e,i)=><li key={i} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{typeof e === "string" ? e : e.file_name ?? e.source_url ?? JSON.stringify(e)}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No evidence files were returned.</p>}</div>
  </div>;
}

function Step13View({ result }) {
  const payload = stepPayload(result);
  const summary = payload.summary ?? {};
  const records = firstArray(payload.records);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const counts = records.reduce((acc,r)=>{ const t=norm(r.type); if(t.includes("COOKIE")) acc.cookies++; else if(t.includes("LOCAL_STORAGE")) acc.storage++; return acc; },{cookies:0,storage:0});
  const rows = records.filter(r => {
    const matches = `${r.name ?? ""} ${r.type ?? ""} ${r.source_page ?? ""} ${r.classification ?? ""}`.toLowerCase().includes(query.toLowerCase());
    const type = norm(r.type);
    return matches && (filter === "ALL" || (filter === "COOKIE" && type === "COOKIE") || (filter === "LOCAL_STORAGE" && type === "LOCAL_STORAGE") || (filter === "NEED_REVIEW" && norm(r.result) === "NEED_REVIEW"));
  });
  return <div className="space-y-5">
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-4"><Metric label="Total records" value={summary.total ?? records.length} icon={Cookie}/><Metric label="Cookies" value={counts.cookies} icon={Globe} tone="violet"/><Metric label="Local storage" value={counts.storage} icon={ClipboardList} tone="cyan"/><Metric label="Need review" value={summary.need_review ?? records.filter(r=>norm(r.result)==="NEED_REVIEW").length} icon={CircleAlert} tone="amber"/></div>
    <Notice tone="warning">The scan completed, but the individual records are classified as UNKNOWN / NEED_REVIEW. This means the scanner could not confidently classify them; it does not prove that they contain personal data.</Notice>
    <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-800">Cookies and browser storage</h3><p className="mt-1 text-xs text-slate-500">Filter and inspect the records returned by STEP-13.</p></div><Pill tone="blue">{rows.length} shown / {records.length} total</Pill></div><div className="mt-4 flex flex-wrap gap-3"><SearchBar value={query} onChange={setQuery} placeholder="Search name or source page…"/><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="ALL">All records</option><option value="COOKIE">Cookies</option><option value="LOCAL_STORAGE">Local storage</option><option value="NEED_REVIEW">Need review</option></select></div></div>
    <DataTable columns={["Name","Type","Classification","Assessment","Source page",""]} rows={rows} renderRow={(r,i)=><tr key={`${r.type}-${r.index ?? i}`} className="hover:bg-blue-50/40"><td className="max-w-55 break-all px-4 py-4 font-semibold text-slate-800">{r.name || "Unnamed record"}</td><td className="px-4 py-4"><Pill tone={norm(r.type)==="COOKIE"?"violet":"cyan"}>{statusLabel(r.type)}</Pill></td><td className="px-4 py-4"><Pill>{statusLabel(r.classification || "UNKNOWN")}</Pill></td><td className="px-4 py-4"><Pill tone="amber">{statusLabel(r.result || "NEED_REVIEW")}</Pill></td><td className="max-w-[260px] truncate px-4 py-4 text-slate-500">{r.source_page || "—"}</td><td className="px-4 py-4 text-right"><button onClick={()=>setSelected(r)} className="font-semibold text-blue-700">Inspect</button></td></tr>}/>
    {selected && <RecordModal title="Storage record details" data={selected} onClose={()=>setSelected(null)}/>}
  </div>;
}

function InfoTile({ label, value }) {
  return <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 wrap-break-word text-sm font-semibold text-slate-700">{value == null || value === "" ? "Not available" : String(value)}</p></div>;
}

function RecordModal({ title, data, onClose }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={onClose}><aside onMouseDown={e=>e.stopPropagation()} className="h-full w-full max-w-xl animate-[slideIn_.25s_ease-out] overflow-y-auto bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Technical evidence</p><h3 className="mt-1 text-xl font-bold text-slate-900">{title}</h3></div><button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></div><pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(data,null,2)}</pre><p className="mt-3 text-xs leading-5 text-slate-500">Raw record details are shown for traceability. Interpret them alongside the step summary and evidence context.</p></aside></div>;
}

export default function SelfCheckConsentScanResult({ publicAuditId }) {
  const [summaryResponse, setSummaryResponse] = useState(null);
  const [activeStepId, setActiveStepId] = useState("STEP-01");
  const [stepResponses, setStepResponses] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingStep, setLoadingStep] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");

  const loadSummary = useCallback(async (isRefresh = false) => {
    if (!publicAuditId) { setError("Public Audit ID is missing."); setLoadingSummary(false); return; }
    isRefresh ? setRefreshing(true) : setLoadingSummary(true);
    setError("");
    try {
      const data = await getConsentAuditSummary(publicAuditId);
      setSummaryResponse(data);
    } catch (e) { setError(e.message || "Unable to load consent audit summary."); }
    finally { setLoadingSummary(false); setRefreshing(false); }
  }, [publicAuditId]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const activeMeta = VISIBLE_STEPS.find(s => s.id === activeStepId) ?? VISIBLE_STEPS[0];
  const activeStatus = getStepStatus(summaryResponse, activeMeta);
  const activeResult = stepResponses[activeMeta.id];

  const openStep = async (meta) => {
    setActiveStepId(meta.id);
    setStepError("");
    if (stepResponses[meta.id]) return;
    setLoadingStep(true);
    try {
      const response = await getConsentStepResult(publicAuditId, meta.apiNumber);
      setStepResponses(prev => ({ ...prev, [meta.id]: response }));
    } catch (e) { setStepError(e.message || `Unable to load ${meta.title}.`); }
    finally { setLoadingStep(false); }
  };

  // Load the first visible assessment automatically after the summary arrives.
  useEffect(() => {
    if (summaryResponse && !stepResponses[activeMeta.id]) openStep(activeMeta);
  }, [summaryResponse, activeMeta.id]);

  const audit = summaryResponse?.audit ?? summaryResponse?.data?.audit ?? {};
  const website = audit.url ?? audit.website_url ?? "Website URL unavailable";
  const statuses = useMemo(() => VISIBLE_STEPS.map(meta => ({...meta,status:getStepStatus(summaryResponse,meta)})), [summaryResponse]);
  const completedCount = statuses.filter(s=>["COMPLETED","SUCCESS"].includes(s.status)).length;

  if (loadingSummary) return <div className="min-h-[55vh] bg-slate-50 px-4 py-10"><div className="mx-auto max-w-7xl"><LoadingState label="Loading consent audit summary…"/></div></div>;

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 px-2 py-5 text-slate-900 sm:px-4 xl:px-5">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{opacity:.5;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div className="mx-auto w-full min-w-0 max-w-480">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-slate-400"><span>My Scans</span><ChevronRight size={13}/><span>Consent Management</span><ChevronRight size={13}/><span className="font-semibold text-slate-600">Results</span></div><button onClick={()=>loadSummary(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-50"><RefreshCw size={14} className={refreshing?"animate-spin":""}/> Refresh summary</button></div>
        <header className="relative mb-6 w-full min-w-0 overflow-hidden rounded-3xl bg-linear-to-br from-[#12356b] via-[#1557a6] to-[#168bba] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-36 border-white/5"/><div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl"/>
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="min-w-0"><div className="mb-3 flex flex-wrap gap-2"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">Consent Management Scanner</span><span className="rounded-full border border-emerald-200/30 bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">Audit results</span></div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Consent Assessment Report</h1><a href={website.startsWith("http")?website:undefined} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm text-blue-100 hover:text-white">{website}<ExternalLink size={13} className="shrink-0"/></a><p className="mt-2 break-all text-xs text-blue-100/80">Public Audit ID: {publicAuditId}</p></div><div className="grid grid-cols-2 gap-3 sm:min-w-[300px]"><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-blue-100">Visible assessments</p><p className="mt-1 text-3xl font-bold">06</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-blue-100">Completed</p><p className="mt-1 text-3xl font-bold">{completedCount}/6</p></div></div></div>
        </header>
        {error && <div className="mb-5"><Notice tone="warning">{error} <button onClick={()=>loadSummary()} className="ml-1 font-bold underline">Try again</button></Notice></div>}
        <div className="grid w-full min-w-0 items-start gap-4 2xl:gap-6 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-3 xl:sticky xl:top-5">
            <div className="px-1"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Assessment navigation</p><h2 className="mt-1 text-lg font-bold text-slate-900">Step-wise results</h2><p className="mt-1 text-xs leading-5 text-slate-500">Select an assessment to load its detailed evidence.</p></div>
            {statuses.map(meta=><StepNavigationCard key={meta.id} meta={meta} status={meta.status} selected={activeMeta.id===meta.id} onClick={()=>openStep(meta)} payload={stepResponses[meta.id]?stepPayload(stepResponses[meta.id]):null}/>)}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-xs font-bold text-blue-900">How to read this report</p><p className="mt-1 text-xs leading-5 text-blue-800">Scanner outputs are technical observations. Validate relevant records and evidence before recording a compliance conclusion.</p></div>
          </aside>
          <main className="w-full min-w-0">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-blue-700">Assessment {String(activeMeta.number).padStart(2,"0")} of 06</p><h2 className="mt-1 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">{activeMeta.title}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{activeMeta.description}</p></div><Pill tone={statusTone(activeStatus)}>{statusLabel(activeStatus)}</Pill></div>
            {loadingStep ? <LoadingState/> : stepError ? <div className="space-y-3"><Notice tone="warning">{stepError}</Notice><button onClick={()=>openStep(activeMeta)} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">Retry loading step</button></div> : !activeResult ? <EmptyState title="Select an assessment" description="Choose one of the six assessments on the left to load its result and technical evidence."/> :
              <div key={activeMeta.id} className="animate-[fadeIn_.3s_ease-out]">
                {activeMeta.id==="STEP-01" && <Step01View result={activeResult} publicAuditId={publicAuditId}/>}
                {activeMeta.id==="STEP-02" && <Step02View result={activeResult}/>}
                {activeMeta.id==="STEP-04" && <Step04View result={activeResult}/>}
                {activeMeta.id==="STEP-05" && <Step05View result={activeResult}/>}
                {activeMeta.id==="STEP-11" && <Step11View result={activeResult}/>}
                {activeMeta.id==="STEP-13" && <Step13View result={activeResult}/>}
              </div>
            }
          </main>
        </div>
        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">Consent Management Scanner · DPACOMPASS · Public Audit ID {publicAuditId}</footer>
      </div>
    </div>
  );
}
