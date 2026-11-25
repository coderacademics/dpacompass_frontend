
// import { fetchWithAuth } from "../utilities/fetchWithAuth";
// import { startAudit } from "../utilities/auditApi";
// import { breachApi } from "../utilities/breachApi";

import { startAudit } from "../ConsentScannerModule/Consent2.0/services/auditApi";
import { breachApi } from "./breachApi";
import { fetchWithAuth } from "./fetchWithAuth";


// Generate one Public Audit ID from DPACOMPASS.
export const generatePublicAuditId = async () => {
    const response = await fetchWithAuth(
        "/api/audits/generate-self-check-id/",
        {
            method: "POST",
        }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success || !data.public_audit_id) {
        throw new Error(
            data.message ||
            data.detail ||
            "Failed to generate Public Audit ID."
        );
    }

    return data.public_audit_id;
};

// Start Consent Management Scanner.
export const startSelfCheckConsentScanner = async ({
    public_audit_id,
    dpacompass_username,
    url,
    max_pages = 20,
    username = "",
    password = "",
    authentication_required = false,
    mode
}) => {
    // console.log("[SelfCheck] Public Audit ID:", public_audit_id);

    return startAudit({
        public_audit_id,
        dpacompass_username,
        url,
        max_pages,
        username,
        password,
        authentication_required,
        crawl_mode : mode
    });
};
// Start PII-in-Transit / Scanner.
export const startSelfCheckDataBreachScanner = async ({
    publicAuditId,
    url,
    dpacompass_username
}) => {
    const userData = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    if (!userData.username) {
        throw new Error("Username not found. Please sign in again.");
    }

    const payload = {
        publicAuditId,
        url,
        dpacompass_username
    };

    const data = await breachApi("/api/scanner/webscan/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (data?.status !== "success") {
        throw new Error(
            data?.message ||
            data?.error_message ||
            data?.error ||
            "Unable to start PII-in-Transit scanner."
        );
    }

    return data;
};
