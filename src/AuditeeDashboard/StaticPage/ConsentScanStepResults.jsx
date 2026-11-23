import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BadgeCheck, ChevronRight, CircleAlert,
  ClipboardList, FileSearch, Fingerprint, Globe, Info, Search,
  ShieldCheck, ShieldX, X
} from "lucide-react";

const scan = {
  auditId: "DPA-2026-000019",
  website: "https://ihrms.cdac.in",
  scannedAt: "18 Nov 2026",
  pagesScanned: 17,
};

// Static demo data populated from the supplied crawler result.
// The summary metrics reflect the full result; the tables show representative records.
const steps = [
  {
    id: "STEP-01", number: "01",
    title: "Identify Personal Data Collection Points",
    description: "Identify forms and fields that may collect personal data across the scanned website.",
    status: "COMPLETED",
    summary: { total: 24, confirmed: 13, review: 11, forms: 17, pages: 17 },
    categories: [
      { name: "Free text", count: 11 }, { name: "Name", count: 6 },
      { name: "Location", count: 6 }, { name: "Phone", count: 1 }
    ],
    rows: [
      { id: 1, category: "Free text", field: "txtWorkDone", label: "Not provided", type: "textarea", form: "frmNewExtraDuty", page: "Extra Duty Application", url: "https://ihrms.cdac.in/hrms/udf/edes", method: "POST", confidence: 61, classification: "REVIEW_REQUIRED", reason: "Unlabelled free-text control can accept arbitrary user-entered information. It is included as a potential collection point for manual review." },
      { id: 2, category: "Free text", field: "shortLeaveReason", label: "Not provided", type: "textarea", form: "frmShortLeave", page: "Short Leave Application", url: "https://ihrms.cdac.in/hrms/udf/asl", method: "POST", confidence: 61, classification: "REVIEW_REQUIRED", reason: "Unlabelled free-text control can accept arbitrary user-entered information. It is included as a potential collection point for manual review." },
      { id: 3, category: "Name", field: "projectSearch", label: "Search project by name", type: "text", form: "frmEmpTourAdvanceHomePage", page: "Tour Advance Home Page", url: "https://ihrms.cdac.in/hrms/udf/eta", method: "POST", confidence: 95, classification: "CONFIRMED", reason: "Label metadata matched baseline personal-data indicator 'name'." },
      { id: 4, category: "Location", field: "cmb_tour_loc", label: "Select location for tour requisition", type: "select", form: "frmEmpTourAdvanceHomePage", page: "Tour Advance Home Page", url: "https://ihrms.cdac.in/hrms/udf/eta", method: "POST", confidence: 90, classification: "CONFIRMED", reason: "Label metadata matched baseline personal-data indicator 'location'." },
      { id: 5, category: "Free text", field: "purpose", label: "Not provided", type: "textarea", form: "frmEmpContAdvHomePage", page: "Contingency Advance", url: "https://ihrms.cdac.in/hrms/udf/empcontadvmenu", method: "POST", confidence: 61, classification: "REVIEW_REQUIRED", reason: "Unlabelled free-text control can accept arbitrary user-entered information. It is included as a potential collection point for manual review." },
      { id: 6, category: "Free text", field: "entrySlipReason", label: "Not provided", type: "textarea", form: "frmEntrySlip", page: "Entry Slip Application", url: "https://ihrms.cdac.in/hrms/udf/esapp", method: "POST", confidence: 61, classification: "REVIEW_REQUIRED", reason: "Unlabelled free-text control can accept arbitrary user-entered information. It is included as a potential collection point for manual review." }
    ]
  },
  {
    id: "STEP-02", number: "02",
    title: "Verify Notice Before or at Personal-Data Collection",
    description: "Check whether a privacy notice is detected before or at the point where personal data is collected.",
    status: "COMPLETED",
    summary: { total: 24, found: 15, missing: 9 },
    rows: [
      { id: 1, category: "Free text", form: "frmNewExtraDuty", page: "Extra Duty Application", url: "https://ihrms.cdac.in/hrms/udf/edes", position: "NOT_FOUND", found: false },
      { id: 2, category: "Free text", form: "frmShortLeave", page: "Short Leave Application", url: "https://ihrms.cdac.in/hrms/udf/asl", position: "NOT_FOUND", found: false },
      { id: 3, category: "Name", form: "frmEmpTourAdvanceHomePage", page: "Tour Advance Home Page", url: "https://ihrms.cdac.in/hrms/udf/eta", position: "BEFORE_OR_AT", found: true },
      { id: 4, category: "Location", form: "frmEmpTourAdvanceHomePage", page: "Tour Advance Home Page", url: "https://ihrms.cdac.in/hrms/udf/eta", position: "BEFORE_OR_AT", found: true },
      { id: 5, category: "Free text", form: "frmEmpContAdvHomePage", page: "Contingency Advance", url: "https://ihrms.cdac.in/hrms/udf/empcontadvmenu", position: "BEFORE_OR_AT", found: true },
      { id: 6, category: "Free text", form: "frmEntrySlip", page: "Entry Slip Application", url: "https://ihrms.cdac.in/hrms/udf/esapp", position: "NOT_FOUND", found: false }
    ]
  }
];

