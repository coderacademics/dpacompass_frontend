import { useCallback, useEffect, useState } from "react";
import {
    FiRefreshCw,
    FiPlus,
    FiX,
    FiAlertCircle,
} from "react-icons/fi";

import {
    getKeywordGroups,
    createKeywordGroup,
} from "../../../../services/dataBreachKeywordService";



import KeywordManager from "./KeywordManager";
import ComponentTabs from "./components/ComponentsTab";
import KeywordGroupSidebar from "./components/KeywordsGroupSidebar";

const INITIAL_FORM = {
    group_code: "",
    category_code: "",
    display_name: "",
    description: "",
    priority: 100,
};

const COMPONENT_NAMES = {
    personal_data_discovery: "Personal Data Discovery",
    crawler: "Crawler",
    privacy_policy: "Privacy Policy",
};

const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.groups)) return data.groups;
    return [];
};

const KeywordManagement = () => {
    const [selectedComponent, setSelectedComponent] = useState(
        "personal_data_discovery"
    );

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categoryForm, setCategoryForm] = useState(INITIAL_FORM);

    // ----------------------------------------
    // LOAD GROUPS
    // ----------------------------------------

    const loadGroups = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const filters = {
                component: selectedComponent,
            };

            if (statusFilter === "active") filters.is_active = true;
            if (statusFilter === "inactive") filters.is_active = false;

            const response = await getKeywordGroups(filters);
            const list = normalizeList(response);

            setGroups(list);

            setSelectedGroup((previous) => {
                if (!previous) return null;

                return list.find((item) => item.id === previous.id) || null;
            });
        } catch (err) {
            setGroups([]);
            setSelectedGroup(null);
            setError(
                err.data?.detail ||
                err.message ||
                "Unable to load keyword groups."
            );
        } finally {
            setLoading(false);
        }
    }, [selectedComponent, statusFilter]);

    useEffect(() => {
        setSelectedGroup(null);
        setSearchTerm("");
        setShowCategoryForm(false);
        setSuccess("");
        setError("");
    }, [selectedComponent]);

    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    // ----------------------------------------
    // SELECT COMPONENT / GROUP
    // ----------------------------------------

    const handleComponentChange = (component) => {
        if (component === selectedComponent) return;

        setSelectedComponent(component);
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setSuccess("");
        setError("");
        setShowCategoryForm(false);
    };

    // ----------------------------------------
    // CATEGORY FORM
    // ----------------------------------------

    const handleCategoryChange = (event) => {
        const { name, value } = event.target;

        setCategoryForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openCategoryForm = () => {
        setCategoryForm(INITIAL_FORM);
        setError("");
        setShowCategoryForm(true);
    };

    const closeCategoryForm = () => {
        if (saving) return;

        setShowCategoryForm(false);
        setCategoryForm(INITIAL_FORM);
        setError("");
    };

    const handleCreateCategory = async (event) => {
        event.preventDefault();

        if (!categoryForm.group_code.trim()) {
            setError("Group code is required.");
            return;
        }

        if (!categoryForm.display_name.trim()) {
            setError("Display name is required.");
            return;
        }

        if (
            categoryForm.priority === "" ||
            !Number.isInteger(Number(categoryForm.priority)) ||
            Number(categoryForm.priority) < 0
        ) {
            setError("Priority must be a non-negative integer.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                component: selectedComponent,
                group_code: categoryForm.group_code
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "_"),
                category_code: categoryForm.category_code.trim()
                    ? categoryForm.category_code.trim().toUpperCase()
                    : null,
                display_name: categoryForm.display_name.trim(),
                description: categoryForm.description.trim(),
                priority: Number(categoryForm.priority),
                is_active: true,
            };

            const response = await createKeywordGroup(payload);

            setShowCategoryForm(false);
            setCategoryForm(INITIAL_FORM);
            setSuccess("Category created successfully.");

            await loadGroups();

            // Select the newly created group when the API returns it.
            const createdGroup = response?.group || response?.data || response;

            if (createdGroup?.id) {
                setSelectedGroup(createdGroup);
            }
        } catch (err) {
            const data = err.data;

            const firstError = data && typeof data === "object"
                ? Object.values(data)
                    .flat()
                    .find((value) => typeof value === "string")
                : null;

            setError(firstError || err.message || "Unable to create category.");
        } finally {
            setSaving(false);
        }
    };

    // ----------------------------------------
    // RENDER
    // ----------------------------------------

    return (
        <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 xl:p-8">

            {/* PAGE HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

                <div>
                    <p className="text-sm text-slate-500 mb-2">
                        Admin Dashboard / PII-in Transit Scanner
                    </p>

                    <h1 className="text-2xl md:text-3xl font-bold">
                        Keyword Management
                    </h1>

                    <p className="text-sm md:text-base text-slate-400 mt-2">
                        Configure detection categories and keywords across scanner components.
                    </p>
                </div>

                <button
                    onClick={loadGroups}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-medium transition"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* COMPONENT TABS */}

            <ComponentTabs
                selected={selectedComponent}
                onChange={handleComponentChange}
            />

            {/* GLOBAL MESSAGES */}

            {error && !showCategoryForm && (
                <div className="flex items-center gap-3 p-4 mb-5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
                    <FiAlertCircle />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError("")}>
                        <FiX />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-3 p-4 mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm">
                    <span className="flex-1">{success}</span>
                    <button onClick={() => setSuccess("")}>
                        <FiX />
                    </button>
                </div>
            )}

            {/* CATEGORY CREATION FORM */}

            {showCategoryForm && (
                <form
                    onSubmit={handleCreateCategory}
                    className="mb-6 bg-slate-900 border border-indigo-500/30 rounded-xl p-5 md:p-6"
                >
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Create Keyword Group
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {COMPONENT_NAMES[selectedComponent]}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeCategoryForm}
                            disabled={saving}
                            className="p-2 text-slate-400 hover:text-white"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Display Name *
                            </label>
                            <input
                                name="display_name"
                                value={categoryForm.display_name}
                                onChange={handleCategoryChange}
                                required
                                placeholder="Aadhaar Detection"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Group Code *
                            </label>
                            <input
                                name="group_code"
                                value={categoryForm.group_code}
                                onChange={handleCategoryChange}
                                required
                                placeholder="PII_AADHAAR"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Category Code
                            </label>
                            <input
                                name="category_code"
                                value={categoryForm.category_code}
                                onChange={handleCategoryChange}
                                placeholder="AADHAAR"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Priority
                            </label>
                            <input
                                type="number"
                                name="priority"
                                min="0"
                                value={categoryForm.priority}
                                onChange={handleCategoryChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="md:col-span-2 xl:col-span-4">
                            <label className="block text-sm text-slate-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={categoryForm.description}
                                onChange={handleCategoryChange}
                                rows={2}
                                placeholder="Describe the purpose of this keyword group..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500 resize-y"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 mt-4">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 mt-5">
                        <button
                            type="button"
                            onClick={closeCategoryForm}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50"
                        >
                            {saving && (
                                <FiRefreshCw className="animate-spin" />
                            )}
                            {saving ? "Creating..." : "Create Category"}
                        </button>
                    </div>
                </form>
            )}


            {/* MASTER DETAIL LAYOUT */}

            {/* MASTER DETAIL LAYOUT */}

            <div
                className="w-full gap-5 items-start"
                style={{
                    display: "grid",
                    gridTemplateColumns: "320px minmax(0, 1fr)",
                    width: "100%",
                }}
            >
                {/* LEFT: KEYWORD GROUPS */}

                <div className="min-w-0 w-full">
                    <KeywordGroupSidebar
                        groups={groups}
                        selectedGroupId={selectedGroup?.id}
                        onSelect={handleGroupSelect}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        loading={loading}
                        onRefresh={loadGroups}
                        onAddCategory={openCategoryForm}
                    />
                </div>

                {/* RIGHT: KEYWORD WORKSPACE */}

                <div className="min-w-0 w-full">
                    {selectedGroup ? (
                        <KeywordManager
                            key={selectedGroup.id}
                            group={selectedGroup}
                        />
                    ) : (
                        <div className="min-h-[500px] flex flex-col items-center justify-center text-center bg-slate-900 border border-slate-800 rounded-xl p-8">
                            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-5">
                                <FiPlus size={28} />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select a Keyword Group
                            </h2>

                            <p className="text-sm text-slate-400 mt-3 max-w-md">
                                Choose a category from the left panel to view,
                                add, edit and manage its detection keywords.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KeywordManagement;