
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import SelfCheckConsentScanResult from "./Tools/ConsentScanner/SelfCheckConsentScanResult";
import SelfCheckDataBreachResult from "./Tools/BreachScanner/SelfCheckDataBreachResult";

export default function ConsolidatedSelfCheckReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const { publicAuditId } = useParams();

    // Read scanner information from navigation state
    const navigationState = location.state || {};

    const scanners = navigationState.scanners || [];

    // Resolve selected scanners
    const showConsent =
        navigationState.showConsent ??
        scanners.some(
            (item) => item.tool === "consent_management"
        );

    const showDataBreach =
        navigationState.showDataBreach ??
        scanners.some(
            (item) => item.tool === "data_breach"
        );

    console.log("Consolidated Report Debug:", {
        publicAuditId,
        navigationState,
        scanners,
        showConsent,
        showDataBreach,
    });

    if (!publicAuditId) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl border p-8 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />

                    <h2 className="text-lg font-bold text-slate-800">
                        Public Audit ID is missing
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                        Unable to identify the requested assessment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6"
                >
                    <ArrowLeft size={17} />
                    Back to My Scans
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Self-Check Assessment Report
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        Public Audit ID: {publicAuditId}
                    </p>
                </div>

                {!showConsent && !showDataBreach && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                        <p className="font-semibold text-amber-800">
                            Scanner information is unavailable.
                        </p>

                        <p className="text-sm text-amber-700 mt-1">
                            No scanner has been selected for this report.
                            Please return to My Scans and open the assessment again.
                        </p>
                    </div>
                )}

                {showConsent && (
                    <section className="mb-8">
                        <SelfCheckConsentScanResult
                            publicAuditId={publicAuditId}
                        />
                    </section>
                )}

                {showDataBreach && (
                    <section className="mb-8">
                        <SelfCheckDataBreachResult
                            publicAuditId={publicAuditId}
                        />
                    </section>
                )}

            </div>
        </div>
    );
}
