import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
import { startSelfCheckDataBreachScanner } from "../utilities/selfCheckApi";
import { getSelfCheckBreachScanStatus } from "../utilities/breachApi";


const extractBreachScanRecords = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    const possibleArrays = [
        response?.audits,
        response?.scans,
        response?.results,
        response?.data?.audits,
        response?.data?.scans,
        response?.data?.results,
        response?.data,
    ];

    return possibleArrays.find(Array.isArray) || [];
};

const getBreachRecordPublicAuditId = (record) => {
    const value =
        record?.public_audit_id ??
        record?.publicAuditId ??
        record?.audit?.public_audit_id ??
        record?.scan?.public_audit_id ??
        record?.audit?.publicAuditId ??
        record?.scan?.publicAuditId;

    return value ? String(value) : "";
};

const getBreachRecordStatus = (record) => {
    return String(
        record?.status ??
        record?.scan_status ??
        record?.audit_status ??
        record?.task_status ??
        record?.state ??
        ""
    ).trim().toLowerCase().replaceAll("-", "_");
};


// Return true when at least one checklist item has an empty status.
// Scanner results should be mapped if any checklist row is still unfilled.
const hasAnyEmptyChecklistStatus = (checklistData) => {
    const domainList = Array.isArray(checklistData?.domains)
        ? checklistData.domains
        : [];

    const checklistItems = domainList.flatMap((domain) =>
        Array.isArray(domain?.checklists) ? domain.checklists : []
    );

    if (checklistItems.length === 0) return false;

    return checklistItems.some((item) => {
        const status = item?.status;
        return status === null || status === undefined || String(status).trim() === "";
    });
};

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
    const [applicationUrl, setApplicationUrl] = useState("");
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

    // Prevent repeated checklist mapping while the status endpoint is polled.
    const mappingRef = useRef(false);
    const mappedAuditIdsRef = useRef(new Set());

    // Map completed scanner findings into the checklist using Public Audit ID.
    // This is triggered automatically when the scanner status becomes completed.
    const handleMapToChecklist = useCallback(async (publicAuditId) => {
        const scannerPublicAuditId = publicAuditId;
        console.log("testing");
        
        if (!scannerPublicAuditId) {
            console.error("[Breach checklist mapping] Aborted: Public Audit ID missing.");
            setNotification({
                type: "error",
                message: "Public Audit ID is missing. Cannot map scanner results.",
            });
            return false;
        }

        const id = String(scannerPublicAuditId);
        const mappedStorageKey = `breach-checklist-mapped-${id}`;

        // Do not use localStorage as a reason to skip the POST. It can be stale
        // if the checklist was reset or the earlier mapping was only partial.
        if (mappedAuditIdsRef.current.has(id)) {
            console.info("[Breach checklist mapping] Already mapped successfully in this page session; skipping duplicate.", {
                publicAuditId: id,
            });
            return true;
        }

        if (mappingRef.current) {
            console.warn("[Breach checklist mapping] Another mapping request is already in progress; this request is skipped.", {
                publicAuditId: id,
            });
            return false;
        }

        mappingRef.current = true;
        console.groupCollapsed(`[Breach checklist mapping] ${id}`);
        console.info("Starting checklist mapping", {
            publicAuditId: id,
            endpoint: `/api/checklists/fetch-breach-result/${encodeURIComponent(id)}/`,
            trigger: "Scanner status COMPLETED",
        });

        try {
            const endpoint = `/api/checklists/fetch-breach-result/${encodeURIComponent(id)}/`;
            const response = await fetchWithAuth(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            console.info("Mapping API HTTP response", {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
            });

            const result = await response.json().catch((parseError) => {
                console.error("Could not parse mapping API response as JSON.", parseError);
                return {};
            });

            console.info("Mapping API response body", result);

            if (!response.ok || result?.success !== true) {
                throw new Error(
                    result?.message ||
                    result?.error ||
                    `Mapping API failed with HTTP ${response.status}.`
                );
            }

            mappedAuditIdsRef.current.add(id);
            try {
                localStorage.setItem(mappedStorageKey, "true");
            } catch (storageError) {
                console.warn("Could not persist mapped state in localStorage.", storageError);
            }

            const savedCount = result.total_saved ?? result.totalSaved ?? 0;
            console.info("Checklist mapping completed successfully.", {
                publicAuditId: id,
                totalSaved: savedCount,
                response: result,
            });

            setNotification({
                type: "success",
                message: `PII-in-Transit results mapped to the checklist successfully. ${savedCount} results saved.`,
            });
            return true;
        } catch (err) {
            console.error("[Breach checklist mapping] Request failed.", {
                publicAuditId: id,
                error: err,
            });
            setNotification({
                type: "error",
                message: err?.message || "Unable to map scanner results to the checklist.",
            });
            return false;
        } finally {
            mappingRef.current = false;
            console.groupEnd();
        }
    }, []);

    // Start the PII-in-Transit / Data Breach scanner using this audit's
    // existing Public Audit ID and application URL.
    const startDataBreachScan = useCallback(
        async ({ publicAuditId: scannerAuditId, applicationUrl: scannerUrl }) => {
            let user = {};

            try {
                user = JSON.parse(localStorage.getItem("user") || "{}");
            } catch {
                user = {};
            }

            const dpacompassUsername =
                user.username ||
                user.dpacompass_username ||
                "";

            if (!dpacompassUsername) {
                throw new Error(
                    "DPACOMPASS username is missing. Please sign in again."
                );
            }

            if (!scannerAuditId) {
                throw new Error("Public Audit ID is missing.");
            }

            if (!scannerUrl) {
                throw new Error("Application URL is missing.");
            }

            return startSelfCheckDataBreachScanner({
                url: scannerUrl.trim(),
                publicAuditId: scannerAuditId,
                dpacompass_username: dpacompassUsername,
            });
        },
        []
    );

    // The breach status API returns records grouped by status.
    // Find the record associated with this audit and return a normalized
    // status object for DataBreachScannerPanel.
    const getDataBreachScanStatus = useCallback(
        async ({ publicAuditId: scannerAuditId }) => {
            if (!scannerAuditId) {
                throw new Error("Public Audit ID is missing.");
            }

            const auditId = String(scannerAuditId);

            console.warn(
                "[Breach scanner status] Polling status lists for audit.",
                {
                    publicAuditId: auditId,
                }
            );

            const requestedStatuses = [
                "RUNNING",
                "PENDING",
                "COMPLETED",
            ];

            // Helper: prevent an API request from hanging indefinitely.
            const withTimeout = (promise, timeoutMs, status) => {
                let timeoutId;

                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(
                            new Error(
                                `${status} status request timed out after ${timeoutMs}ms`
                            )
                        );
                    }, timeoutMs);
                });

                return Promise.race([
                    promise,
                    timeoutPromise,
                ]).finally(() => {
                    clearTimeout(timeoutId);
                });
            };

            console.warn(
                "[Breach DEBUG] Starting status requests",
                auditId
            );

            // Request all three status lists.
            const statusRequests = await Promise.allSettled(
                requestedStatuses.map((status) => {
                    console.warn(
                        `[Breach DEBUG] Request started: ${status}`
                    );

                    return withTimeout(
                        getSelfCheckBreachScanStatus(status),
                        15000,
                        status
                    );
                })
            );

            console.warn(
                "[Breach DEBUG] All status requests settled",
                auditId
            );

            // Log each response.
            statusRequests.forEach((result, index) => {
                const status = requestedStatuses[index];

                if (result.status === "fulfilled") {
                    console.warn(
                        `[Breach scanner status] ${status} response:`,
                        result.value
                    );
                } else {
                    console.error(
                        `[Breach scanner status] ${status} request failed:`,
                        result.reason
                    );
                }
            });

            const statusGroups = [
                "running",
                "pending",
                "completed",
            ];

            const recordsByStatus = [];

            // Extract records and match them against the current Public Audit ID.
            statusRequests.forEach((request, index) => {
                if (request.status !== "fulfilled") {
                    return;
                }

                const records = extractBreachScanRecords(
                    request.value
                );

                console.debug(
                    `[Breach scanner status] Extracted ${requestedStatuses[index]} records:`,
                    records
                );

                records.forEach((record) => {
                    const recordAuditId =
                        getBreachRecordPublicAuditId(record);

                    console.debug(
                        "[Breach scanner status] Comparing audit IDs:",
                        {
                            expected: auditId,
                            received: recordAuditId,
                            record,
                        }
                    );

                    if (
                        String(recordAuditId || "").trim() ===
                        auditId.trim()
                    ) {
                        recordsByStatus.push({
                            ...record,
                            status:
                                getBreachRecordStatus(record) ||
                                statusGroups[index],
                        });
                    }
                });
            });

            console.warn(
                "[Breach scanner status] Matching records:",
                {
                    publicAuditId: auditId,
                    matchedRecords: recordsByStatus,
                }
            );

            // If matching records are found, determine the current status.
            if (recordsByStatus.length > 0) {
                const completedRecord = recordsByStatus.find(
                    (record) =>
                        [
                            "completed",
                            "success",
                            "successful",
                        ].includes(
                            String(record.status).toLowerCase()
                        )
                );

                // Completed scan: fetch the current checklist and check whether
                // this scanner is already associated with one of its domains.
                if (completedRecord) {
                    console.info("[Breach scanner status] Scan completed.", {
                        publicAuditId: auditId,
                        completedRecord,
                    });

                    let checklistData = null;
                    try {
                        checklistData = await getAuditorChecklist(auditId);
                    } catch (checklistError) {
                        console.error(
                            "[Breach checklist mapping] Could not fetch checklist to verify domain mapping.",
                            checklistError
                        );
                    }

                    if (!checklistData || !Array.isArray(checklistData.domains)) {
                        console.error(
                            "[Breach checklist mapping] Checklist data unavailable; cannot safely evaluate checklist statuses. Mapping skipped.",
                            { publicAuditId: auditId }
                        );
                    } else {
                        const hasEmptyStatus = hasAnyEmptyChecklistStatus(checklistData);

                        if (hasEmptyStatus) {
                            console.info(
                                "[Breach checklist mapping] At least one checklist status is empty; mapping completed scanner results.",
                                { publicAuditId: auditId }
                            );

                            // handleMapToChecklist expects the Public Audit ID string.
                            await handleMapToChecklist(auditId);
                        } else {
                            console.info(
                                "[Breach checklist mapping] No checklist statuses are empty; skipping scanner mapping.",
                                { publicAuditId: auditId }
                            );
                        }
                    }

                    return {
                        ...completedRecord,
                        status: "completed",
                    };
                }

                // Running scan.
                const runningRecord = recordsByStatus.find(
                    (record) =>
                        [
                            "running",
                            "in_progress",
                            "processing",
                        ].includes(
                            String(record.status).toLowerCase()
                        )
                );

                if (runningRecord) {
                    return {
                        ...runningRecord,
                        status: "running",
                    };
                }

                // Otherwise, the scan is pending.
                return {
                    ...recordsByStatus[0],
                    status: "pending",
                };
            }

            console.warn(
                "[Breach scanner status] No status record matched this Public Audit ID yet.",
                {
                    publicAuditId: auditId,
                }
            );

            // If all requests failed, report an error.
            const allFailed = statusRequests.every(
                (request) => request.status === "rejected"
            );

            if (allFailed) {
                throw new Error(
                    "Unable to retrieve Data Breach Scanner status."
                );
            }

            // Keep polling while the scanner result is not yet available.
            return {
                status: "running",
                message:
                    "Scan queued. Waiting for the scanner status...",
            };
        },
        [handleMapToChecklist]
    );

    // On page reload, check whether an earlier scanner run has completed.
    // If it is completed and any checklist status is empty, the status
    // callback will invoke the mapping endpoint for this Public Audit ID.
    useEffect(() => {
        if (!publicAuditId) return;

        let cancelled = false;

        const checkPreviousCompletedScan = async () => {
            try {
                console.info(
                    "[Breach scanner status] Checking previous scan on checklist page load.",
                    { publicAuditId }
                );

                if (cancelled) return;

                await getDataBreachScanStatus({ publicAuditId });
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "[Breach scanner status] Failed to check previous scan on page load.",
                        error
                    );
                }
            }
        };

        checkPreviousCompletedScan();

        return () => {
            cancelled = true;
        };
    }, [publicAuditId, getDataBreachScanStatus]);

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
            setApplicationUrl("");

            // application_url is supplied by the auditor checklist response.
            // Do not call the published-report application endpoint with Public Audit ID.
            // ==========================================
            // STEP 2: FETCH AUDITOR CHECKLIST
            // ==========================================
            const data = await getAuditorChecklist(publicAuditId);

            if (!data || !Array.isArray(data.domains)) {
                throw new Error(
                    "Invalid auditor checklist response received."
                );
            }

            // Read application_url directly from the auditor checklist response.
            const checklistApplicationUrl =
                data?.application_url ||
                data?.applicationUrl ||
                data?.application?.application_url ||
                data?.application?.url ||
                data?.audit?.application_url ||
                data?.audit?.application?.application_url ||
                data?.data?.application_url ||
                data?.data?.applicationUrl ||
                data?.data?.application?.application_url ||
                data?.data?.application?.url ||
                "";

            setApplicationUrl(
                typeof checklistApplicationUrl === "string"
                    ? checklistApplicationUrl.trim()
                    : ""
            );

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
                                applicationUrl={applicationUrl}
                                startDataBreachScan={startDataBreachScan}
                                getDataBreachScanStatus={getDataBreachScanStatus}
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
