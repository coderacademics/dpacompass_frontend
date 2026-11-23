import {
    FiActivity,
    FiBarChart2,
    FiBell,
    FiChevronRight,
    FiGitBranch,
    FiHome,
    FiPieChart,
} from "react-icons/fi";

import DashboardHeader from "./components/DashboardHeader";
import DashboardGrid from "./components/DashboardGrid";
import WidgetRenderer from "./WidgetRenderer";
import LoadingDashboard from "./components/LoadingDashboard";
import EmptyDashboard from "./components/EmptyDashboard";
import useDashboard from "./hooks/useDashboard";
import SelfCheckWorkspace from "../AuditeeDashboard/SelfCheckWorkSpace";

/*
 * Dashboard-specific CSS lives in this file.
 * DashboardLayout.jsx remains the ONLY owner of the page background.
 * The rules are scoped to .dpa-dashboard to avoid affecting other pages.
 */
const dashboardStyles = String.raw`
.dpa-dashboard {
    --dpa-ink: #18324e;
    --dpa-muted: #687c91;
    --dpa-line: #e2e9f1;
    --dpa-surface: #ffffff;

    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
    color: var(--text-primary, #14283f);
}

.dpa-dashboard *,
.dpa-dashboard *::before,
.dpa-dashboard *::after {
    box-sizing: border-box;
}

/* Breadcrumb and workspace badge */
.dpa-dashboard .dpa-breadcrumb-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.dpa-dashboard .dpa-breadcrumb {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    font-size: 12px;
    font-weight: 550;
    color: var(--dpa-muted);
}

.dpa-dashboard .dpa-breadcrumb svg {
    flex: 0 0 auto;
    font-size: 15px;
}

.dpa-dashboard .dpa-breadcrumb-current {
    color: var(--dpa-ink);
    font-weight: 700;
}

.dpa-dashboard .dpa-role-tag {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 11px;
    background: #edf4fc;
    color: #23527f;
    border: 1px solid #d7e6f5;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.dpa-dashboard .dpa-role-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #2872bb;
    border-radius: 50%;
}

/* Section headings */
.dpa-dashboard .dpa-section-list {
    display: flex;
    flex-direction: column;
    gap: 32px;
    min-width: 0;
}

.dpa-dashboard .dpa-section {
    min-width: 0;
}

.dpa-dashboard .dpa-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
}

.dpa-dashboard .dpa-section-head-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.dpa-dashboard .dpa-section-symbol {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    border: 1px solid #d8e6f7;
    border-radius: 12px;
    color: #265c9a;
    background: #eaf3ff;
}

.dpa-dashboard .dpa-symbol--orange {
    color: #a66c23;
    border-color: #f5e0bf;
    background: #fff6e8;
}

.dpa-dashboard .dpa-symbol--green {
    color: #197954;
    border-color: #ccebdc;
    background: #eaf9f0;
}

.dpa-dashboard .dpa-section-copy {
    min-width: 0;
}

.dpa-dashboard .dpa-section-kicker {
    display: block;
    margin-bottom: 4px;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.4;
    letter-spacing: .105em;
    color: #7a8da1;
}

.dpa-dashboard .dpa-section-title {
    margin: 0;
    color: var(--dpa-ink);
    font-size: clamp(17px, 1.5vw, 21px);
    font-weight: 750;
    line-height: 1.3;
    letter-spacing: -.025em;
}

.dpa-dashboard .dpa-section-description {
    margin: 5px 0 0;
    color: var(--dpa-muted);
    font-size: 12.5px;
    line-height: 1.5;
}

.dpa-dashboard .dpa-section-count {
    flex: 0 0 auto;
    padding: 7px 11px;
    border: 1px solid var(--dpa-line);
    border-radius: 8px;
    background: #fff;
    color: #587087;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

/* KPI GRID - one, two, or four columns depending on screen size */
.dpa-dashboard .dpa-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    min-width: 0;
}

/* Individual KPI surfaces wrap the existing WidgetRenderer's stat card.
   Data and icons remain controlled by the existing widget implementation. */
.dpa-dashboard .dpa-kpi {
    --kpi-accent: #3565d7;
    --kpi-tint: #edf3ff;

    position: relative;
    isolation: isolate;
    overflow: hidden;
    min-width: 0;
    min-height: 152px;
    padding: 22px 20px 21px;
    border: 1px solid var(--dpa-line);
    border-radius: 16px;
    background: linear-gradient(145deg, #ffffff 42%, var(--kpi-tint) 180%);
    box-shadow: 0 3px 7px rgba(24, 48, 76, .025),
                0 12px 28px rgba(24, 48, 76, .045);
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.dpa-dashboard .dpa-kpi::before {
    content: "";
    position: absolute;
    z-index: 0;
    left: 20px;
    top: 0;
    width: 56px;
    height: 3px;
    border-radius: 0 0 8px 8px;
    background: var(--kpi-accent);
}

.dpa-dashboard .dpa-kpi::after {
    content: "";
    pointer-events: none;
    position: absolute;
    z-index: 0;
    right: -46px;
    bottom: -66px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 24px solid var(--kpi-tint);
    opacity: .55;
}

.dpa-dashboard .dpa-kpi--blue {
    --kpi-accent: #4e56e9;
    --kpi-tint: #eef0ff;
}

.dpa-dashboard .dpa-kpi--cyan {
    --kpi-accent: #0891b2;
    --kpi-tint: #eafaff;
}

.dpa-dashboard .dpa-kpi--green {
    --kpi-accent: #0e9e74;
    --kpi-tint: #eafaf3;
}

.dpa-dashboard .dpa-kpi--red {
    --kpi-accent: #db4b59;
    --kpi-tint: #fff0f1;
}

.dpa-dashboard .dpa-kpi:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--kpi-accent) 24%, #e2e9f1);
    box-shadow: 0 7px 14px rgba(24, 48, 76, .045),
                0 18px 34px rgba(24, 48, 76, .075);
}

/* Remove the old heavy border/background of the stat card root ONLY.
   This does not affect the icon's coloured background inside the card. */
.dpa-dashboard .dpa-kpi > * {
    position: relative;
    z-index: 1;
    width: 100%;
    min-width: 0;
    height: 100%;
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    background-image: none !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
}

/* Improve the typography of typical Tailwind-based stat card markup. */
.dpa-dashboard .dpa-kpi :is(h2, h3, h4) {
    color: #152d48;
}

.dpa-dashboard .dpa-kpi :is([class~="text-3xl"], [class~="text-4xl"]) {
    color: #112945 !important;
    font-size: clamp(29px, 2.2vw, 37px) !important;
    font-weight: 800 !important;
    letter-spacing: -.055em;
    line-height: 1.2;
}

.dpa-dashboard .dpa-kpi :is([class~="text-gray-400"], [class~="text-slate-400"]) {
    color: #65798d !important;
}

/* Workflow, charts and operations use their existing functional widgets. */
.dpa-dashboard .dpa-widget-area,
.dpa-dashboard .dpa-chart-area {
    min-width: 0;
}

.dpa-dashboard .dpa-operations-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
    align-items: start;
    gap: 20px;
    min-width: 0;
}

.dpa-dashboard .dpa-operations-grid > * {
    min-width: 0;
}

/* Responsive breakpoints */
@media (max-width: 1279px) {
    .dpa-dashboard .dpa-kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 1000px) {
    .dpa-dashboard .dpa-operations-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 640px) {
    .dpa-dashboard {
        gap: 18px;
    }

    .dpa-dashboard .dpa-section-list {
        gap: 26px;
    }

    .dpa-dashboard .dpa-breadcrumb-row {
        gap: 10px;
    }

    .dpa-dashboard .dpa-section-head {
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 15px;
    }

    .dpa-dashboard .dpa-section-head-left {
        align-items: flex-start;
        gap: 10px;
    }

    .dpa-dashboard .dpa-section-symbol {
        width: 38px;
        height: 38px;
        flex-basis: 38px;
        border-radius: 10px;
    }

    .dpa-dashboard .dpa-section-title {
        font-size: 18px;
    }

    .dpa-dashboard .dpa-section-description {
        font-size: 12px;
    }

    .dpa-dashboard .dpa-section-count {
        display: none;
    }

    .dpa-dashboard .dpa-kpi-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 13px;
    }

    .dpa-dashboard .dpa-kpi {
        min-height: 140px;
        padding: 20px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .dpa-dashboard .dpa-kpi {
        transition: none;
    }

    .dpa-dashboard .dpa-kpi:hover {
        transform: none;
    }
}
`;

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}") || {};
    } catch {
        return {};
    }
}

