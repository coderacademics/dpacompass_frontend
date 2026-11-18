
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
    // Every checklist question starts collapsed.
    const [open, setOpen] = useState(false);

    const checklistId = item.checklist_id;

    const updateField = (field, value) => {
        onChange(checklistId, field, value);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200">

            {/* CHECKLIST HEADER: CODE + QUESTION */}

            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                className={`w-full flex items-start justify-between gap-4 p-4 md:p-5 text-left transition-colors ${
                    open
                        ? "bg-blue-50/40"
                        : "bg-white hover:bg-slate-50"
                }`}
            >
                <div className="min-w-0 flex-1">

                    {/* CODE AND QUESTION */}
                    <div className="flex items-start gap-2">

                        <span className="shrink-0 text-sm md:text-base font-bold text-blue-800">
                            {item.code || item.clause}.
                        </span>

                        <p className="text-sm md:text-base font-medium leading-7 text-slate-800">
                            {item.description || "No question description available."}
                        </p>

                    </div>

                    {/* VERSION AND SAVE STATUS */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">

                        <span className="text-xs text-slate-500">
                            Version: {item.version || "1.0"}
                        </span>

                        {isSaved && !isDirty && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                                <CheckCircle2 size={13} />
                                Saved
                            </span>
                        )}

                        {isDirty && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                                <Clock size={13} />
                                Unsaved changes
                            </span>
                        )}

                    </div>

                </div>

                {/* EXPAND / COLLAPSE ICON */}
                <span className={`mt-1 shrink-0 rounded-lg p-1.5 transition-colors ${
                    open
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-500"
                }`}>
                    {open
                        ? <ChevronUp size={19} />
                        : <ChevronDown size={19} />
                    }
                </span>

            </button>

            {/* EXPANDED RESPONSE SECTION */}

            {open && (
                <div className="space-y-5 border-t border-slate-200 bg-white p-4 md:p-5">

                    {/* COMPLIANCE STATUS */}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Compliance Status
                            <span className="ml-1 text-red-600">*</span>
                        </label>

                        <select
                            value={response.status || ""}
                            onChange={e => updateField("status", e.target.value)}
                            disabled={saving}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm md:text-base text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        >
                            <option value="">Select status</option>

                            {AUDIT_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* AUDITOR COMMENTS */}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
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
                            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm md:text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
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

                    {/* ACTION BUTTONS */}

                    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">

                        <button
                            type="button"
                            onClick={() => onClear(item)}
                            disabled={saving || !isDirty}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw size={15} />
                            Clear Row
                        </button>

                        <button
                            type="button"
                            onClick={() => onSave(item)}
                            disabled={saving || !isDirty}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
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
