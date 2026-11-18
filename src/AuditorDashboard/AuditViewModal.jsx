import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClipboard,
  FiExternalLink,
  FiFileText,
  FiLayers,
  FiSearch,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

/* Modal styling is intentionally contained in this component.
   DashboardLayout remains the owner of the dashboard page background. */
const modalStyles = String.raw`
.avm-backdrop,
.avm-backdrop * { box-sizing: border-box; }
.avm-backdrop {
  --avm-ink: #17324f;
  --avm-muted: #60758a;
  --avm-line: #dfe7ef;
  --avm-blue: #205a91;
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(13, 30, 51, 0.62);
  color: var(--avm-ink);
  font-family: Inter, "Segoe UI", system-ui, sans-serif;
}
.avm-dialog {
  width: min(100%, 1080px);
  max-height: min(92dvh, 980px);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d9e4ee;
  border-radius: 18px;
  box-shadow: 0 28px 90px rgba(4, 21, 40, 0.32);
}
.avm-tricolour {
  flex: 0 0 4px;
  background: linear-gradient(to right, #df993c 0 33.33%, #e9edf2 33.33% 66.66%, #268657 66.66%);
}
.avm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 21px 26px 18px;
  border-bottom: 1px solid var(--avm-line);
}
.avm-heading-row { display: flex; align-items: flex-start; gap: 13px; min-width: 0; }
.avm-heading-icon {
  display: grid;
  place-items: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border: 1px solid #d8e6f6;
  border-radius: 11px;
  color: var(--avm-blue);
  background: #eef5fd;
  font-size: 22px;
}
.avm-eyebrow {
  margin: 0 0 5px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .11em;
  color: #6c8196;
}
.avm-title {
  margin: 0;
  font-size: clamp(19px, 2vw, 25px);
  line-height: 1.3;
  color: #15314e;
  font-weight: 750;
  overflow-wrap: anywhere;
}
.avm-subtitle { margin: 5px 0 0; color: var(--avm-muted); font-size: 13px; line-height: 1.5; }
.avm-close {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: #f8fafc;
  border: 1px solid var(--avm-line);
  border-radius: 9px;
  color: #526a80;
  cursor: pointer;
  font-size: 19px;
}
.avm-close:hover { background: #eaf2fb; color: #1d527f; }
.avm-body { overflow-y: auto; overscroll-behavior: contain; min-height: 0; padding: 23px 26px 26px; }
.avm-section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 13px;
  color: #244c73;
  font-size: 14px;
  font-weight: 750;
}
.avm-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 26px;
}
.avm-info {
  padding: 14px 15px;
  min-width: 0;
  border: 1px solid var(--avm-line);
  border-radius: 11px;
  background: #f9fbfd;
}
.avm-info-label {
  display: block;
  margin-bottom: 6px;
  color: #718498;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.avm-info-value {
  display: block;
  color: #183653;
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
  line-height: 1.5;
}
.avm-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #1c619a;
}
.avm-link:hover { text-decoration: underline; }
.avm-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border: 1px solid #eecf94;
  background: #fff7e7;
  border-radius: 999px;
  color: #94600d;
  font-size: 12px;
  font-weight: 750;
  text-transform: capitalize;
}
.avm-status--accepted,
.avm-status--approved,
.avm-status--completed { color: #167047; background: #ecf9f1; border-color: #bce5cc; }
.avm-status--rejected,
.avm-status--declined { color: #b42331; background: #fff1f2; border-color: #f1c4cb; }
.avm-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.avm-toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.avm-count {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  color: #526a83;
  font-size: 12px;
  font-weight: 650;
  background: #f2f6fa;
  border-radius: 7px;
}
.avm-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(100%, 310px);
  height: 40px;
  padding: 0 12px;
  background: #fff;
  color: #647d94;
  border: 1px solid #cfdeeb;
  border-radius: 9px;
}
.avm-search input { min-width: 0; flex: 1; outline: none; background: transparent; color: var(--avm-ink); border: 0; font-size: 13px; }
.avm-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.avm-button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 13px;
  color: #23557e;
  background: #fff;
  border: 1px solid #d2e0ec;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.avm-button:hover { background: #f1f6fc; }
.avm-button--primary { background: #205a91; border-color: #205a91; color: #fff; }
.avm-button--primary:hover { background: #184973; }
.avm-domains { display: flex; flex-direction: column; gap: 15px; }
.avm-domain {
  overflow: hidden;
  border: 1px solid #dbe5ef;
  background: #fff;
  border-radius: 13px;
}
.avm-domain-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
  background: #f4f8fc;
  border-bottom: 1px solid #e4ecf4;
}
.avm-domain-name { margin: 0; color: #19466f; font-size: 15px; font-weight: 750; line-height: 1.45; }
.avm-domain-badge { color: #466985; font-size: 12px; font-weight: 650; white-space: nowrap; }
.avm-checklists { display: flex; flex-direction: column; padding: 12px; gap: 9px; }
.avm-checklist { border: 1px solid #e1e8f0; border-radius: 10px; overflow: hidden; }
.avm-checklist-trigger {
  width: 100%;
  min-height: 55px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 0;
  color: #243f59;
}
.avm-checklist-trigger:hover, .avm-checklist-trigger[aria-expanded="true"] { background: #f5f9fd; }
.avm-checklist-chevron { color: #2c669a; flex-shrink: 0; }
.avm-checklist-text { flex: 1; min-width: 0; }
.avm-checklist-clause { display: block; font-size: 13px; font-weight: 700; line-height: 1.55; overflow-wrap: anywhere; }
.avm-checklist-meta { display: block; color: #71869a; margin-top: 4px; font-size: 11px; }
.avm-evidence-count { flex-shrink: 0; font-size: 12px; color: #647c93; }
.avm-evidence-list { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px 15px; background: #fafcfe; border-top: 1px solid #e6edf4; }
.avm-evidence { background: #fff; border: 1px solid #e3ebf2; border-radius: 9px; padding: 13px 14px; }
.avm-evidence-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.avm-evidence-name { margin: 0; font-size: 13px; font-weight: 700; line-height: 1.6; color: #284763; }
.avm-evidence-type { margin-top: 6px; font-size: 12px; color: #6e8295; }
.avm-severity { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 750; white-space: nowrap; text-transform: capitalize; background: #eef2f6; color: #63788e; }
.avm-severity--high { background: #fff0f1; color: #b42331; }
.avm-severity--medium { background: #fff6e6; color: #98600a; }
.avm-severity--low { background: #eaf9f0; color: #18754e; }
.avm-preview-label { display: block; margin: 12px 0 6px; font-size: 11px; color: #60758a; font-weight: 650; }
.avm-preview { width: 100%; padding: 9px 11px; border: 1px solid #d9e4ed; border-radius: 8px; background: #f8fafc; color: #6a7f92; font-size: 13px; }
.avm-preview:disabled { opacity: 1; cursor: not-allowed; }
.avm-preview-checkbox { display: flex; align-items: center; gap: 8px; color: #647c92; font-size: 13px; }
.avm-note { font-size: 12px; line-height: 1.5; color: #6d8093; margin: 11px 0 0; }
.avm-empty { text-align: center; padding: 28px 16px; background: #f8fbfd; border: 1px dashed #cad9e8; border-radius: 11px; color: #657c91; font-size: 13px; }
.avm-empty svg { display: block; margin: 0 auto 10px; font-size: 26px; color: #7e9bb4; }
.avm-footer {
  padding: 15px 26px;
  border-top: 1px solid var(--avm-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #6b8095;
  font-size: 12px;
  background: #fbfcfe;
}
.avm-backdrop :is(button, input, textarea, a):focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
@media (max-width: 760px) {
  .avm-backdrop { padding: 10px; }
  .avm-dialog { max-height: 96dvh; border-radius: 12px; }
  .avm-header { padding: 16px; }
  .avm-body { padding: 18px 16px; }
  .avm-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .avm-toolbar { align-items: stretch; }
  .avm-search { width: 100%; }
  .avm-footer { padding: 13px 16px; }
}
@media (max-width: 520px) {
  .avm-overview { grid-template-columns: 1fr; }
  .avm-domain-heading { align-items: flex-start; flex-direction: column; }
  .avm-evidence-count { display: none; }
  .avm-actions { width: 100%; }
  .avm-actions .avm-button { flex: 1; }
  .avm-evidence-head { align-items: flex-start; }
  .avm-footer { flex-direction: column; align-items: stretch; }
  .avm-footer .avm-button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .avm-dialog * { scroll-behavior: auto !important; }
}
`;

