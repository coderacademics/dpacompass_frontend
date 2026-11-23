
import {
    useEffect,
    useState,
    cloneElement,
    isValidElement
} from "react";

import { FiMenu } from "react-icons/fi";
import Sidebar from "../dashboard_old/Sidebar";

export default function DashboardLayout({ role, children }) {

    const normalizedRole = String(role || "admin")
        .trim()
        .toLowerCase();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [auditMode, setAuditMode] = useState(() => {
        const stored = localStorage.getItem("auditee_mode");

        const normalized = String(stored || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");

        return normalized === "third_party" ||
            normalized === "third_party_audit"
            ? "third_party_audit"
            : "self_check";
    });

    const handleAuditModeChange = (mode) => {
        const normalized = String(mode || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");

        if (
            normalized !== "self_check" &&
            normalized !== "third_party_audit" &&
            normalized !== "third_party"
        ) {
            return;
        }

        const nextMode =
            normalized === "third_party"
                ? "third_party_audit"
                : normalized;

        setAuditMode(nextMode);
        localStorage.setItem("auditee_mode", nextMode);
    };

    useEffect(() => {
        if (!sidebarOpen) return;

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [sidebarOpen]);

    const dashboardContent =
        normalizedRole === "auditee" &&
        isValidElement(children)
            ? cloneElement(children, { auditMode })
            : children;

    // Temporary debugging
    console.log("Dashboard Layout Role:", normalizedRole);
    console.log("Dashboard Layout Audit Mode:", auditMode);

    return (
        <div className="dashboard-theme dashboard-shell">

            <Sidebar
                role={normalizedRole}
                auditMode={auditMode}
                onAuditModeChange={handleAuditModeChange}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {sidebarOpen && (
                <button
                    type="button"
                    className="dashboard-mobile-backdrop"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="dashboard-main">

                <header className="dashboard-mobile-header">

                    <button
                        type="button"
                        className="dashboard-mobile-menu-button"
                        aria-label="Open sidebar"
                        aria-controls="dashboard-sidebar"
                        aria-expanded={sidebarOpen}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FiMenu aria-hidden="true" size={21} />
                    </button>

                    <span className="dashboard-mobile-title">
                        DPACOMPASS
                    </span>

                    <span className="dashboard-mobile-header-spacer" />

                </header>

                <div className="dashboard-workspace">
                    {dashboardContent}
                </div>

                <footer className="dashboard-footer">
                    <p className="dashboard-footer-copyright">
                        © {new Date().getFullYear()} Developed by{" "}
                        Centre for Development of Advanced Computing
                        {" "}(C-DAC), Government of India
                    </p>
                </footer>

            </main>

        </div>
    );
}
