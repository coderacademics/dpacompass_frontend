
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ShieldCheck,
    ScanSearch,
    Globe,
    ChevronRight,
    Check,
    ArrowRight,
    LockKeyhole,
    Layers3,
    Info,
    Clock3,
    RotateCcw,
    Loader2,
    FileCheck,
} from "lucide-react";

// Update this import path if your service file is located elsewhere.
import {
    generatePublicAuditId,
    startSelfCheckConsentScanner,
    startSelfCheckDataBreachScanner,
} from "../utilities/selfCheckApi";

const RESULTS_ROUTE = "/user/self-check/results";

const SCANNERS = [
    {
        id: "consent",
        title: "Consent Management Scanner",
        subtitle: "Consent & Privacy Notice Assessment",
        description:
            "Identify personal data collection points, inspect consent notices, and assess consent-related practices across your application.",
        icon: ShieldCheck,
        color: "blue",
        features: [
            "Privacy notice discovery",
            "Consent collection point detection",
            "Consent notice assessment",
            "Form and field analysis",
        ],
        tag: "Consent Assessment",
    },
    {
        id: "breach",
        title: "PII-in-Transit / Data Breach Scanner",
        subtitle: "Technical Safeguards Assessment",
        description:
            "Inspect your application for potential personal information exposure and identify security weaknesses in data transmission.",
        icon: ScanSearch,
        color: "violet",
        features: [
            "Personal data exposure detection",
            "Sensitive information discovery",
            "Data transmission inspection",
            "Potential security issue identification",
        ],
        tag: "Security Assessment",
    },
];

const COLOR_STYLES = {
    blue: {
        icon: "bg-blue-50 text-blue-600 border-blue-100",
        selected: "border-blue-400 ring-4 ring-blue-50",
        top: "bg-blue-500",
        checkbox: "bg-blue-600 border-blue-600",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        feature: "text-blue-600",
    },
    violet: {
        icon: "bg-violet-50 text-violet-600 border-violet-100",
        selected: "border-violet-400 ring-4 ring-violet-50",
        top: "bg-violet-500",
        checkbox: "bg-violet-600 border-violet-600",
        badge: "bg-violet-50 text-violet-700 border-violet-100",
        feature: "text-violet-600",
    },
};