function safeExternalUrl(value) {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function EvidencePreview({ evidence }) {
  const type = String(evidence?.field_type || "").toLowerCase();
  if (!type) return null;

  return (
    <div>
      <span className="avm-preview-label">Expected response format (preview only)</span>
      {type === "textarea" ? (
        <textarea className="avm-preview" rows={2} placeholder="Long text response" disabled />
      ) : type === "text" ? (
        <input className="avm-preview" type="text" placeholder="Text response" disabled />
      ) : type === "number" ? (
        <input className="avm-preview" type="number" placeholder="Numeric response" disabled />
      ) : type === "boolean" ? (
        <label className="avm-preview-checkbox">
          <input type="checkbox" disabled /> Yes / No response
        </label>
      ) : type === "file" ? (
        <div className="avm-preview"><FiFileText aria-hidden="true" style={{ display: "inline", marginRight: 6 }} /> File upload required</div>
      ) : (
        <div className="avm-preview">{type} response</div>
      )}
    </div>
  );
}

export default function AuditViewModal({ audit, onClose }) {
  const [openChecklists, setOpenChecklists] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const closeRef = useRef(null);

  const domains = useMemo(
    () => (Array.isArray(audit?.domains) ? audit.domains : []),
    [audit]
  );

  const groups = useMemo(() => domains.map((domain, di) => ({
    domain,
    domainIndex: di,
    checklists: (Array.isArray(domain?.checklists) ? domain.checklists : []).map((checklist, ci) => ({
      checklist,
      checklistIndex: ci,
      key: `${di}-${ci}`,
    })),
  })), [domains]);

  const totalChecklists = groups.reduce((sum, group) => sum + group.checklists.length, 0);
  const totalEvidence = groups.reduce((sum, group) =>
    sum + group.checklists.reduce((n, item) => n + (Array.isArray(item.checklist?.evidence) ? item.checklist.evidence.length : 0), 0), 0);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.map((group) => {
      const matchesDomain = String(group.domain?.domain_name || "").toLowerCase().includes(q);
      const checklists = matchesDomain ? group.checklists : group.checklists.filter(({ checklist }) =>
        String(checklist?.clause || "").toLowerCase().includes(q) ||
        (Array.isArray(checklist?.evidence) && checklist.evidence.some((ev) =>
          String(ev?.name || "").toLowerCase().includes(q)
        ))
      );
      return { ...group, checklists };
    }).filter((group) => group.checklists.length > 0 ||
      String(group.domain?.domain_name || "").toLowerCase().includes(q)
    );
  }, [groups, search]);

  useEffect(() => {
    if (!audit) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "Tab") {
        // Keep keyboard focus inside the modal.
        const dialog = closeRef.current?.closest('[role="dialog"]');
        if (!dialog) return;
        const focusable = Array.from(dialog.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [audit, onClose]);

  if (!audit) return null;

  const applicationName = audit.name || "Audit application";
  const safeUrl = safeExternalUrl(audit.url);
  const status = String(audit.status || "Pending");
  const statusClass = status.toLowerCase().replace(/[^a-z]/g, "-");
  const allKeys = groups.flatMap((group) => group.checklists.map((item) => item.key));
  const isOpen = (key) => openChecklists.has(key);
  const toggleChecklist = (key) => {
    setOpenChecklists((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return createPortal(
    <>
      <style>{modalStyles}</style>
      <div className="avm-backdrop" onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}>
        <section className="avm-dialog" role="dialog" aria-modal="true" aria-labelledby="avm-title" aria-describedby="avm-description">
          <div className="avm-tricolour" aria-hidden="true" />
          <header className="avm-header">
            <div className="avm-heading-row">
              <span className="avm-heading-icon"><FiShield aria-hidden="true" /></span>
              <div>
                <p className="avm-eyebrow">DPACOMPASS · AUDIT MANAGEMENT</p>
                <h2 id="avm-title" className="avm-title">{applicationName}</h2>
                <p id="avm-description" className="avm-subtitle">Application details and linked audit checklist</p>
              </div>
            </div>
            <button ref={closeRef} className="avm-close" type="button" aria-label="Close audit details" onClick={onClose}>
              <FiX aria-hidden="true" />
            </button>
          </header>

          <div className="avm-body">
            <h3 className="avm-section-label"><FiClipboard aria-hidden="true" /> Application Information</h3>
            <div className="avm-overview">
              <div className="avm-info">
                <span className="avm-info-label">Auditor</span>
                <span className="avm-info-value"><FiUser aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />{audit.auditor_name || "Not provided"}</span>
              </div>
              <div className="avm-info">
                <span className="avm-info-label">Assignment Status</span>
                <span className={`avm-status avm-status--${statusClass}`}><FiCheckCircle aria-hidden="true" />{status.replace(/_/g, " ")}</span>
              </div>
              <div className="avm-info">
                <span className="avm-info-label">Application Website</span>
                <span className="avm-info-value">
                  {safeUrl ? <a className="avm-link" href={safeUrl} target="_blank" rel="noopener noreferrer">Open website <FiExternalLink aria-hidden="true" /></a>
                    : audit.url || "Not provided"}
                </span>
              </div>
            </div>

            <div className="avm-toolbar">
              <div className="avm-toolbar-left">
                <h3 className="avm-section-label" style={{ margin: 0 }}><FiLayers aria-hidden="true" /> Checklist Domains</h3>
                <span className="avm-count">{domains.length} domains · {totalChecklists} checklists · {totalEvidence} evidence items</span>
              </div>
              <div className="avm-actions">
                <button className="avm-button" type="button" onClick={() => setOpenChecklists(new Set(allKeys))}>Expand all</button>
                <button className="avm-button" type="button" onClick={() => { setOpenChecklists(new Set()); setSearch(""); }}>Collapse all</button>
              </div>
            </div>
            <label className="avm-search" style={{ marginBottom: 16 }}>
              <FiSearch aria-hidden="true" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search domains, clauses or evidence..." aria-label="Search checklist" />
            </label>

            <div className="avm-domains">
              {filteredGroups.length === 0 ? (
                <div className="avm-empty"><FiAlertCircle aria-hidden="true" />{domains.length ? "No matching checklist items." : "No checklist domains are available for this application."}</div>
              ) : filteredGroups.map(({ domain, domainIndex, checklists }) => (
                <section className="avm-domain" key={domain?.domain_id ?? domainIndex}>
                  <div className="avm-domain-heading">
                    <h4 className="avm-domain-name">{domainIndex + 1}. {domain?.domain_name || `Domain ${domainIndex + 1}`}</h4>
                    <span className="avm-domain-badge">{checklists.length} {checklists.length === 1 ? "checklist" : "checklists"}</span>
                  </div>
                  <div className="avm-checklists">
                    {checklists.length === 0 ? <p className="avm-note">No checklists linked to this domain.</p> : checklists.map(({ checklist, checklistIndex, key }) => {
                      const evidenceItems = Array.isArray(checklist?.evidence) ? checklist.evidence : [];
                      const expanded = isOpen(key);
                      return (
                        <div className="avm-checklist" key={key}>
                          <button className="avm-checklist-trigger" type="button" aria-expanded={expanded} aria-controls={`avm-evidence-${key}`} onClick={() => toggleChecklist(key)}>
                            <span className="avm-checklist-chevron">{expanded ? <FiChevronDown /> : <FiChevronRight />}</span>
                            <span className="avm-checklist-text">
                              <span className="avm-checklist-clause">{domainIndex + 1}.{checklistIndex + 1} {checklist?.clause || "Checklist item"}</span>
                              <span className="avm-checklist-meta">Version: {checklist?.version ?? "Not specified"}</span>
                            </span>
                            <span className="avm-evidence-count">{evidenceItems.length} evidence</span>
                          </button>
                          {expanded && (
                            <div className="avm-evidence-list" id={`avm-evidence-${key}`}>
                              {evidenceItems.length === 0 ? <p className="avm-note">No evidence requirements recorded for this checklist.</p> : evidenceItems.map((evidence, evidenceIndex) => {
                                const severity = String(evidence?.severity || "unspecified").toLowerCase();
                                return (
                                  <div className="avm-evidence" key={evidence?.mapping_id ?? evidenceIndex}>
                                    <div className="avm-evidence-head">
                                      <p className="avm-evidence-name">{domainIndex + 1}.{checklistIndex + 1}.{evidenceIndex + 1} {evidence?.name || "Evidence requirement"}</p>
                                      <span className={`avm-severity avm-severity--${severity}`}>
                                        {severity === "high" && <FiAlertCircle aria-hidden="true" />}{severity}
                                      </span>
                                    </div>
                                    <div className="avm-evidence-type">Field type: {evidence?.field_type || "Not specified"}</div>
                                    <EvidencePreview evidence={evidence} />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <footer className="avm-footer">
            <span>Read-only checklist preview. Responses are not saved in this window.</span>
            <button className="avm-button avm-button--primary" type="button" onClick={onClose}>Close details</button>
          </footer>
        </section>
      </div>
    </>,
    document.body
  );
}
