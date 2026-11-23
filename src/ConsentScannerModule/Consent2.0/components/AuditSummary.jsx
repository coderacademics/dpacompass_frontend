import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ListChecks,
} from "lucide-react";

const AuditSummary = ({ steps = [], summary = null }) => {
  /*
   * Prefer the summary supplied by the backend/UI-step result.
   * If it is not available, calculate basic counts from the
   * already processed UI steps.
   */

  const totalSteps =
    summary?.total_steps ?? steps.length;

  const compliant =
    summary?.compliant ??
    steps.filter(
      (step) => normalizeStatus(step.status) === "compliant"
    ).length;

  const partial =
    summary?.partial ??
    steps.filter(
      (step) => normalizeStatus(step.status) === "partial"
    ).length;

  const nonCompliant =
    summary?.non_compliant ??
    steps.filter(
      (step) =>
        normalizeStatus(step.status) === "non_compliant"
    ).length;

  return (
    <section>
      {/* Header */}
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#075EB5]">
          Audit Overview
        </p>

        <h2 className="mt-1 text-base font-semibold text-[#14213D]">
          Assessment Summary
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Overall status of the executed DPDP audit requirements.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={ListChecks}
          label="Total Steps"
          value={totalSteps}
          description="Evaluated"
          iconClass="text-[#075EB5]"
          iconBg="bg-blue-50 border-blue-100"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Compliant"
          value={compliant}
          description="Requirements met"
          iconClass="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Partial"
          value={partial}
          description="Needs attention"
          iconClass="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
        />

        <SummaryCard
          icon={XCircle}
          label="Non-Compliant"
          value={nonCompliant}
          description="Requirements not met"
          iconClass="text-red-600"
          iconBg="bg-red-50 border-red-100"
        />
      </div>
    </section>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  iconBg,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#14213D]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`
            flex h-9 w-9
            items-center justify-center
            rounded-lg border
            ${iconBg}
          `}
        >
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (status) => {
  if (!status) {
    return "pending";
  }

  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

export default AuditSummary;
