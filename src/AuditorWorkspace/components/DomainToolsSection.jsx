
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    ScanSearch,
    ArrowRight,
    LockKeyhole,
} from "lucide-react";

export default function DomainToolsSection({
    tools = [],
    auditId,
    audit
}) {
    const navigate = useNavigate();

    if (!tools.length) return null;

    const handleRunTool = (tool) => {
        // Consent Management Scanner
        if (tool.id === "consent_scanner") {
            if (!audit?.public_audit_id) {
                console.error("Public Audit ID is missing:", audit);
                return;
            }

            navigate(tool.route, {
                state: {
                    configuration: {
                        public_audit_id: audit.public_audit_id,
                        audit_id: audit.audit_id,
                        url: audit.url || audit.application_url,
                        username: audit.username || "",
                        password: audit.password || "",
                        max_pages: audit.max_pages || 20,
                    },
                },
            });

            return;
        }

        // Data Breach Scanner and other audit-based tools
        if (tool.id === "data_breach_scanner") {
            const publicAuditId = audit?.public_audit_id;

            if (!publicAuditId) {
                console.error("Public Audit ID is missing:", audit);
                return;
            }

            const destination =
                typeof tool.route === "function"
                    ? tool.route(publicAuditId)
                    : tool.route;

            navigate(destination, {
                state: {
                    publicAuditId,
                    audit,
                },
            });

            return;
        }

        // Other tools
        const destination =
            typeof tool.route === "function"
                ? tool.route(auditId)
                : tool.route;

        navigate(destination, {
            state: { auditId, audit },
        });
    };

    return (
        <div className="rounded-xl border border-blue-100 bg-white p-4 md:p-5">

            <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-[#075EB5]">
                    <ShieldCheck size={19} />
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-[#14213D]">
                        Available Compliance Tools
                    </h4>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Run automated scans relevant to this domain.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                {tools.map((tool) => {
                    const requiresPublicAuditId =
                        tool.id === "consent_scanner" ||
                        tool.id === "data_breach_scanner";

                    const disabled = requiresPublicAuditId
                        ? !audit?.public_audit_id
                        : tool.requiresAuditId && !auditId;

                    return (
                        <div
                            key={tool.id}
                            className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/40"
                        >
                            <div className="flex items-start gap-3">

                                <div className="shrink-0 rounded-lg bg-blue-100 p-2.5 text-[#075EB5]">
                                    <ScanSearch size={20} />
                                </div>

                                <div className="min-w-0">
                                    <h5 className="text-sm font-semibold text-slate-800">
                                        {tool.name}
                                    </h5>

                                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                        {tool.description}
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center justify-between gap-3">

                                {disabled ? (
                                    <span className="flex items-center gap-1.5 text-xs text-amber-700">
                                        <LockKeyhole size={13} />
                                        Public Audit ID unavailable
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400">
                                        Automated assessment
                                    </span>
                                )}

                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleRunTool(tool)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#075EB5] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#064D94] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    Run Scanner
                                    <ArrowRight size={14} />
                                </button>

                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