function getStatTone(widget, index) {
    const possibleLabels = [
        widget.title,
        widget.label,
        widget.data?.title,
        widget.data?.label,
        widget.config?.title,
        widget.props?.title,
    ];

    const label = possibleLabels.filter((value) => typeof value === "string")
        .join(" ")
        .toLowerCase();

    if (/reject|fail|declin/.test(label)) return "red";
    if (/complet|approv|success/.test(label)) return "green";
    if (/progress|pending|process|ongoing/.test(label)) return "cyan";
    if (/total|overall|received|all applications/.test(label)) return "blue";

    return ["blue", "cyan", "green", "red"][index % 4];
}

function SectionHeading({ id, eyebrow, title, subtitle, icon: Icon, tone = "blue", meta }) {
    return (
        <div className="dpa-section-head">
            <div className="dpa-section-head-left">
                <span className={`dpa-section-symbol dpa-symbol--${tone}`}>
                    <Icon aria-hidden="true" size={20} />
                </span>
                <div className="dpa-section-copy">
                    <span className="dpa-section-kicker">{eyebrow}</span>
                    <h2 className="dpa-section-title" id={id}>{title}</h2>
                    <p className="dpa-section-description">{subtitle}</p>
                </div>
            </div>
            {meta && <span className="dpa-section-count">{meta}</span>}
        </div>
    );
}

