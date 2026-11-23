import { CONSENT_API_BASE_URL } from "../../../config";

const API_BASE = CONSENT_API_BASE_URL.replace(/\/$/, "");

// Common headers
const getHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
});

// Common response handler
const parseResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error ||
            data.detail ||
            data.message ||
            `Request failed with status ${response.status}.`
        );
    }

    return data;
};

// Validate and encode Public Audit ID
const requireAuditId = (publicAuditId) => {
    const auditId = String(publicAuditId || "").trim();

    if (!auditId) {
        throw new Error("Public Audit ID is required.");
    }

    return encodeURIComponent(auditId);
};

// Common audit endpoint
const auditUrl = (publicAuditId) =>
    `${API_BASE}/api/audits/${requireAuditId(publicAuditId)}`;


/*
|--------------------------------------------------------------------------
| 1. Start Self-Check Consent Scan
|--------------------------------------------------------------------------
*/

export async function startSelfCheckConsentScan({
    url,
    public_audit_id,
    username = "",
    password = "",
    authentication_required = false,
    dpacompass_username,
    max_pages = 20,
}) {
    if (!url?.trim()) {
        throw new Error("Website URL is required.");
    }

    if (!public_audit_id?.trim()) {
        throw new Error("Public Audit ID is missing.");
    }

    if (!dpacompass_username?.trim()) {
        throw new Error("DPACOMPASS username is missing.");
    }

    const parsedMaxPages = Number(max_pages);

    if (!Number.isInteger(parsedMaxPages) || parsedMaxPages < 1) {
        throw new Error("Maximum pages must be a valid positive integer.");
    }

    const payload = {
        url: url.trim(),
        crawl_mode: "full",
        dpacompass_username: dpacompass_username.trim(),
        public_audit_id: public_audit_id.trim(),
        max_pages: parsedMaxPages,

        ...(authentication_required && {
            authentication_required: true,
        }),

        ...(username?.trim() && {
            username: username.trim(),
        }),

        ...(password && {
            password,
        }),
    };

    console.log("[Consent Scanner] Final API Payload:", payload);

    const response = await fetch(`${API_BASE}/api/audits/test-crawl/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 2. Get DPACOMPASS Audits
|--------------------------------------------------------------------------
*/

export const getDpacompassAudits = async () => {
    let user = {};

    try {
        user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        throw new Error("Unable to read the logged-in DPACOMPASS user.");
    }

    const dpacompassUsername =
        user.username || user.dpacompass_username || "";

    if (!dpacompassUsername) {
        throw new Error("DPACOMPASS username not found.");
    }

    const response = await fetch(`${API_BASE}/api/audits/dpacompass-audits/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
            dpacompass_username: dpacompassUsername,
        }),
    });

    return parseResponse(response);
};


/*
|--------------------------------------------------------------------------
| 3. Get Consent Audit Summary
|--------------------------------------------------------------------------
| Loads audit metadata and step-wise execution/status information.
|
| GET /api/audits/consent/result/{audit_id}/
*/

export async function getConsentAuditSummary(publicAuditId) {
    const auditId = requireAuditId(publicAuditId);

    const response = await fetch(
        `${API_BASE}/api/audits/consent/result/${auditId}/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 4. Get Individual Consent Step Result
|--------------------------------------------------------------------------
| Called only when the user opens a step.
|
| GET /api/audits/consent/result/{audit_id}/step/{step_number}/
|
| IMPORTANT:
| Pass the actual backend step number, not the UI serial number.
| Example: STEP-04 must pass 4.
*/

export async function getConsentStepResult(publicAuditId, stepNumber) {
    const auditId = requireAuditId(publicAuditId);
    const parsedStepNumber = Number(stepNumber);

    if (!Number.isInteger(parsedStepNumber) || parsedStepNumber < 1) {
        throw new Error("A valid Consent Scanner step number is required.");
    }

    const response = await fetch(
        `${API_BASE}/api/audits/consent/result/${auditId}/step/${parsedStepNumber}/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 5. Get STEP-01 Findings (Backend Pagination)
|--------------------------------------------------------------------------
|
| GET /api/audits/consent/result/{audit_id}/step/1/findings/
|     ?page=1&page_size=20
*/

export async function getConsentStepFindings(
    publicAuditId,
    { page = 1, pageSize = 20 } = {}
) {
    const auditId = requireAuditId(publicAuditId);

    const parsedPage = Number(page);
    const parsedPageSize = Number(pageSize);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        throw new Error("Page must be a positive integer.");
    }

    if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1) {
        throw new Error("Page size must be a positive integer.");
    }

    const query = new URLSearchParams({
        page: String(parsedPage),
        page_size: String(parsedPageSize),
    });

    const response = await fetch(
        `${API_BASE}/api/audits/consent/result/${auditId}/step/1/findings/?${query.toString()}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 6. Legacy: Get Complete Technical Scan Result
|--------------------------------------------------------------------------
| Retained temporarily for backward compatibility with older components.
| The new result viewer should use the three functions above.
*/

export async function getCompleteConsentScanResult(publicAuditId) {
    if (!publicAuditId) {
        throw new Error("Audit ID is required.");
    }

    const response = await fetch(
        `${auditUrl(publicAuditId)}/complete-result/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 7. Get Checklist Assessment
|--------------------------------------------------------------------------
*/

export async function getConsentChecklistAssessment(publicAuditId) {
    const response = await fetch(
        `${API_BASE}/api/checklist_assessment/audits/${requireAuditId(publicAuditId)}/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 8. Get Scan Status
|--------------------------------------------------------------------------
*/

export async function getConsentScanStatus(publicAuditId) {
    const response = await fetch(
        `${auditUrl(publicAuditId)}/status/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 9. Get Self-Check Consent HTML Report
|--------------------------------------------------------------------------
*/

export const getSelfCheckConsentReport = async (publicAuditId) => {
    const auditId = requireAuditId(publicAuditId);

    const response = await fetch(
        `${API_BASE}/api/reports/audit/${auditId}/html/`,
        {
            method: "GET",
            headers: {
                Accept: "text/html, application/json",
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Unable to fetch consent assessment report. Status: ${response.status}. ${errorText.slice(0, 300)}`
        );
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const data = await response.json();

        const html =
            data.html ??
            data.report_html ??
            data.content ??
            data.data?.html ??
            data.data?.report_html;

        if (typeof html !== "string" || !html.trim()) {
            throw new Error("Report HTML is not available in the API response.");
        }

        return html;
    }

    const html = await response.text();

    if (!html.trim()) {
        throw new Error("The consent assessment report is empty.");
    }

    return html;
};