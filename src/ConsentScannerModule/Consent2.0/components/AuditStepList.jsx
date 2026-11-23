import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import AuditStepDetails from "./AuditStepDetails";
import StatusBadge from "./StatusBadge";

const normalizeStepId = (step) =>
    String(step?.step_id || step?.step || "").trim().toUpperCase();

const normalizeComplianceStatus = (status) =>
    String(status || "").trim().toUpperCase();

const getStepNumber = (stepId, index) => {
    const match = String(stepId || "").match(/STEP-(\d+)/i);
    return match ? match[1] : String(index + 1).padStart(2, "0");
};

const getStepTitle = (step, stepNumber) =>
    step?.title ||
    step?.name ||
    `Audit Step ${stepNumber}`;

const AuditStepList = ({ steps = [] }) => {
    const [openSteps, setOpenSteps] = useState([]);

    /*
     * Reset the initially-open step whenever a new result set arrives.
     * This is safer than initializing state from props only once.
     */
    useEffect(() => {
        const firstStepId = normalizeStepId(steps[0]);

        setOpenSteps(firstStepId ? [firstStepId] : []);
    }, [steps]);

    const toggleStep = (stepId) => {
        if (!stepId) {
            return;
        }

        setOpenSteps((current) =>
            current.includes(stepId)
                ? current.filter((id) => id !== stepId)
                : [...current, stepId]
        );
    };

    if (!Array.isArray(steps) || steps.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-700">
                    No audit steps available
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    No completed audit step results were returned.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {steps.map((step, index) => {
                const stepId =
                    normalizeStepId(step) || `AUDIT-STEP-${index + 1}`;

                const isOpen = openSteps.includes(stepId);
                const stepNumber = getStepNumber(stepId, index);
                const title = getStepTitle(step, stepNumber);

                /*
                 * At this point the parent has already normalized the API
                 * response:
                 *
                 * step.status           -> compliance result (PASS/FAIL/REVIEW)
                 * step.execution_status -> crawler execution status
                 *
                 * Therefore StatusBadge must receive step.status here.
                 */
                const complianceStatus =
                    normalizeComplianceStatus(step?.status);

                return (
                    <div
                        key={stepId}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                    >
                        {/* STEP HEADER */}
                        <button
                            type="button"
                            onClick={() => toggleStep(stepId)}
                            aria-expanded={isOpen}
                            aria-controls={`${stepId}-details`}
                            className="
                                flex
                                w-full
                                items-center
                                gap-4
                                px-5
                                py-5
                                text-left
                                transition-colors
                                hover:bg-slate-50
                                focus:outline-none
                                focus:ring-2
                                focus:ring-inset
                                focus:ring-[#075EB5]/30
                            "
                        >
                            {/* Step Number */}
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-blue-100
                                    bg-blue-50
                                    text-xs
                                    font-semibold
                                    text-[#075EB5]
                                "
                            >
                                {stepNumber}
                            </div>

                            {/* Title */}
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    {stepId}
                                </p>

                                <h3 className="mt-1 text-sm font-semibold text-[#14213D]">
                                    {title}
                                </h3>
                            </div>

                            {/* Compliance Status */}
                            <div className="shrink-0">
                                <StatusBadge status={complianceStatus} />
                            </div>

                            {/* Chevron */}
                            <ChevronDown
                                className={`
                                    h-4
                                    w-4
                                    shrink-0
                                    text-slate-500
                                    transition-transform
                                    duration-200
                                    ${isOpen ? "rotate-180" : ""}
                                `}
                            />
                        </button>

                        {/* STEP CONTENT */}
                        {isOpen && (
                            <div
                                id={`${stepId}-details`}
                                className="border-t border-slate-200 bg-slate-50/60 p-5"
                            >
                                <AuditStepDetails step={step} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AuditStepList;
