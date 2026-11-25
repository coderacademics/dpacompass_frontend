export const DOMAIN_TOOL_CONFIG = {
    11: [
        {
            id: "consent_scanner",
            name: "Consent Management Scanner",
            description:
                "Identify consent notices, personal data collection points, and consent-related compliance gaps.",
            route: "/consent-auto-audit",
        },
    ],

    41: [
        {
            id: "data_breach_scanner",
            name: "PII-in Transit Scanner",
            description:
                "Scan the application for security weaknesses and potential data breach risks.",
            route: (auditId) =>
                `/data-breach-scan-config/${auditId}`,
            requiresAuditId: true,
        },
    ],
};