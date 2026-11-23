import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";


import {
    ArrowLeft,
    CheckCircle2,
    ClipboardList,
    AlertCircle,
    RefreshCw,
    FileCheck2,
    X,
    LoaderCircle,
} from "lucide-react";

import Loader from "../utilities/Loader";

import DomainAccordion from "./components/DomainAccordion";

import {
    getAuditorChecklist,
    saveAuditorResponse,
} from "./services/auditorChecklistService";

import {
    getChecklistResponse,
} from "./utils/auditorChecklistUtils";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function AuditorChecklistPage() {

    const navigate = useNavigate();

    const { publicAuditId } = useParams();


    // ==========================================
    // STATES
    // ==========================================
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [audit, setAudit] = useState(null);

    const [domains, setDomains] = useState([]);

    // Current editable responses
    const [responses, setResponses] = useState({});

    // Last successfully saved responses
    const [savedResponses, setSavedResponses] = useState({});

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [savingId, setSavingId] = useState(null);

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });


    // ==========================================
    // RESPONSE HELPERS
    // ==========================================

    const cloneResponse = (response) => ({
        status: response?.status || "",
        comments: response?.comments || "",
        existingEvidence: [...(response?.existingEvidence || [])],
        newEvidence: [...(response?.newEvidence || [])],
    });


    const normalizeDomains = (data) => {

        const domainList = data?.domains || [];

        const initialResponses = {};

        domainList.forEach(domain => {

            (domain.checklists || []).forEach(item => {

                initialResponses[item.checklist_id] =
                    getChecklistResponse(item);

            });

        });

        return {
            domains: domainList,
            responses: initialResponses,
        };

    };


    // ==========================================
    // FETCH AUDIT DETAILS
    // ==========================================


    const fetchAuditDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            // ==========================================
            // STEP 1: FETCH APPLICATION DETAILS
            // ==========================================
            try {
                const applicationResponse = await fetchWithAuth(
                    `/api/applications/${encodeURIComponent(publicAuditId)}/`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!applicationResponse.ok) {
                    throw new Error(
                        `Application API failed. HTTP ${applicationResponse.status}`
                    );
                }

                const applicationData = await applicationResponse.json();

                // Display complete response in browser console
                console.log("APPLICATION DETAILS RESPONSE:", applicationData);

                // Display application URL separately
                console.log(
                    "APPLICATION URL:",
                    applicationData?.application_url
                );

            } catch (applicationError) {
                console.error(
                    "Application details fetch error:",
                    applicationError
                );
            }

            // ==========================================
            // STEP 2: FETCH AUDITOR CHECKLIST
            // ==========================================
            const data = await getAuditorChecklist(publicAuditId);

            if (!data || !Array.isArray(data.domains)) {
                throw new Error(
                    "Invalid auditor checklist response received."
                );
            }

            const normalized = normalizeDomains(data);

            setAudit(data);
            setDomains(normalized.domains);
            setResponses(normalized.responses);

            setSavedResponses(
                Object.fromEntries(
                    Object.entries(normalized.responses).map(
                        ([id, response]) => [
                            id,
                            cloneResponse(response),
                        ]
                    )
                )
            );

        } catch (err) {
            console.error("Audit fetch error:", err);

            setError(
                err.message || "Unable to load auditor checklist."
            );

        } finally {
            setLoading(false);
        }
    }, [publicAuditId]);


    useEffect(() => {

        if (publicAuditId) {
            fetchAuditDetails();
        }

    }, [publicAuditId, fetchAuditDetails]);


    // ==========================================
    // RESPONSE CHANGE HANDLER
    // ==========================================

    const handleResponseChange = (checklistId, field, value) => {

        setResponses(prev => ({

            ...prev,

            [checklistId]: {

                ...prev[checklistId],

                [field]: value,

            },

        }));

        // Clear previous notification while editing
        setNotification({
            type: "",
            message: "",
        });

    };

    //----------------------------------------
    // HANDLE GENERATE REPORT FUNCTION
    //----------------------------------------
    const handleGenerateReport = async () => {
        if (!publicAuditId || generatingReport || reportGenerated) return;

        if (progress.unsaved > 0) {
            setNotification({
                type: "error",
                message: "Please save all unsaved checklist changes before generating the report.",
            });
            return;
        }

        setGeneratingReport(true);

        try {
            const response = await fetchWithAuth(
                `/api/checklists/html_report/${encodeURIComponent(publicAuditId)}/`,
                {
                    method: "GET",
                    headers: {
                        Accept: "text/html, application/json",
                    },
                }
            );

            const contentType = response.headers.get("content-type") || "";
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    `Report generation failed. HTTP ${response.status}`
                );
            }

            let html = responseText;

            if (contentType.includes("application/json")) {
                const data = JSON.parse(responseText);

                if (data.success === false) {
                    throw new Error(data.message || "Report generation failed.");
                }

                html = data.html || data.report_html || data.content || "";
            }

            if (!html || !html.trim()) {
                throw new Error("The report API returned an empty HTML report.");
            }

            setReportGenerated(true);

            localStorage.setItem(
                `auditor-report-generated-${publicAuditId}`,
                "true"
            );

            setShowGenerateModal(false);

            setNotification({
                type: "success",
                message: "Report generated successfully. Audit finalized.",
            });

            navigate("/auditor/completed-reports", {
                state: {
                    reportGenerated: true,
                    publicAuditId,
                },
            });

        } catch (error) {
            console.error("Report generation error:", error);

            setNotification({
                type: "error",
                message: error.message || "Unable to generate report.",
            });

        } finally {
            setGeneratingReport(false);
        }
    };

    // ==========================================
    // DIRTY CHECK
    // ==========================================

    const isResponseDirty = (checklistId) => {

        const current = responses[checklistId];

        const saved = savedResponses[checklistId];

        if (!current) return false;

        // New checklist response
        if (!saved) {
            return Boolean(
                current.status ||
                current.comments ||
                current.existingEvidence?.length ||
                current.newEvidence?.length
            );
        }

        const statusChanged =
            current.status !== saved.status;

        const commentsChanged =
            current.comments !== saved.comments;

        const existingEvidenceChanged =
            JSON.stringify(current.existingEvidence) !==
            JSON.stringify(saved.existingEvidence);

        const newEvidenceAdded =
            current.newEvidence?.length > 0;

        return (
            statusChanged ||
            commentsChanged ||
            existingEvidenceChanged ||
            newEvidenceAdded
        );

    };


    // ==========================================
    // SAVE INDIVIDUAL CHECKLIST ROW
    // ==========================================

    const handleSaveRow = async (item) => {

        const checklistId = item.checklist_id;

        const current = responses[checklistId];

        if (!current) return;

        // Prevent duplicate save requests
        if (savingId !== null) return;

        // Status is mandatory
        if (!current.status) {

            setNotification({
                type: "error",
                message: `Please select a compliance status for ${item.code}.`,
            });

            return;

        }

        if (!isResponseDirty(checklistId)) {

            setNotification({
                type: "info",
                message: `${item.code} has no unsaved changes.`,
            });

            return;

        }


        // Capture snapshot before API request
        const submittedSnapshot = cloneResponse(current);

        setSavingId(checklistId);

        setNotification({
            type: "",
            message: "",
        });


        try {

            // Save one checklist item independently.
            // Evidence must be submitted as multipart/form-data
            // by the service layer.
            const result = await saveAuditorResponse(
                publicAuditId,
                checklistId,
                submittedSnapshot
            );


            // Build confirmed saved response.
            // If the backend returns the updated checklist item,
            // normalize its actual evidence URLs and IDs.
            let confirmedResponse;

            const savedItem =
                result?.data?.checklist ||
                result?.checklist ||
                result?.data ||
                result;

            if (
                savedItem &&
                typeof savedItem === "object" &&
                (
                    savedItem.checklist_id ||
                    Object.prototype.hasOwnProperty.call(
                        savedItem,
                        "evidence"
                    )
                )
            ) {

                confirmedResponse =
                    getChecklistResponse(savedItem);

            } else {

                // Fallback for APIs that return only success/message.
                // Newly uploaded files are not given fabricated URLs.
                confirmedResponse = {
                    ...submittedSnapshot,
                    newEvidence: [],
                };

            }


            // Update saved state
            setSavedResponses(prev => ({

                ...prev,

                [checklistId]: cloneResponse(confirmedResponse),

            }));


            // Update editable state.
            // Preserve edits made while the request was running.
            setResponses(prev => {

                const latest = prev[checklistId];

                if (!latest) return prev;

                const submittedFileNames =
                    submittedSnapshot.newEvidence.map(file => file.name);

                const remainingNewFiles =
                    (latest.newEvidence || []).filter(
                        file => !submittedFileNames.includes(file.name)
                    );

                const currentStillMatchesSnapshot =
                    latest.status === submittedSnapshot.status &&
                    latest.comments === submittedSnapshot.comments;

                return {

                    ...prev,

                    [checklistId]: {

                        ...(currentStillMatchesSnapshot
                            ? cloneResponse(confirmedResponse)
                            : latest),

                        // Do not discard evidence added during the request.
                        newEvidence: remainingNewFiles,

                    },

                };

            });


            setNotification({
                type: "success",
                message: `${item.code} saved successfully.`,
            });


        } catch (err) {

            console.error("Checklist save error:", err);

            setNotification({
                type: "error",
                message:
                    err.message ||
                    `Failed to save ${item.code}.`,
            });

        } finally {

            setSavingId(null);

        }

    };


    // ==========================================
    // CLEAR INDIVIDUAL CHECKLIST ROW
    // ==========================================

    const handleClearRow = (item) => {

        const checklistId = item.checklist_id;

        // Do not allow clearing while the row is being saved.
        if (savingId === checklistId) return;

        const saved = savedResponses[checklistId];

        setResponses(prev => ({

            ...prev,

            [checklistId]: saved
                ? cloneResponse(saved)
                : {
                    status: "",
                    comments: "",
                    existingEvidence: [],
                    newEvidence: [],
                },

        }));

        setNotification({
            type: "info",
            message: `${item.code} has been reset to its last saved state.`,
        });

    };


    // ==========================================
    // PROGRESS CALCULATION
    // ==========================================

    const progress = useMemo(() => {

        const checklistItems = domains.flatMap(
            domain => domain.checklists || []
        );

        const total = checklistItems.length;

        const completed = checklistItems.filter(item => {

            return Boolean(
                savedResponses[item.checklist_id]?.status
            );

        }).length;


        const pending = total - completed;

        const percentage = total
            ? Math.round((completed / total) * 100)
            : 0;


        const unsaved = checklistItems.filter(item => {

            return isResponseDirty(item.checklist_id);

        }).length;


        return {
            total,
            completed,
            pending,
            percentage,
            unsaved,
        };

    }, [domains, savedResponses, responses]);


    // ==========================================
    // UI: enterprise light workspace
    // DashboardLayout remains the sole page background owner.
    // ==========================================
    if (loading) {
        return (
            <div className="flex min-h-[45vh] items-center justify-center">
                <Loader text="Loading auditor checklist..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-w-0 text-slate-900">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                    <ArrowLeft size={17} /> Back
                </button>

                <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <AlertCircle size={36} className="mx-auto mb-4 text-red-600" aria-hidden="true" />
                    <h2 className="mb-2 text-xl font-semibold text-slate-900">Unable to load audit</h2>
                    <p className="mb-5 text-sm leading-6 text-slate-600">{error}</p>
                    <button
                        type="button"
                        onClick={fetchAuditDetails}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        <RefreshCw size={16} /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 text-slate-900">
            {/* Report generation confirmation: preserves original finalization flow */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="generate-report-title"
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                                    <FileCheck2 size={22} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Audit finalization</p>
                                    <h2 id="generate-report-title" className="text-lg font-semibold text-slate-900">Generate audit report?</h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Close dialog"
                                disabled={generatingReport}
                                onClick={() => setShowGenerateModal(false)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X size={19} aria-hidden="true" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                                Once you generate the report, this audit will be finalized. You will no longer be able to modify or save checklist responses. The audit will appear in the Completed Audits section.
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowGenerateModal(false)}
                                disabled={generatingReport}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateReport}
                                disabled={generatingReport}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {generatingReport ? (
                                    <><LoaderCircle size={16} className="animate-spin" /> Generating...</>
                                ) : (
                                    <><FileCheck2 size={16} /> Generate report</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto w-full max-w-[1500px] space-y-6">
                {/* Navigation and page identity */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                        <ArrowLeft size={17} /> Back
                    </button>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        Auditor Workspace
                    </span>
                </div>

                <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.035)] md:p-7">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="shrink-0 rounded-xl border border-blue-100 bg-blue-50 p-3 text-blue-700">
                                <ClipboardList size={24} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Audit management</p>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">Auditor Checklist</h1>
                                <p className="mt-2 break-all text-sm text-slate-500">
                                    Public Audit ID: <span className="font-semibold text-slate-700">{audit?.public_audit_id || publicAuditId}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {!reportGenerated && (
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(true)}
                                    disabled={savingId !== null || progress.unsaved > 0}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FileCheck2 size={17} /> Generate Report
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={fetchAuditDetails}
                                disabled={savingId !== null || generatingReport}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw size={17} /> Refresh
                            </button>
                        </div>
                    </div>
                </header>

                {/* Progress figures are calculated from last successfully saved responses */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.035)] md:p-6" aria-labelledby="audit-progress-heading">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><ClipboardList size={22} /></span>
                            <div>
                                <h2 id="audit-progress-heading" className="text-base font-bold text-slate-900 md:text-lg">Audit Completion</h2>
                                <p className="mt-1 text-sm text-slate-500">Progress based on saved checklist responses</p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold tabular-nums text-blue-800 md:text-3xl">{progress.percentage}%</span>
                    </div>

                    <div
                        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label="Audit completion"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress.percentage}
                    >
                        <div className="h-full rounded-full bg-blue-700 transition-[width] duration-300" style={{ width: `${progress.percentage}%` }} />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-2xl font-bold tabular-nums text-slate-900">{progress.total}</p>
                            <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">Total Questions</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-2xl font-bold tabular-nums text-emerald-700">{progress.completed}</p>
                            <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">Saved Responses</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-2xl font-bold tabular-nums text-amber-700">{progress.pending}</p>
                            <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">Remaining</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-2xl font-bold tabular-nums text-blue-700">{progress.unsaved}</p>
                            <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">Unsaved Changes</p>
                        </div>
                    </div>
                </section>

                {/* Feedback */}
                {notification.message && (
                    <div
                        role="status"
                        className={`rounded-xl border p-4 text-sm leading-6 ${notification.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : notification.type === "error"
                                ? "border-red-200 bg-red-50 text-red-800"
                                : "border-blue-200 bg-blue-50 text-blue-800"
                            }`}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Checklist domains */}
                <div className="space-y-4">
                    {domains.length > 0 ? (
                        domains.map((domain, index) => (
                            <DomainAccordion
                                key={domain.domain_id}
                                domain={domain}
                                responses={responses}
                                savedResponses={savedResponses}
                                onChange={handleResponseChange}
                                onSave={handleSaveRow}
                                onClear={handleClearRow}
                                isDirty={isResponseDirty}
                                savingId={savingId}
                                audit={audit}
                                publicAuditId={audit?.public_audit_id || publicAuditId}
                                defaultOpen={index === 0}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center">
                            <CheckCircle2 size={32} className="mx-auto mb-3 text-slate-400" />
                            <p className="text-sm text-slate-600">No checklist items found for this audit.</p>
                        </div>
                    )}
                </div>

                {/* Save guidance */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
                    <p>
                        Each checklist response must be saved individually. Previously saved responses are retained when you reopen this audit. Unsaved changes will not be submitted automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