function ScannerCard({ scanner, selected, onToggle }) {
    const styles = COLOR_STYLES[scanner.color];
    const Icon = scanner.icon;

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                selected
                    ? `${styles.selected} shadow-md`
                    : "border-slate-200 shadow-sm hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            }`}
        >
            <div
                className={`absolute left-0 top-0 h-1 w-full ${
                    selected ? styles.top : "bg-transparent"
                }`}
            />

            <div className="p-5 sm:p-7">
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
                        >
                            <Icon size={23} strokeWidth={1.8} />
                        </div>

                        <div>
                            <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
                            >
                                {scanner.tag}
                            </span>

                            <h3 className="mt-2 text-base font-bold leading-snug text-[#14213D] sm:text-lg">
                                {scanner.title}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                                {scanner.subtitle}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={`Select ${scanner.title}`}
                        aria-pressed={selected}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                            selected
                                ? `${styles.checkbox} text-white`
                                : "border-slate-300 bg-white text-transparent hover:border-slate-400"
                        }`}
                    >
                        <Check size={16} strokeWidth={3} />
                    </button>
                </div>

                <p className="min-h-[60px] text-[13px] leading-6 text-slate-600">
                    {scanner.description}
                </p>

                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        What this scanner checks
                    </p>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {scanner.features.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-start gap-2"
                            >
                                <Check
                                    size={14}
                                    className={`mt-0.5 shrink-0 ${styles.feature}`}
                                />

                                <span className="text-xs leading-5 text-slate-600">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                size={16}
                                className="text-slate-500"
                            />

                            <span className="text-sm font-semibold text-[#14213D]">
                                Scanner Configuration
                            </span>
                        </div>

                        <span
                            className={`text-[10px] font-semibold ${
                                selected
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                            }`}
                        >
                            {selected ? "Selected" : "Not selected"}
                        </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        {selected
                            ? "This scanner will be included in your self-check assessment."
                            : "Select this scanner if you want to include it in your assessment."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onToggle}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        selected
                            ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
                    }`}
                >
                    {selected ? (
                        <>
                            <Check size={16} />
                            Selected for Assessment
                        </>
                    ) : (
                        <>
                            Select Scanner
                            <ArrowRight size={15} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function SelfCheckWorkspace() {
    const navigate = useNavigate();

    const [applicationUrl, setApplicationUrl] = useState("");
    const [selectedScanners, setSelectedScanners] = useState([]);

    const [error, setError] = useState("");
    const [showReview, setShowReview] = useState(false);

    const [isStarting, setIsStarting] = useState(false);
    const [startingMessage, setStartingMessage] = useState("");

    const selectedCount = selectedScanners.length;

    const selectedScannerDetails = useMemo(
        () =>
            SCANNERS.filter((scanner) =>
                selectedScanners.includes(scanner.id)
            ),
        [selectedScanners]
    );

    // --------------------------------------------------
    // Scanner Selection
    // --------------------------------------------------

    const toggleScanner = (scannerId) => {
        if (isStarting) return;

        setSelectedScanners((previous) =>
            previous.includes(scannerId)
                ? previous.filter((id) => id !== scannerId)
                : [...previous, scannerId]
        );

        setError("");
        setShowReview(false);
    };

    // --------------------------------------------------
    // URL Validation
    // --------------------------------------------------

    const validateConfiguration = () => {
        if (!applicationUrl.trim()) {
            return "Please enter your application URL.";
        }

        try {
            const parsedUrl = new URL(applicationUrl.trim());

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                return "Only HTTP and HTTPS application URLs are supported.";
            }
        } catch {
            return "Enter a valid application URL, including https:// or http://.";
        }

        if (selectedCount === 0) {
            return "Please select at least one scanner to continue.";
        }

        return null;
    };

    // --------------------------------------------------
    // Review Configuration
    // --------------------------------------------------

    const handleReview = (e) => {
        e.preventDefault();

        const validationError = validateConfiguration();

        if (validationError) {
            setError(validationError);
            setShowReview(false);
            return;
        }

        setError("");
        setShowReview(true);
    };

    // --------------------------------------------------
    // Get Logged-in DPACOMPASS Username
    // --------------------------------------------------

    const getLoggedInUsername = () => {
        try {
            const user = JSON.parse(
                localStorage.getItem("user") || "{}"
            );
            console.log(user.username);
            
            return (
                user.username ||
                user.dpacompass_username ||
                ""
            );
        } catch {
            return "";
        }
    };

    // --------------------------------------------------
    // Start Assessment
    // --------------------------------------------------

    const handleStartAssessment = async () => {
        if (isStarting) return;

        const validationError = validateConfiguration();

        if (validationError) {
            setError(validationError);
            setShowReview(false);
            return;
        }

        setError("");
        setIsStarting(true);

        try {
            // Step 1: Get logged-in username
            const dpacompassUsername = getLoggedInUsername();

            if (selectedScanners.includes("consent") && !dpacompassUsername) {
                throw new Error(
                    "DPACOMPASS username is missing. Please sign in again."
                );
            }

            // Step 2: Generate one common Public Audit ID
            setStartingMessage("Generating Public Audit ID...");

            const publicAuditId = await generatePublicAuditId();

            if (!publicAuditId) {
                throw new Error("Unable to generate Public Audit ID.");
            }

            // Step 3: Prepare scanner execution
            const normalizedUrl = applicationUrl.trim();

            const scannerTasks = [];
            
            if (selectedScanners.includes("consent")) {
                scannerTasks.push({
                    key: "consent_management",
                    execute: () =>
                        startSelfCheckConsentScanner({
                            url: normalizedUrl,
                            public_audit_id: publicAuditId,
                            dpacompass_username: dpacompassUsername,
                        }),
                });
            }

            if (selectedScanners.includes("breach")) {
                scannerTasks.push({
                    key: "data_breach",
                    execute: () =>
                        startSelfCheckDataBreachScanner({
                            url: normalizedUrl,
                            publicAuditId,
                            dpacompass_username: dpacompassUsername,
                        }),
                });
            }

            // Step 4: Start selected scanners
            setStartingMessage("Starting selected scanners...");

            const scannerResults = await Promise.allSettled(
                scannerTasks.map((task) => task.execute())
            );

            // Step 5: Normalize scanner responses
            const scanners = {
                consent_management: {
                    selected: false,
                    status: "NOT_SELECTED",
                    audit_id: null,
                    public_audit_id: publicAuditId,
                    task_id: null,
                    start_response: null,
                    error: null,
                },

                data_breach: {
                    selected: false,
                    status: "NOT_SELECTED",
                    audit_id: null,
                    public_audit_id: publicAuditId,
                    job_id: null,
                    start_response: null,
                    error: null,
                },
            };

            scannerTasks.forEach((task, index) => {
                const result = scannerResults[index];

                if (result.status === "fulfilled") {
                    const response = result.value || {};

                    scanners[task.key] = {
                        selected: true,
                        status: "RUNNING",
                        audit_id: response.audit_id || null,
                        public_audit_id:
                            response.public_audit_id || publicAuditId,
                        task_id: response.task_id || null,
                        job_id: response.job_id || null,
                        start_response: response,
                        error: null,
                    };
                } else {
                    scanners[task.key] = {
                        ...scanners[task.key],
                        selected: true,
                        status: "START_FAILED",
                        error:
                            result.reason?.message ||
                            "Unable to start this scanner.",
                    };
                }
            });

            // Step 6: Navigate to unified results page
            const navigationState = {
                public_audit_id: publicAuditId,
                url: normalizedUrl,
                scanners,
                selected_scanners: [...selectedScanners],
                started_at: new Date().toISOString(),
            };

            navigate(RESULTS_ROUTE, {
                state: navigationState,
            });
        } catch (err) {
            console.error("Self Check Start Error:", err);

            setError(
                err.message ||
                    "Unable to start the assessment. Please try again."
            );

            setIsStarting(false);
            setStartingMessage("");
        }
    };

    // --------------------------------------------------
    // Reset
    // --------------------------------------------------

    const handleReset = () => {
        if (isStarting) return;

        setApplicationUrl("");
        setSelectedScanners([]);
        setError("");
        setShowReview(false);
        setStartingMessage("");
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="min-h-full bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Workspace</span>
                    <ChevronRight size={14} />

                    <span className="font-semibold text-[#14213D]">
                        Self Check
                    </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />

                    <span className="text-[11px] font-semibold text-blue-700">
                        Auditee Workspace
                    </span>
                </div>
            </div>

            {/* Welcome Banner */}
            <section className="relative mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

                <div className="relative flex flex-col justify-between gap-5 p-6 sm:p-8 lg:flex-row lg:items-center">
                    <div className="max-w-2xl">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                                <ShieldCheck size={23} />
                            </div>

                            <div>
                                <p className="text-xs font-bold tracking-[0.14em] text-[#075EB5]">
                                    DPACOMPASS
                                </p>

                                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    Audit & Compliance Workspace
                                </p>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                            Self Check Assessment
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            Select the assessment tools you want to run against
                            your application. Configure your assessment and
                            initiate your self-assessment from one place.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                            <LockKeyhole size={20} />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-emerald-800">
                                Secure Assessment
                            </p>

                            <p className="mt-1 text-[11px] text-emerald-700">
                                Controlled scanning configuration
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application URL */}
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Globe size={21} />
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-[#14213D]">
                            Application Configuration
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Provide the application details for your assessment.
                        </p>
                    </div>
                </div>

                <label
                    htmlFor="application-url"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Application URL
                    <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                    <Globe
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="application-url"
                        type="url"
                        value={applicationUrl}
                        disabled={isStarting}
                        onChange={(e) => {
                            setApplicationUrl(e.target.value);
                            setError("");
                            setShowReview(false);
                        }}
                        placeholder="https://www.your-application.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-[#14213D] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>

                <div className="mt-3 flex items-start gap-2">
                    <Info
                        size={14}
                        className="mt-0.5 shrink-0 text-blue-500"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                        This URL will be shared across all selected scanners.
                        You only need to enter it once.
                    </p>
                </div>
            </section>

            {/* Scanner Selection */}
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <Layers3 size={17} className="text-blue-600" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            Assessment Tools
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#14213D]">
                        Select Your Scanners
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Choose one or multiple scanners for your assessment.
                    </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <span className="text-xs text-slate-500">
                        Selected tools
                    </span>

                    <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-blue-600 px-1.5 text-xs font-bold text-white">
                        {selectedCount}
                    </span>

                    <span className="text-xs text-slate-400">/ 2</span>
                </div>
            </div>

            {/* Scanner Cards */}
            <form onSubmit={handleReview}>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {SCANNERS.map((scanner) => (
                        <ScannerCard
                            key={scanner.id}
                            scanner={scanner}
                            selected={selectedScanners.includes(scanner.id)}
                            onToggle={() => toggleScanner(scanner.id)}
                        />
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <Info size={17} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Review Summary */}
                {showReview && (
                    <div className="mt-6 animate-[fadeIn_0.3s_ease-out] rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-7">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <FileCheck size={21} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-emerald-900">
                                    Configuration Ready
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-emerald-800">
                                    Verify the application and selected
                                    scanners before starting the assessment.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-emerald-100 bg-white p-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Target Application
                            </p>

                            <p className="break-all text-sm font-semibold text-[#14213D]">
                                {applicationUrl}
                            </p>

                            <div className="my-4 border-t border-slate-100" />

                            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Selected Scanners
                            </p>

                            <div className="space-y-3">
                                {selectedScannerDetails.map((scanner) => {
                                    const Icon = scanner.icon;

                                    return (
                                        <div
                                            key={scanner.id}
                                            className="flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                        COLOR_STYLES[scanner.color].icon
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                </div>

                                                <span className="text-sm font-semibold text-slate-700">
                                                    {scanner.title}
                                                </span>
                                            </div>

                                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                                <Check size={13} />
                                                Selected
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={isStarting}
                                onClick={() => setShowReview(false)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Modify Configuration
                            </button>

                            <button
                                type="button"
                                disabled={isStarting}
                                onClick={handleStartAssessment}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Starting Assessment...
                                    </>
                                ) : (
                                    <>
                                        Start Assessment
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </div>

                        {isStarting && (
                            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                <Loader2
                                    size={15}
                                    className="animate-spin text-blue-600"
                                />

                                <span className="text-xs font-medium text-blue-700">
                                    {startingMessage}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Action Bar */}
                <div className="mt-7 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                            <Clock3 size={19} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#14213D]">
                                Ready to configure your assessment?
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {selectedCount === 0
                                    ? "Select at least one scanner to continue."
                                    : `${selectedCount} scanner${
                                          selectedCount > 1 ? "s" : ""
                                      } selected for assessment.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <button
                            type="button"
                            disabled={isStarting}
                            onClick={handleReset}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RotateCcw size={15} />
                            Reset
                        </button>

                        <button
                            type="submit"
                            disabled={isStarting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Review Configuration
                            <ArrowRight size={17} />
                        </button>
                    </div>
                </div>
            </form>

            {/* Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center text-[11px] text-slate-400">
                <ShieldCheck size={14} />

                <span>DPACOMPASS Self Check Workspace</span>

                <span className="text-slate-300">|</span>

                <span>Application Assessment</span>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </div>
    );
}
