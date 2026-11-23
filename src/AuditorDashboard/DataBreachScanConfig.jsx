import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiClock,
    FiShield,
    FiGlobe,
    FiPlay,
    FiLoader,
    FiFileText,
    FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { breachApi } from "../utilities/breachApi";

export default function DataBreachScanConfig() {
    const navigate = useNavigate();
    const location = useLocation();
    const { auditId: routeAuditId } = useParams();

    const audit = location.state?.audit || {};
    const auditId = audit.audit_id || routeAuditId;
    const targetUrl = audit.url || audit.application_url || "";

    const [maxPages, setMaxPages] = useState("20");
    const [starting, setStarting] = useState(false);
    const [pageError, setPageError] = useState("");

    const parsedPages = Number(maxPages);

    // No frontend upper limit: only positive whole numbers are accepted.
    const isValidPageLimit =
        Number.isInteger(parsedPages) &&
        parsedPages >= 1;

    const pageLimitMessage = useMemo(() => {
        if (!maxPages.trim()) return "Enter a page limit.";
        if (!isValidPageLimit) return "Enter a positive whole number.";
        return "";
    }, [maxPages, isValidPageLimit]);

    const handleStartScan = async () => {
        if (!auditId) {
            toast.error(
                "Audit ID is missing. Please return and select the audit again."
            );
            return;
        }

        if (!targetUrl) {
            toast.error(
                "Application URL is missing. Please return and select the audit again."
            );
            return;
        }

        if (!isValidPageLimit) {
            setPageError(pageLimitMessage);
            return;
        }

        try {
            setStarting(true);
            setPageError("");

            const userData = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            const username = userData.username;

            if (!username) {
                throw new Error(
                    "Username not found in localStorage. Please sign in again."
                );
            }

            const data = await breachApi("/api/scanner/webscan/", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    public_audit_id: audit.public_audit_id,
                    url: targetUrl,
                    max_pages: parsedPages,
                    max_depth: 2,
                }),
            });

            toast.success(
                data?.message ||
                "PII-in-Transit scan submitted successfully."
            );

            navigate("/auditor/databreachscanner", { replace: true });

        } catch (error) {
            console.error("PII-in-Transit scan start error:", error);

            toast.error(
                error.message || "Failed to start PII-in-Transit Scanner."
            );

        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] px-4 py-8 text-slate-800 sm:px-6 lg:px-9">
            <div className="mx-auto w-full max-w-6xl">

                {/* BACK BUTTON */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#075EB5] transition hover:text-[#064D94]"
                >
                    <FiArrowLeft size={17} />
                    Back
                </button>

                {/* PAGE HEADER */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#075EB5] shadow-sm">
                        <FiShield size={27} />
                    </div>

                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#075EB5]">
                                PII-in-Transit Scanner
                            </span>
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                                AUDIT TOOL
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] md:text-3xl">
                            Configure PII-in-Transit Scanner
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Configure the scanning parameters before starting
                            the personal data exposure assessment.
                        </p>
                    </div>
                </div>

                {/* MAIN CONFIGURATION CARD */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                    {/* CARD HEADER */}
                    <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 md:px-7">
                        <div className="flex items-center gap-2">
                            <FiFileText className="text-[#075EB5]" size={18} />
                            <h2 className="text-base font-semibold text-[#14213D]">
                                Scan Configuration
                            </h2>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Review the target application and configure
                            the crawl limit.
                        </p>
                    </div>

                    <div className="space-y-7 p-5 md:p-7">

                        {/* TARGET WEBSITE */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <FiGlobe size={15} />
                                Target Website
                            </label>
                            <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <FiGlobe className="shrink-0 text-[#075EB5]" size={18} />
                                <span className="break-all text-sm font-medium text-slate-700">
                                    {targetUrl || "Website URL unavailable"}
                                </span>
                            </div>
                        </div>

                        {/* CONFIGURATION FIELDS */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* MAXIMUM PAGES */}
                            <div>
                                <label
                                    htmlFor="max-pages"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Maximum Pages to Crawl
                                    <span className="ml-1 text-red-600">*</span>
                                </label>

                                <input
                                    id="max-pages"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={maxPages}
                                    onChange={(event) => {
                                        setMaxPages(event.target.value);
                                        setPageError("");
                                    }}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#075EB5] focus:ring-4 focus:ring-blue-100"
                                    placeholder="Enter maximum pages"
                                />

                                <p
                                    className={`mt-2 text-xs ${pageError || pageLimitMessage
                                            ? "text-red-600"
                                            : "text-slate-500"
                                        }`}
                                >
                                    {pageError ||
                                        pageLimitMessage ||
                                        "Enter any positive whole number."}
                                </p>
                            </div>

                            {/* SCAN SUMMARY */}
                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#173B70]">
                                    <FiClock size={17} />
                                    Scan Summary
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#075EB5] shadow-sm">
                                        <FiGlobe size={21} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold tabular-nums text-[#14213D]">
                                            {isValidPageLimit ? parsedPages : "—"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Maximum pages
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 text-xs leading-5 text-slate-600">
                                    The scanner will inspect up to the
                                    configured number of pages, subject
                                    to website availability and scanner limits.
                                </p>
                            </div>
                        </div>

                        {/* AUTHENTICATION INFORMATION */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                    <FiCheckCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Authentication Configuration
                                    </h3>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        The scan will use the access
                                        configuration already associated
                                        with this audit.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SCAN INFORMATION */}
                        <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                            <FiClock
                                size={18}
                                className="mt-0.5 shrink-0 text-amber-600"
                            />
                            <p className="text-xs leading-6 text-amber-800">
                                Actual scan duration depends on website
                                response time and the checks performed
                                on each page. No fixed duration is assumed.
                            </p>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={starting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FiArrowLeft size={16} />
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={handleStartScan}
                                disabled={
                                    starting ||
                                    !isValidPageLimit ||
                                    !auditId ||
                                    !targetUrl
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-[#064D94] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {starting ? (
                                    <>
                                        <FiLoader size={17} className="animate-spin" />
                                        Starting Scan...
                                    </>
                                ) : (
                                    <>
                                        <FiPlay size={17} />
                                        Start PII-in-Transit Scanner
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <p className="mt-5 text-center text-xs text-slate-400">
                    DPACOMPASS · Data Privacy · Security · Compliance
                </p>
            </div>
        </div>
    );
}
