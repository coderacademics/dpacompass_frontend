
import React from "react";
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    XCircle,
    FileText,
    Database,
    ShieldCheck,
    Info,
    ChevronRight,
} from "lucide-react";

/* -------------------------------------------------------
   COMMON HELPERS
------------------------------------------------------- */

const formatLabel = (value = "") => {
    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusConfig = (status = "") => {
    const normalized = String(status).toUpperCase();

    if (
        normalized.includes("COMPLETE") ||
        normalized.includes("PASS") ||
        normalized.includes("FOUND") ||
        normalized.includes("SUCCESS")
    ) {
        return {
            label: formatLabel(status),
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: CheckCircle2,
        };
    }

    if (
        normalized.includes("FAIL") ||
        normalized.includes("ERROR") ||
        normalized.includes("NOT_FOUND")
    ) {
        return {
            label: formatLabel(status),
            className: "bg-red-50 text-red-700 border-red-200",
            icon: XCircle,
        };
    }

    if (
        normalized.includes("RUNNING") ||
        normalized.includes("PENDING") ||
        normalized.includes("QUEUED")
    ) {
        return {
            label: formatLabel(status),
            className: "bg-amber-50 text-amber-700 border-amber-200",
            icon: Clock,
        };
    }

    return {
        label: formatLabel(status || "Information"),
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Info,
    };
};

const isPrimitive = (value) => {
    return (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    );
};

const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
        return "Not available";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

/* -------------------------------------------------------
   STATUS BADGE
------------------------------------------------------- */

function StatusBadge({ status }) {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
        >
            <Icon size={13} />
            {config.label}
        </span>
    );
}

/* -------------------------------------------------------
   VALUE CARD
------------------------------------------------------- */

function ValueCard({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                {formatLabel(label)}
            </p>

            <p className="break-words text-sm font-semibold text-slate-800">
                {displayValue(value)}
            </p>
        </div>
    );
}

/* -------------------------------------------------------
   DYNAMIC OBJECT RENDERER

   Handles:
   - Nested objects
   - Arrays
   - Strings
   - Numbers
   - Boolean values
------------------------------------------------------- */

function DynamicValue({ label, value, depth = 0 }) {
    if (value === null || value === undefined) {
        return null;
    }

    if (isPrimitive(value)) {
        return (
            <ValueCard
                label={label}
                value={value}
            />
        );
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return (
                <div className="rounded-xl border border-dashed border-slate-200 p-4">
                    <p className="text-sm font-medium text-slate-700">
                        {formatLabel(label)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        No records available
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800">
                    {formatLabel(label)}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                        ({value.length})
                    </span>
                </h4>

                {value.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                        <p className="mb-3 text-xs font-semibold text-slate-500">
                            Record {index + 1}
                        </p>

                        {isPrimitive(item) ? (
                            <p className="break-words text-sm text-slate-700">
                                {displayValue(item)}
                            </p>
                        ) : (
                            <DynamicObject
                                data={item}
                                depth={depth + 1}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    }

    if (typeof value === "object") {
        return (
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800">
                    {formatLabel(label)}
                </h4>

                <DynamicObject
                    data={value}
                    depth={depth + 1}
                />
            </div>
        );
    }

    return null;
}

function DynamicObject({ data, depth = 0 }) {
    if (!data || typeof data !== "object") {
        return null;
    }

    const entries = Object.entries(data).filter(
        ([key]) =>
            ![
                "success",
                "created_at",
                "updated_at",
                "audit_id",
                "step_id",
            ].includes(key)
    );

    if (entries.length === 0) {
        return (
            <p className="text-sm text-slate-400">
                No additional details available.
            </p>
        );
    }

    return (
        <div
            className={`grid grid-cols-1 gap-3 ${
                depth === 0 ? "md:grid-cols-2" : ""
            }`}
        >
            {entries.map(([key, value]) => (
                <DynamicValue
                    key={key}
                    label={key}
                    value={value}
                    depth={depth}
                />
            ))}
        </div>
    );
}

/* -------------------------------------------------------
   COMMON STEP RESULT VIEW
------------------------------------------------------- */

function StepResultRenderer({
    title,
    description,
    icon: Icon = ShieldCheck,
    response,
}) {
    const stepResult = response?.result ?? response ?? {};

    const status =
        response?.status ||
        stepResult?.status ||
        "COMPLETED";

    const summary = stepResult?.summary;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Icon size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {title}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {description}
                            </p>
                        </div>
                    </div>

                    <StatusBadge status={status} />
                </div>
            </div>

            {/* Summary */}
            {summary &&
                typeof summary === "object" &&
                !Array.isArray(summary) && (
                    <section>
                        <h3 className="mb-3 text-sm font-bold text-slate-800">
                            Assessment Summary
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(summary).map(([key, value]) => (
                                <ValueCard
                                    key={key}
                                    label={key}
                                    value={value}
                                />
                            ))}
                        </div>
                    </section>
                )}

            {/* Detailed response */}
            <section>
                <div className="mb-3 flex items-center gap-2">
                    <FileText size={17} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                        Detailed Assessment
                    </h3>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <DynamicObject data={stepResult} />
                </div>
            </section>

            {/* Timestamps */}
            {(response?.created_at || response?.updated_at) && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
                    {response?.created_at && (
                        <span>
                            Created: {response.created_at}
                        </span>
                    )}

                    {response?.updated_at && (
                        <span>
                            Updated: {response.updated_at}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------
   STEP 04
------------------------------------------------------- */

export function Step04FormNoticeEvidence({ response }) {
    return (
        <StepResultRenderer
            title="Verify Collection Form and Notice Evidence"
            description="Assessment of collection forms and the availability of associated privacy notice evidence."
            icon={FileText}
            response={response}
        />
    );
}

/* -------------------------------------------------------
   STEP 05
------------------------------------------------------- */

export function Step05PurposeAssessment({ response }) {
    return (
        <StepResultRenderer
            title="Assess Processing Purpose and Consent Dependency"
            description="Assessment of processing purposes and whether the identified data collection depends on consent."
            icon={ShieldCheck}
            response={response}
        />
    );
}

/* -------------------------------------------------------
   STEP 07
------------------------------------------------------- */

export function Step07OptionalConsent({ response }) {
    return (
        <StepResultRenderer
            title="Verify Optional Consent Controls"
            description="Assessment of optional consent choices and the controls available to users."
            icon={CheckCircle2}
            response={response}
        />
    );
}

/* -------------------------------------------------------
   STEP 11
------------------------------------------------------- */

export function Step11PreferenceManagement({ response }) {
    return (
        <StepResultRenderer
            title="Assess Preference Management Interface"
            description="Assessment of the interface provided for managing user preferences."
            icon={ShieldCheck}
            response={response}
        />
    );
}

/* -------------------------------------------------------
   STEP 13
------------------------------------------------------- */

export function Step13CookieStorage({ response }) {
    return (
        <StepResultRenderer
            title="Inspect Cookies and Browser Storage"
            description="Assessment of cookies and browser storage mechanisms identified during the scan."
            icon={Database}
            response={response}
        />
    );
}

export default StepResultRenderer;