const cls = (...v) => v.filter(Boolean).join(" ");

function Pill({ children, tone = "slate" }) {
  const colors = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600"
  };
  return <span className={cls("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", colors[tone])}>{children}</span>;
}

function Metric({ label, value, note, icon: Icon, tone = "blue" }) {
  const iconTone = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-rose-50 text-rose-700", slate: "bg-slate-100 text-slate-700" };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between gap-3">
        <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</div>
        <span className={cls("h-fit rounded-xl p-2.5", iconTone[tone])}><Icon size={19} /></span>
      </div>
    </div>
  );
}

function Header({ title, onBack, isDetail }) {
  return (
    <>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700"><ArrowLeft size={16} /> {isDetail ? "Back to scan overview" : "Back to My Scans"}</button>
      <div className="mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2"><Pill tone="blue">Consent Management Scanner</Pill><Pill tone="green">Completed</Pill></div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500"><Globe size={14} /><span className="break-all">{scan.website}</span><span>· Audit ID: {scan.auditId}</span></p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Pages scanned</p><p className="mt-1 font-bold">{scan.pagesScanned}</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Scan date</p><p className="mt-1 font-bold">{scan.scannedAt}</p></div>
        </div>
      </div>
    </>
  );
}

function StepCard({ step, open }) {
  const first = step.id === "STEP-01";
  const good = first ? step.summary.confirmed : step.summary.found;
  const review = first ? step.summary.review : step.summary.missing;
  return (
    <button onClick={() => open(step.id)} className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700">{step.number}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{step.title}</h3><Pill tone="green">Completed</Pill></div>
          <p className="mt-1 text-sm text-slate-500">{step.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{first ? "Collection points" : "Points assessed"}</p><p className="mt-1 text-2xl font-bold">{first ? step.summary.total : step.summary.total}</p></div>
            <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">{first ? "Confirmed" : "Notice detected"}</p><p className="mt-1 text-2xl font-bold text-emerald-800">{good}</p></div>
            <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-700">{first ? "Review required" : "Notice not detected"}</p><p className="mt-1 text-2xl font-bold text-amber-800">{review}</p></div>
          </div>
        </div>
        <span className="flex items-center gap-1 self-end text-sm font-semibold text-blue-700 md:self-center">View details <ChevronRight size={17} className="transition group-hover:translate-x-1" /></span>
      </div>
    </button>
  );
}

function Summary({ open }) {
  const a = steps[0].summary, b = steps[1].summary;
  return (
    <>
      <Header title="Consent Scan Results" onBack={() => {}} />
      <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Executive overview</p><h2 className="mt-1 text-xl font-bold">Overall scan summary</h2><p className="mt-1 text-sm text-slate-500">A consolidated view of personal-data collection and notice detection.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Collection points" value={a.total} note="Identified by crawler" icon={Fingerprint} />
        <Metric label="Confirmed points" value={a.confirmed} note="Classifier confirmed" icon={BadgeCheck} tone="green" />
        <Metric label="Review required" value={a.review} note="Auditor verification needed" icon={CircleAlert} tone="amber" />
        <Metric label="Notices detected" value={b.found} note={`${b.missing} not detected`} icon={FileSearch} tone="green" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold">Collection footprint</h3><p className="mt-1 text-xs text-slate-500">Pages and forms containing potential collection points.</p>
          <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Forms</p><p className="text-3xl font-bold">{a.forms}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Pages</p><p className="text-3xl font-bold">{a.pages}</p></div></div>
          <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Classification breakdown</span><span>{a.total} points</span></div><div className="flex h-3 overflow-hidden rounded-full bg-slate-100"><div className="bg-emerald-500" style={{ width: `${a.confirmed / a.total * 100}%` }} /><div className="bg-amber-400" style={{ width: `${a.review / a.total * 100}%` }} /></div><div className="mt-3 flex gap-5 text-xs text-slate-600"><span>● Confirmed: {a.confirmed}</span><span>● Review required: {a.review}</span></div></div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold">Notice detection</h3><p className="mt-1 text-xs text-slate-500">Notice presence at identified collection points.</p>
          <div className="mt-5 flex items-center gap-5"><div className="relative flex h-28 w-28 items-center justify-center rounded-full" style={{ background: `conic-gradient(#10b981 ${b.found / b.total * 100}%, #f59e0b 0)` }}><div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white"><b className="text-2xl">{Math.round(b.found / b.total * 100)}%</b><span className="text-[10px] text-slate-500">Detected</span></div></div><div className="space-y-3"><div><b className="text-2xl text-emerald-700">{b.found}</b><p className="text-xs text-slate-500">Notice detected</p></div><div><b className="text-2xl text-amber-700">{b.missing}</b><p className="text-xs text-slate-500">Notice not detected</p></div></div></div>
          <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><Info size={16} className="mt-0.5 shrink-0" /> "Notice not detected" is a crawler observation for auditor verification, not a final legal conclusion.</div>
        </section>
      </div>
      <div className="mb-4 mt-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Drill down</p><h2 className="mt-1 text-xl font-bold">Step-wise results</h2><p className="mt-1 text-sm text-slate-500">Select a step to inspect its findings and technical evidence.</p></div>
      <div className="space-y-4">{steps.map(s => <StepCard key={s.id} step={s} open={open} />)}</div>
    </>
  );
}

function DetailPanel({ item, stepId, close }) {
  if (!item) return null;
  const first = stepId === "STEP-01";
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" onMouseDown={close}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Crawler evidence</p><h3 className="mt-1 text-xl font-bold">{first ? item.field : item.form}</h3><p className="mt-1 text-sm text-slate-500">{item.page}</p></div><button onClick={close} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div>
        <div className="mt-5 flex flex-wrap gap-2">{first ? <Pill tone={item.classification === "CONFIRMED" ? "green" : "amber"}>{item.classification.replaceAll("_", " ")}</Pill> : <Pill tone={item.found ? "green" : "amber"}>{item.found ? "Notice detected" : "Notice not detected"}</Pill>}</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {(first ? [["Field name", item.field], ["Field label", item.label], ["Field type", item.type], ["Data category", item.category], ["Form name", item.form], ["HTTP method", item.method], ["Confidence", `${item.confidence}%`], ["Classification", item.classification]] : [["Form name", item.form], ["Data category", item.category], ["Notice position", item.position.replaceAll("_", " ")], ["Notice detected", item.found ? "Yes" : "No"]]).map(([k,v]) => <div key={k} className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase text-slate-500">{k}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{v || "Not available"}</p></div>)}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase text-slate-500">Page URL</p><p className="mt-2 break-all text-sm text-blue-700">{item.url}</p></div>
        {first && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-900">Classification reason</p><p className="mt-2 text-sm leading-6 text-amber-800">{item.reason}</p></div>}
        {!first && <div className="mt-4 rounded-xl border border-slate-200 p-4"><p className="font-semibold">Notice evidence</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.found ? "Notice detected before or at the collection point. Detailed extracted notice text and notice metadata can be displayed here when supplied by the crawler API." : "No notice was detected for this collection point in the current crawler result. Verify the live page and any linked privacy notice manually."}</p></div>}
        <div className="mt-5 flex gap-2 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><Info size={16} className="mt-0.5 shrink-0" /> Crawler evidence should be validated by the auditor before recording a compliance decision.</div>
      </aside>
    </div>
  );
}

function StepDetail({ step, back }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const first = step.id === "STEP-01";
  const rows = useMemo(() => step.rows.filter(r => {
    const match = `${r.field || ""} ${r.label || ""} ${r.form} ${r.page} ${r.category}`.toLowerCase().includes(query.toLowerCase());
    const status = first ? r.classification : (r.found ? "FOUND" : "MISSING");
    return match && (filter === "ALL" || filter === status);
  }), [step, query, filter, first]);

  return (
    <>
      <Header title={`Step ${step.number} — ${first ? "Collection Points" : "Notice Verification"}`} onBack={back} isDetail />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Step {step.number} · {first ? "Collection points" : "Notice verification"}</p><h2 className="mt-1 text-2xl font-bold">{step.title}</h2><p className="mt-1 max-w-3xl text-sm text-slate-500">{step.description}</p></div><Pill tone="green">Completed</Pill></div>
      {first ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Collection points" value={step.summary.total} icon={Fingerprint} /><Metric label="Confirmed" value={step.summary.confirmed} icon={BadgeCheck} tone="green" /><Metric label="Review required" value={step.summary.review} icon={CircleAlert} tone="amber" /><Metric label="Forms involved" value={step.summary.forms} icon={ClipboardList} tone="slate" /></div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Personal-data categories</h3><p className="mt-1 text-xs text-slate-500">Counts from crawler summary.</p><div className="mt-4 space-y-4">{step.categories.map(c => <div key={c.name}><div className="mb-1 flex justify-between text-sm"><span>{c.name}</span><b>{c.count}</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${c.count / 11 * 100}%` }} /></div></div>)}</div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Classification guidance</h3><p className="mt-3 text-sm leading-6 text-slate-600"><b className="text-emerald-700">Confirmed:</b> field metadata matched a personal-data indicator.</p><p className="mt-2 text-sm leading-6 text-slate-600"><b className="text-amber-700">Review required:</b> the field may accept personal data, but its purpose or content needs human verification.</p><p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">Representative records are shown below for demonstration. The full crawler result contains 24 collection points.</p></section>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3"><Metric label="Points assessed" value={step.summary.total} icon={ClipboardList} /><Metric label="Notice detected" value={step.summary.found} icon={ShieldCheck} tone="green" /><Metric label="Notice not detected" value={step.summary.missing} icon={ShieldX} tone="amber" /></div>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><b>Interpretation:</b> The crawler reports notice detection and its position relative to the collection point. "Not detected" should be manually verified and is not automatically a final non-compliance finding.</div>
        </>
      )}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">{first ? "Detected collection points" : "Notice verification results"}</h3><p className="mt-1 text-xs text-slate-500">Select a record to inspect its technical evidence.</p></div><span className="text-xs text-slate-500">{rows.length} representative records</span></div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search field, form, page or category..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></div><div className="flex flex-wrap gap-2">{(first ? [["ALL","All"],["CONFIRMED","Confirmed"],["REVIEW_REQUIRED","Review required"]] : [["ALL","All"],["FOUND","Detected"],["MISSING","Not detected"]]).map(([v,l]) => <button key={v} onClick={() => setFilter(v)} className={cls("rounded-full border px-3 py-1.5 text-xs font-semibold", filter === v ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 text-slate-600")}>{l}</button>)}</div></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{(first ? ["Field / label","Category","Page / form","Confidence","Classification"] : ["Category","Page / form","Notice position","Detection"]).map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}<th className="px-5 py-3 text-right"> </th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(r => <tr key={r.id} className="hover:bg-slate-50">
          {first ? <><td className="px-5 py-4"><b>{r.field}</b><p className="mt-1 text-xs text-slate-500">{r.label}</p></td><td className="px-5 py-4">{r.category}</td><td className="px-5 py-4"><b>{r.page}</b><p className="mt-1 text-xs text-slate-500">{r.form}</p></td><td className="px-5 py-4">{r.confidence}%</td><td className="px-5 py-4"><Pill tone={r.classification === "CONFIRMED" ? "green" : "amber"}>{r.classification.replaceAll("_"," ")}</Pill></td></> : <><td className="px-5 py-4">{r.category}</td><td className="px-5 py-4"><b>{r.page}</b><p className="mt-1 text-xs text-slate-500">{r.form}</p></td><td className="px-5 py-4">{r.position.replaceAll("_"," ")}</td><td className="px-5 py-4"><Pill tone={r.found ? "green" : "amber"}>{r.found ? "Detected" : "Not detected"}</Pill></td></>}
          <td className="px-5 py-4 text-right"><button onClick={() => setSelected(r)} className="inline-flex items-center gap-1 font-semibold text-blue-700">Inspect <ArrowRight size={14}/></button></td>
        </tr>)}{rows.length === 0 && <tr><td colSpan={6} className="px-5 py-9 text-center text-slate-500">No matching records.</td></tr>}</tbody></table></div>
      </section>
      <DetailPanel item={selected} stepId={step.id} close={() => setSelected(null)} />
    </>
  );
}

export default function ConsentScanStepResults() {
  const [activeStep, setActiveStep] = useState(null);
  const current = steps.find(s => s.id === activeStep);
  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-400"><span>My Scans</span><ChevronRight size={13}/><span>Consent Management</span><ChevronRight size={13}/><span className="font-semibold text-slate-600">{current ? current.id : "Results"}</span></div>
        {current ? <StepDetail key={current.id} step={current} back={() => setActiveStep(null)} /> : <Summary open={setActiveStep} />}
        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">Consent Management Scanner · Mock UI · Static demo report · representative evidence records</div>
      </div>
    </div>
  );
}
