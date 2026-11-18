import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    ClipboardList
} from "lucide-react";

import ChecklistResponseCard from "./ChecklistResponseCard";

export default function DomainAccordion({
    domain,
    responses,
    savedResponses,
    onChange,
    onSave,
    onClear,
    isDirty,
    savingId,
    defaultOpen = false
}) {
    const [open, setOpen] = useState(defaultOpen);

    const checklists = domain.checklists || [];
    const total = checklists.length;

    const completed = checklists.filter(item =>
        Boolean(savedResponses[item.checklist_id]?.status)
    ).length;

    const percentage = total
        ? Math.round((completed / total) * 100)
        : 0;

    return (
        <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

            {/* DOMAIN HEADER */}

            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="w-full p-5 md:p-6 text-left hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-[-2px]"
            >
                <div className="flex items-start gap-3">

                    <div className="p-3 rounded-xl bg-blue-50 text-blue-800 shrink-0 ring-1 ring-blue-100">
                        <ClipboardList size={21} />
                    </div>

                    <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-3">

                            <h3 className="text-base md:text-lg font-semibold tracking-tight text-slate-900">
                                {domain.domain_name}
                            </h3>

                            {open
                                ? <ChevronUp size={19} className="text-slate-500 shrink-0" />
                                : <ChevronDown size={19} className="text-slate-500 shrink-0" />
                            }

                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                            {completed} of {total} saved responses
                        </p>

                        {/* LEFT-ALIGNED DOMAIN PROGRESS */}

                        <div className="mt-4 max-w-md">

                            <div className="flex items-center justify-between
                                text-xs mb-2">
                                <span className="text-slate-500">
                                    Domain progress
                                </span>

                                <span className="text-blue-700 font-medium">
                                    {percentage}%
                                </span>
                            </div>

                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-700
                                        rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                        </div>

                    </div>

                </div>
            </button>

            {/* CHECKLIST ITEMS */}

            {open && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-3 md:p-5 space-y-4">

                    {checklists.map(item => {
                        const id = item.checklist_id;

                        const response = responses[id] || {
                            status: "",
                            comments: "",
                            existingEvidence: [],
                            newEvidence: []
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
            )}

        </section>
    );
}
