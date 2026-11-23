
import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    ClipboardList,
} from "lucide-react";

import ChecklistResponseCard from "./ChecklistResponseCard";
import DomainToolsSection from "./DomainToolsSection";
import { DOMAIN_TOOL_CONFIG } from "../config/domainToolConfig";

export default function DomainAccordion({
    domain,
    responses,
    savedResponses,
    onChange,
    onSave,
    onClear,
    isDirty,
    savingId,
    audit,
    auditId,
    defaultOpen = false,
}) {
    const [open, setOpen] = useState(defaultOpen);

    const checklists = domain.checklists || [];
    const total = checklists.length;

    const completed = checklists.filter((item) =>
        Boolean(savedResponses[item.checklist_id]?.status)
    ).length;

    const percentage = total
        ? Math.round((completed / total) * 100)
        : 0;

    // Match automated tools using the backend domain ID.
    const domainId = String(domain.domain_id);
    const domainTools = DOMAIN_TOOL_CONFIG[domainId] || [];

    // Get actual checklist codes from backend.
    const checklistCodes = checklists
        .map((item) => String(item.code || "").trim())
        .filter(Boolean);

    const firstCode = checklistCodes[0] || "";
    const lastCode = checklistCodes[checklistCodes.length - 1] || "";

    // Extract alphabetical prefix from the actual code.
    // Example: L1 -> L, AB1 -> AB.
    const codePrefix = firstCode.match(/^[A-Za-z]+/)?.[0] || "";

    // Actual heading range from backend codes.
    const headingRange =
        firstCode && lastCode
            ? `${firstCode}–${lastCode}`
            : "";

    return (
        <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

            {/* DOMAIN HEADER */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                className="w-full p-5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-[-2px] md:p-6"
            >
                <div className="flex items-start gap-3">

                    {/* Domain Icon */}
                    <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-800 ring-1 ring-blue-100">
                        <ClipboardList size={21} />
                    </div>

                    <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between gap-3">

                            {/* Domain Name and Actual Code */}
                            <div className="flex min-w-0 flex-wrap items-center gap-2">

                                {codePrefix && (
                                    <span className="shrink-0 text-base font-bold text-blue-700 md:text-lg">
                                        {codePrefix}.
                                    </span>
                                )}

                                <h3 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">
                                    {domain.domain_name}
                                </h3>

                                {headingRange && (
                                    <span className="shrink-0 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                        {headingRange}
                                    </span>
                                )}

                            </div>

                            {/* Accordion Icon */}
                            {open ? (
                                <ChevronUp
                                    size={19}
                                    className="shrink-0 text-slate-500"
                                />
                            ) : (
                                <ChevronDown
                                    size={19}
                                    className="shrink-0 text-slate-500"
                                />
                            )}

                        </div>

                        {/* Saved Responses */}
                        <p className="mt-1 text-sm text-slate-500">
                            {completed} of {total} saved responses
                        </p>

                        {/* DOMAIN PROGRESS */}
                        <div className="mt-4 max-w-md">

                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    Domain progress
                                </span>

                                <span className="font-medium text-blue-700">
                                    {percentage}%
                                </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-blue-700 transition-all duration-300"
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>

                        </div>

                    </div>

                </div>
            </button>

            {/* DOMAIN CONTENT */}
            {open && (
                <div className="space-y-5 border-t border-slate-200 bg-slate-50/50 p-3 md:p-5">

                    {/* AUTOMATED TOOLS */}
                    <DomainToolsSection
                        tools={domainTools}
                        auditId={auditId}
                        audit={audit}
                    />

                    {/* CHECKLIST ITEMS */}
                    <div className="space-y-4">

                        {checklists.map((item) => {
                            const id = item.checklist_id;

                            const response = responses[id] || {
                                status: "",
                                comments: "",
                                existingEvidence: [],
                                newEvidence: [],
                            };

                            return (
                                <ChecklistResponseCard
                                    key={id}
                                    item={item}
                                    response={response}
                                    onChange={onChange}
                                    onSave={onSave}
                                    onClear={onClear}
                                    saving={savingId === id}
                                    isSaved={Boolean(
                                        savedResponses[id]?.status
                                    )}
                                    isDirty={isDirty(id)}
                                />
                            );
                        })}

                    </div>

                </div>
            )}

        </section>
    );
}
