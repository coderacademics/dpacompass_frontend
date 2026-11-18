import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Save,
    RotateCcw,
    CheckCircle2,
    Clock
} from "lucide-react";

import EvidenceUploader from "./EvidenceUploader";
import { AUDIT_STATUSES } from "../utils/auditorChecklistUtils";

export default function ChecklistResponseCard({
    item,
    response,
    onChange,
    onSave,
    onClear,
    saving = false,
    isSaved = false,
    isDirty = false
}) {
    const [open, setOpen] = useState(true);

    const checklistId = item.checklist_id;

    const updateField = (field, value) => {
        onChange(checklistId, field, value);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-[0_1px_5px_rgba(15,23,42,0.025)]">

            {/* CHECKLIST HEADER */}

            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="w-full flex items-center justify-between
                    gap-3 p-4 text-left hover:bg-slate-100"
            >
                <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                        <span className="text-base font-semibold text-slate-900">
                            {item.code || item.clause}
                        </span>

                        {isSaved && !isDirty && (
                            <span className="text-xs text-emerald-700
                                flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                Saved
                            </span>
                        )}

                        {isDirty && (
                            <span className="text-xs text-amber-700
                                flex items-center gap-1">
                                <Clock size={13} />
                                Unsaved changes
                            </span>
                        )}

                    </div>

                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Version: {item.version || "1.0"}
                    </p>

                </div>

                {open
                    ? <ChevronUp size={19} className="text-slate-500" />
                    : <ChevronDown size={19} className="text-slate-500" />
                }
            </button>

            {open && (
                <div className="border-t border-slate-200 p-4 md:p-5
                    space-y-5">

                    {/* DESCRIPTION */}

                    {item.description && (
                        <div>
                            <h4 className="text-xs font-bold tracking-wider text-blue-800 uppercase mb-2">
                                Compliance Requirement
                            </h4>

                            <p className="text-sm md:text-base text-slate-700 leading-7 whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>
                    )}

                    {/* STATUS */}

                    <div>
                        <label className="block text-sm font-medium
                            text-slate-700 mb-2">
                            Compliance Status
                            <span className="text-red-700 ml-1">*</span>
                        </label>

                        <select
                            value={response.status || ""}
                            onChange={e => updateField("status", e.target.value)}
                            disabled={saving}
                            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-3 text-sm md:text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        >
                            <option value="">Select status</option>

                            {AUDIT_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* COMMENTS */}

                    <div>
                        <label className="block text-sm font-medium
                            text-slate-700 mb-2">
                            Auditor Comments
                        </label>

                        <textarea
                            value={response.comments || ""}
                            onChange={e =>
                                updateField("comments", e.target.value)
                            }
                            disabled={saving}
                            rows={4}
                            placeholder="Enter your observations, findings and recommendations..."
                            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-3 text-sm md:text-base text-slate-900 placeholder-slate-400 outline-none resize-y focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                    </div>

                    {/* EVIDENCE UPLOADER */}

                    <EvidenceUploader
                        existingEvidence={response.existingEvidence || []}
                        newEvidence={response.newEvidence || []}
                        onChange={files =>
                            updateField("newEvidence", files)
                        }
                        disabled={saving}
                    />

                    {/* ACTIONS */}

                    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">

                        <button
                            type="button"
                            onClick={() => onClear(item)}
                            disabled={saving || !isDirty}
                            className="flex items-center gap-2 px-4 py-2
                                rounded-lg border border-slate-300
                                text-slate-700 hover:bg-slate-100
                                disabled:opacity-40"
                        >
                            <RotateCcw size={15} />
                            Clear Row
                        </button>

                        <button
                            type="button"
                            onClick={() => onSave(item)}
                            disabled={saving || !isDirty}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Save size={15} />
                            {saving ? "Saving..." : "Save Response"}
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}