export default function Dashboard({ auditMode }) {

    const normalizedAuditMode = String(auditMode || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

    if (normalizedAuditMode === "self_check") {
        return <SelfCheckWorkspace />;
    }

    return <DashboardOverview />;
}

function DashboardOverview() {
    const user = getStoredUser();
    const roleMap = { 1: "admin", 2: "auditor", 3: "auditee" };
    const role = roleMap[Number(user.role)] ||
        (typeof user.role === "string" ? user.role.toLowerCase() : "admin");

    const { loading, connected, dashboard } = useDashboard(role);
    const widgets = Array.isArray(dashboard?.widgets) ? dashboard.widgets : [];

    if (loading) {
        return (
            <div className="dpa-dashboard" role="status" aria-label="Loading dashboard">
                <style>{dashboardStyles}</style>
                {/* <LoadingDashboard /> */}
            </div>
        );
    }

    if (widgets.length === 0) {
        return (
            <div className="dpa-dashboard">
                <style>{dashboardStyles}</style>
                <EmptyDashboard />
            </div>
        );
    }

    const statCards = widgets.filter((widget) => widget.type === "stat_card");
    const pipeline = widgets.find((widget) => widget.type === "pipeline");
    const activity = widgets.find((widget) => widget.type === "activity");
    const notifications = widgets.find((widget) => widget.type === "notifications");
    const charts = widgets.filter((widget) =>
        ["pie_chart", "bar_chart", "line_chart"].includes(widget.type)
    );

    const isAdmin = role === "admin";
    const roleLabel = {
        admin: "Administrator",
        auditor: "Auditor",
        auditee: "Auditee",
    }[role] || "User";

    return (
        <div className="dpa-dashboard">
            <style>{dashboardStyles}</style>

            <div className="dpa-breadcrumb-row">
                <nav className="dpa-breadcrumb" aria-label="Breadcrumb">
                    <FiHome aria-hidden="true" />
                    <span>Workspace</span>
                    <FiChevronRight aria-hidden="true" />
                    <span className="dpa-breadcrumb-current" aria-current="page">
                        Dashboard
                    </span>
                </nav>
                <span className="dpa-role-tag">
                    <span className="dpa-role-dot" aria-hidden="true" />
                    {roleLabel} workspace
                </span>
            </div>

            <DashboardHeader connected={connected} user={user} />

            <div className="dpa-section-list">
                {statCards.length > 0 && (
                    <section className="dpa-section" aria-labelledby="dpa-overview-title">
                        <SectionHeading
                            id="dpa-overview-title"
                            eyebrow="KEY PERFORMANCE INDICATORS"
                            title="Platform Overview"
                            subtitle="Application statistics and audit performance at a glance."
                            icon={FiBarChart2}
                            tone="blue"
                            meta={`${statCards.length} indicators`}
                        />
                        <div className="dpa-kpi-grid">
                            {statCards.map((widget, index) => (
                                <div
                                    className={`dpa-kpi dpa-kpi--${getStatTone(widget, index)}`}
                                    key={widget.id ?? widget.key ?? `stat-${index}`}
                                >
                                    <WidgetRenderer widget={widget} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {isAdmin && pipeline && (
                    <section className="dpa-section" aria-labelledby="dpa-workflow-title">
                        <SectionHeading
                            id="dpa-workflow-title"
                            eyebrow="PROCESS MONITORING"
                            title="Audit Workflow"
                            subtitle="Monitor application movement through the audit lifecycle."
                            icon={FiGitBranch}
                            tone="orange"
                        />
                        <div className="dpa-widget-area">
                            <WidgetRenderer widget={pipeline} />
                        </div>
                    </section>
                )}

                {isAdmin && charts.length > 0 && (
                    <section className="dpa-section" aria-labelledby="dpa-insights-title">
                        <SectionHeading
                            id="dpa-insights-title"
                            eyebrow="REPORTING & ANALYTICS"
                            title="Insights & Analytics"
                            subtitle="Explore application volumes, outcomes, and audit distribution."
                            icon={FiPieChart}
                            tone="green"
                            meta={`${charts.length} ${charts.length === 1 ? "chart" : "charts"}`}
                        />
                        <div className="dpa-chart-area">
                            <DashboardGrid widgets={charts} />
                        </div>
                    </section>
                )}

                {isAdmin && (activity || notifications) && (
                    <div className="dpa-operations-grid">
                        {activity && (
                            <section className="dpa-section" aria-labelledby="dpa-activity-title">
                                <SectionHeading
                                    id="dpa-activity-title"
                                    eyebrow="OPERATIONAL LOG"
                                    title="Recent Activity"
                                    subtitle="Latest recorded actions in the system."
                                    icon={FiActivity}
                                />
                                <div className="dpa-widget-area">
                                    <WidgetRenderer widget={activity} />
                                </div>
                            </section>
                        )}
                        {notifications && (
                            <section className="dpa-section" aria-labelledby="dpa-alerts-title">
                                <SectionHeading
                                    id="dpa-alerts-title"
                                    eyebrow="UPDATES & ALERTS"
                                    title="Notifications"
                                    subtitle="Items and updates requiring attention."
                                    icon={FiBell}
                                    tone="orange"
                                />
                                <div className="dpa-widget-area">
                                    <WidgetRenderer widget={notifications} />
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
