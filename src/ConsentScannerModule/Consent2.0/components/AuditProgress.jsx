import React from "react";
import {
    CheckCircle2,
    Circle,
    FileText,
    Loader2,
    Clock3,
    BarChart3,
} from "lucide-react";

/* =========================================================
   AUDIT STEP DEFINITIONS
   These are UI descriptions only. Status comes from the API.
========================================================= */

const AUDIT_STEPS = [
    {
        id: "STEP-01",
        title: "Identifying Collection Point",
        description:
            "Scanning the website to identify personal-data collection points.",
    },
    {
        id: "STEP-02",
        title: "Verifying Notice",
        description:
            "Checking for an appropriate notice before or at the point of data collection.",
    },
    {
        id: "STEP-04",
        title: "Checking Notice Visibility",
        description:
            "Verifying that the applicable privacy notice is visible and accessible.",
    },
    {
        id: "STEP-05",
        title: "Identifying Consent-Dependent Processing",
        description:
            "Analyzing processing activities that depend on user consent.",
    },
    {
        id: "STEP-07",
        title: "Checking Optional Consent",
        description:
            "Ensuring optional consent controls are not pre-selected.",
    },
    {
        id: "STEP-11",
        title: "Managing Preferences",
        description:
            "Verifying that users can manage and change their consent preferences.",
    },
    {
        id: "STEP-13",
        title: "Generating Audit Evidence",
        description:
            "Collecting and finalizing evidence associated with the audit execution.",
    },
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (status) =>
    String(status || "").trim().toUpperCase();

const normalizeStepId = (stepId) =>
    String(stepId || "").trim().toUpperCase();

const getStepDefinition = (stepId) => {
    const normalizedId = normalizeStepId(stepId);

    return (
        AUDIT_STEPS.find((step) => step.id === normalizedId) || {
            id: normalizedId || "UNKNOWN",
            title: normalizedId || "Audit Step",
            description: "Processing this audit requirement.",
        }
    );
};

/*
 * The backend is the source of truth.
 *
 * If a step is returned by the API, its execution status is used directly.
 * Missing known steps are shown as queued so the UI never invents a
 * completed/running state.
 */
const buildDisplaySteps = (steps) => {
    const apiSteps = Array.isArray(steps) ? steps : [];

    const apiStepMap = new Map(
        apiSteps.map((step) => [
            normalizeStepId(step?.step_id),
            step,
        ])
    );

    const knownSteps = AUDIT_STEPS.map((definition) => {
        const apiStep = apiStepMap.get(definition.id);

        return {
            ...definition,
            apiStep,
            status: normalizeStatus(apiStep?.status) || "QUEUED",
        };
    });

    // Preserve any additional backend steps that are not yet defined in the UI.
    const additionalSteps = apiSteps
        .filter((step) => {
            const id = normalizeStepId(step?.step_id);
            return id && !AUDIT_STEPS.some((known) => known.id === id);
        })
        .map((step) => {
            const definition = getStepDefinition(step?.step_id);

            return {
                ...definition,
                apiStep: step,
                status: normalizeStatus(step?.status) || "QUEUED",
            };
        });

    return [...knownSteps, ...additionalSteps];
};

const getProgressFromSteps = (steps) => {
    const apiSteps = Array.isArray(steps) ? steps : [];

    if (!apiSteps.length) {
        return 0;
    }

    const completed = apiSteps.filter(
        (step) => normalizeStatus(step?.status) === "COMPLETED"
    ).length;

    return Math.round((completed / apiSteps.length) * 100);
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AuditProgress = ({
    progress = 0,
    currentStep = "",
    status = "RUNNING",
    steps = [],
}) => {
    const safeProgress = Math.min(
        Math.max(Number(progress) || 0, 0),
        100
    );

    const normalizedAuditStatus = normalizeStatus(status);

    const displaySteps = buildDisplaySteps(steps);

    /*
     * Prefer the progress calculated by the parent from the backend
     * response. If it has not received any progress yet, calculate a
     * fallback from the actual step statuses.
     */
    const calculatedProgress =
        Array.isArray(steps) && steps.length > 0
            ? getProgressFromSteps(steps)
            : safeProgress;

    const overallProgress =
        normalizedAuditStatus === "COMPLETED"
            ? 100
            : Math.min(
                  Math.max(
                      Number.isFinite(safeProgress)
                          ? safeProgress
                          : calculatedProgress,
                      0
                  ),
                  100
              );

    const normalizedCurrentStep = normalizeStepId(currentStep);

    const completedCount = displaySteps.filter(
        (step) => step.status === "COMPLETED"
    ).length;

    const runningStep =
        displaySteps.find((step) => step.status === "RUNNING") ||
        displaySteps.find(
            (step) => step.id === normalizedCurrentStep
        );

    const isComplete =
        normalizedAuditStatus === "COMPLETED" ||
        overallProgress >= 100;

    const isFailed = ["FAILED", "ERROR", "CANCELLED"].includes(
        normalizedAuditStatus
    );

    const currentIndex = runningStep
        ? displaySteps.findIndex(
              (step) => step.id === runningStep.id
          )
        : -1;

    const statusLabel = isComplete
        ? "Audit completed"
        : isFailed
        ? "Audit failed"
        : runningStep
        ? `Processing ${runningStep.id}`
        : "Audit in progress...";

    const statusDescription = isComplete
        ? "All audit requirements have been processed."
        : isFailed
        ? "The audit engine reported an execution failure."
        : runningStep
        ? `${completedCount} of ${displaySteps.length} steps completed`
        : "Waiting for the audit engine to report the next activity.";

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* HEADER */}
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50">
                            <FileText className="h-6 w-6 text-[#075EB5]" />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-[#14213D]">
                                Audit Progress
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Live activities reported by the audit engine
                            </p>
                        </div>
                    </div>

                    <div className="w-fit rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 sm:text-right">
                        <div className="flex items-center gap-2 sm:justify-end">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                    isComplete
                                        ? "bg-emerald-400"
                                        : isFailed
                                        ? "bg-red-400"
                                        : "animate-pulse bg-[#075EB5]"
                                }`}
                            />

                            <span
                                className={`text-sm font-semibold ${
                                    isComplete
                                        ? "text-emerald-700"
                                        : isFailed
                                        ? "text-red-700"
                                        : "text-[#075EB5]"
                                }`}
                            >
                                {statusLabel}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {statusDescription}
                        </p>
                    </div>
                </div>

                {/* AUDIT REQUIREMENTS */}
                <div className="px-6 py-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-[#075EB5]" />

                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                Audit Requirements
                            </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-slate-500">
                                {completedCount} of {displaySteps.length} completed
                            </span>

                            {runningStep && (
                                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-medium text-[#075EB5]">
                                    Step {currentIndex + 1} of{" "}
                                    {displaySteps.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute bottom-5 left-5 top-5 w-px bg-slate-100" />

                        <div className="space-y-4">
                            {displaySteps.map((step) => (
                                <ProgressItem
                                    key={step.id}
                                    id={step.id}
                                    title={step.title}
                                    description={step.description}
                                    status={step.status}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col gap-5 border-t border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <Clock3 className="h-5 w-5 text-slate-500" />

                        <span>
                            {isComplete
                                ? "Audit execution completed"
                                : isFailed
                                ? "Audit execution stopped"
                                : "Audit engine is processing the configured requirements"}
                        </span>
                    </div>

                    <div className="flex w-full items-center gap-4 lg:max-w-xl">
                        <BarChart3 className="h-5 w-5 shrink-0 text-slate-500" />

                        <span className="whitespace-nowrap text-sm text-slate-500">
                            Overall Progress
                        </span>

                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    isFailed
                                        ? "bg-red-500"
                                        : "bg-[#075EB5]"
                                }`}
                                style={{
                                    width: `${Math.round(
                                        overallProgress
                                    )}%`,
                                }}
                            />
                        </div>

                        <span className="w-12 text-right text-sm font-semibold text-slate-700">
                            {Math.round(overallProgress)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   PROGRESS ITEM
========================================================= */

const ProgressItem = ({
    id,
    title,
    description,
    status,
}) => {
    const normalizedStatus = normalizeStatus(status);

    const completed = normalizedStatus === "COMPLETED";
    const running = normalizedStatus === "RUNNING";
    const queued = normalizedStatus === "QUEUED";

    const failed = ["FAILED", "ERROR", "CANCELLED"].includes(
        normalizedStatus
    );

    return (
        <div className="relative flex gap-5">
            {/* TIMELINE NODE */}
            <div className="relative z-10 shrink-0">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                        completed
                            ? "border-emerald-500 bg-emerald-50"
                            : running
                            ? "border-[#075EB5] bg-blue-50"
                            : failed
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 bg-slate-100"
                    }`}
                >
                    {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    ) : running ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[#075EB5]" />
                    ) : failed ? (
                        <Circle className="h-4 w-4 text-red-700" />
                    ) : (
                        <Circle className="h-4 w-4 text-slate-500" />
                    )}
                </div>
            </div>

            {/* CONTENT CARD */}
            <div
                className={`min-w-0 flex-1 rounded-xl border px-5 py-5 transition-all duration-300 ${
                    completed
                        ? "border-slate-200 bg-white"
                        : running
                        ? "border-blue-200 bg-blue-50 shadow-sm shadow-blue-100"
                        : failed
                        ? "border-red-200 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                }`}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <p
                            className={`text-xs font-semibold uppercase tracking-wider ${
                                completed
                                    ? "text-emerald-700/80"
                                    : running
                                    ? "text-[#075EB5]"
                                    : failed
                                    ? "text-red-700"
                                    : "text-slate-500"
                            }`}
                        >
                            {id}
                        </p>

                        <h3
                            className={`mt-1 text-lg font-semibold ${
                                queued
                                    ? "text-slate-500"
                                    : "text-[#14213D]"
                            }`}
                        >
                            {title}
                        </h3>

                        <p
                            className={`mt-1.5 text-sm leading-6 ${
                                queued
                                    ? "text-slate-500"
                                    : "text-slate-500"
                            }`}
                        >
                            {description}
                        </p>

                        {running && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-[#075EB5]">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Processing this audit requirement...
                            </div>
                        )}
                    </div>

                    {/* STATUS */}
                    <div className="shrink-0">
                        {completed && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                            </span>
                        )}

                        {running && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#075EB5]">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                In Progress
                            </span>
                        )}

                        {queued && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                                <Clock3 className="h-4 w-4" />
                                Queued
                            </span>
                        )}

                        {failed && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                                <Circle className="h-4 w-4" />
                                {normalizedStatus === "CANCELLED"
                                    ? "Cancelled"
                                    : "Failed"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditProgress;
