
import React, { useMemo, useState } from "react";
import {
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    FileCheck2,
    FileText,
    Globe2,
    Info,
    KeyRound,
    Languages,
    LockKeyhole,
    Network,
    Scale,
    Search,
    ShieldCheck,
    UserCheck,
    Users,
    X,
    UserRound,
    Building2,
    Database,
    Landmark,
} from "lucide-react";

// ============================================================
// OFFICIAL MEITY LINK
// ============================================================

const MEITY_RULES_URL =
    "https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa";

// ============================================================
// 22 SCHEDULED LANGUAGES OF INDIA
// ============================================================

const LANGUAGES = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
    // { code: "ur", name: "Urdu", nativeName: "اردو" },
    // { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    // { code: "mr", name: "Marathi", nativeName: "मराठी" },
    // { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
    // { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
    // { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
    // { code: "ne", name: "Nepali", nativeName: "नेपाली" },
    // { code: "kok", name: "Konkani", nativeName: "कोंकणी" },
    // { code: "ks", name: "Kashmiri", nativeName: "कॉशुर / كٲشُر" },
    // { code: "mai", name: "Maithili", nativeName: "मैथिली" },
    // { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্" },
    // { code: "doi", name: "Dogri", nativeName: "डोगरी" },
    // { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    // { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    // { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    // { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
    // { code: "bodo", name: "Bodo", nativeName: "बड़ो" },
    // { code: "santhali", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
];

// ============================================================
// LANGUAGE CONTENT
// ============================================================

const CONTENT = {
    en: {
        heroBadge: "DPDP LEARNING CENTRE",
        heroTitle: "Learn the Digital Personal Data Protection Framework",
        heroDescription:
            "Understand the key concepts, rights, responsibilities and compliance requirements under India's Digital Personal Data Protection framework.",
        officialRules: "Read Official Rules",
        explore: "Explore DPDP",
        overview: "DPDP at a Glance",
        overviewText:
            "The Digital Personal Data Protection framework establishes rules for processing digital personal data while protecting the rights of individuals.",
        act: "Digital Personal Data Protection Act, 2023",
        rules: "Digital Personal Data Protection Rules, 2025",
        principal: "Data Principal",
        fiduciary: "Data Fiduciary",
        processor: "Data Processor",
        consent: "Consent",
        rights: "Rights of Data Principals",
        responsibilities: "What an Auditee Should Know",
        notice: "Notice & Consent",
        security: "Security & Breach",
        checklist: "Quick Compliance Checklist",
        readMore: "Read the complete rules on the official MeitY website",
    },

    hi: {
        heroBadge: "DPDP लर्निंग सेंटर",
        heroTitle: "डिजिटल व्यक्तिगत डेटा संरक्षण ढांचे को समझें",
        heroDescription:
            "भारत के डिजिटल व्यक्तिगत डेटा संरक्षण ढांचे के अंतर्गत प्रमुख अवधारणाओं, अधिकारों और अनुपालन आवश्यकताओं को समझें।",
        officialRules: "आधिकारिक नियम पढ़ें",
        explore: "DPDP देखें",
        overview: "DPDP एक नज़र में",
        overviewText:
            "डिजिटल व्यक्तिगत डेटा संरक्षण ढांचा डिजिटल व्यक्तिगत डेटा के प्रसंस्करण के लिए नियम निर्धारित करता है और व्यक्तियों के अधिकारों की रक्षा करता है।",
        act: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023",
        rules: "डिजिटल व्यक्तिगत डेटा संरक्षण नियम, 2025",
        principal: "डेटा प्रिंसिपल",
        fiduciary: "डेटा फिड्यूशियरी",
        processor: "डेटा प्रोसेसर",
        consent: "सहमति",
        rights: "डेटा प्रिंसिपल के अधिकार",
        responsibilities: "ऑडिटी को क्या जानना चाहिए",
        notice: "नोटिस और सहमति",
        security: "सुरक्षा और डेटा उल्लंघन",
        checklist: "त्वरित अनुपालन चेकलिस्ट",
        readMore: "MeitY की आधिकारिक वेबसाइट पर पूरे नियम पढ़ें",
    },

    bn: {
        heroBadge: "DPDP লার্নিং সেন্টার",
        heroTitle: "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা কাঠামো জানুন",
        heroDescription:
            "ভারতের ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা কাঠামোর অধীনে গুরুত্বপূর্ণ ধারণা, অধিকার এবং সম্মতি সংক্রান্ত প্রয়োজনীয়তা বুঝুন।",
        officialRules: "অফিসিয়াল নিয়ম পড়ুন",
        explore: "DPDP দেখুন",
        overview: "DPDP এক নজরে",
        overviewText:
            "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা কাঠামো ডিজিটাল ব্যক্তিগত তথ্য প্রক্রিয়াকরণের নিয়ম নির্ধারণ করে এবং ব্যক্তির অধিকার রক্ষা করে।",
        act: "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা আইন, ২০২৩",
        rules: "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা নিয়ম, ২০২৫",
        principal: "ডেটা প্রিন্সিপাল",
        fiduciary: "ডেটা ফিডিউশিয়ারি",
        processor: "ডেটা প্রসেসর",
        consent: "সম্মতি",
        rights: "ডেটা প্রিন্সিপালের অধিকার",
        responsibilities: "অডিটির যা জানা উচিত",
        notice: "নোটিশ ও সম্মতি",
        security: "নিরাপত্তা ও ডেটা লঙ্ঘন",
        checklist: "দ্রুত কমপ্লায়েন্স চেকলিস্ট",
        readMore: "MeitY-এর অফিসিয়াল ওয়েবসাইটে সম্পূর্ণ নিয়ম পড়ুন",
    },

    as: {
        heroBadge: "DPDP লাৰ্নিং চেণ্টাৰ",
        heroTitle: "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা কাঠামো বুজক",
        heroDescription:
            "ভাৰতৰ ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা কাঠামোৰ অধীনত থকা গুৰুত্বপূৰ্ণ ধাৰণা, অধিকাৰ আৰু দায়িত্বসমূহ বুজক।",
        officialRules: "চৰকাৰী নিয়ম পঢ়ক",
        explore: "DPDP চাওক",
        overview: "DPDP এক নজৰত",
        overviewText:
            "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা কাঠামোৱে ডিজিটেল ব্যক্তিগত তথ্য প্ৰক্ৰিয়াকৰণৰ নিয়ম নিৰ্ধাৰণ কৰে আৰু ব্যক্তিৰ অধিকাৰ সুৰক্ষিত কৰে।",
        act: "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা আইন, ২০২৩",
        rules: "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা নিয়ম, ২০২৫",
        principal: "ডাটা প্ৰিন্সিপাল",
        fiduciary: "ডাটা ফিডুচিয়াৰী",
        processor: "ডাটা প্ৰচেছৰ",
        consent: "সন্মতি",
        rights: "ডাটা প্ৰিন্সিপালৰ অধিকাৰ",
        responsibilities: "অডিটিয়ে কি জানিব লাগে",
        notice: "জাননী আৰু সন্মতি",
        security: "সুৰক্ষা আৰু ডাটা লংঘন",
        checklist: "দ্ৰুত কমপ্লায়েন্স চেকলিষ্ট",
        readMore: "MeitY-ৰ চৰকাৰী ৱেবছাইটত সম্পূৰ্ণ নিয়ম পঢ়ক",
    },
};

const FALLBACK_CONTENT = CONTENT.en;

// ============================================================
// REUSABLE INFORMATION CARD
// ============================================================

const InfoCard = ({
    icon: Icon,
    title,
    description,
    number,
    accent = "blue",
}) => {
    const accentClasses = {
        violet: "bg-violet-50 border-violet-100 text-violet-700",
        blue: "bg-blue-50 border-blue-100 text-blue-700",
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
        amber: "bg-amber-50 border-amber-100 text-amber-700",
    };

    const iconClasses = {
        violet: "bg-violet-100 text-violet-700",
        blue: "bg-blue-100 text-blue-700",
        emerald: "bg-emerald-100 text-emerald-700",
        amber: "bg-amber-100 text-amber-700",
    };

    return (
        <div
            className={`
                group relative overflow-hidden rounded-2xl
                border border-slate-200 bg-white p-6
                shadow-sm transition-all duration-300
                hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70
                ${accentClasses[accent]}
            `}
        >
            {number && (
                <div className="absolute right-5 top-4 text-3xl font-bold text-slate-100">
                    {number}
                </div>
            )}

            <div
                className={`
                    relative mb-5 flex h-12 w-12 items-center justify-center
                    rounded-xl ${iconClasses[accent]}
                    transition-transform duration-300
                    group-hover:scale-110
                `}
            >
                <Icon size={23} />
            </div>

            <h3 className="relative mb-3 text-base font-bold text-[#173B70]">
                {title}
            </h3>

            <p className="relative text-sm leading-7 text-slate-600">
                {description}
            </p>
        </div>
    );
};

// ============================================================
// REUSABLE SECTION HEADER
// ============================================================

const SectionHeader = ({ number, label, title, description }) => (
    <div className="mb-7">
        <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#075EB5]">
                {number}
            </span>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#075EB5]">
                {label}
            </p>
        </div>

        <h2 className="text-2xl font-bold text-[#14213D] sm:text-3xl">
            {title}
        </h2>

        {description && (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {description}
            </p>
        )}
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const LearnDPDP = () => {
    const [language, setLanguage] = useState("en");
    const [languageOpen, setLanguageOpen] = useState(false);
    const [search, setSearch] = useState("");

    const t = CONTENT[language] || FALLBACK_CONTENT;

    const selectedLanguage = LANGUAGES.find(
        (item) => item.code === language
    );

    const filteredLanguages = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) return LANGUAGES;

        return LANGUAGES.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.nativeName.toLowerCase().includes(query)
        );
    }, [search]);

    const scrollToContent = () => {
        document
            .getElementById("dpdp-overview")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen w-full bg-[#F4F7FB] text-slate-800">

            {/* ==================================================
                TOP BAR
            ================================================== */}

            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-10">

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                            <ShieldCheck
                                size={25}
                                className="text-[#075EB5]"
                            />
                        </div>

                        <div>
                            <p className="text-base font-bold text-[#173B70]">
                                DPACOMPASS
                            </p>

                            <p className="text-xs text-slate-500">
                                Privacy Learning Centre
                            </p>
                        </div>
                    </div>

                    {/* LANGUAGE SELECTOR */}

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setLanguageOpen((prev) => !prev)
                            }
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                        >
                            <Languages
                                size={19}
                                className="text-[#075EB5]"
                            />

                            <span>
                                {selectedLanguage?.nativeName}
                            </span>

                            <ChevronDown
                                size={17}
                                className={`text-slate-500 transition-transform ${
                                    languageOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {languageOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setLanguageOpen(false)}
                                />

                                <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/50">

                                    {/* Search */}

                                    <div className="border-b border-slate-100 p-3">
                                        <div className="relative">
                                            <Search
                                                size={17}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                placeholder="Search language..."
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Languages */}

                                    <div className="max-h-80 overflow-y-auto p-2">
                                        {filteredLanguages.length > 0 ? (
                                            filteredLanguages.map((item) => (
                                                <button
                                                    type="button"
                                                    key={item.code}
                                                    onClick={() => {
                                                        setLanguage(item.code);
                                                        setLanguageOpen(false);
                                                        setSearch("");
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition cursor-pointer ${
                                                        language === item.code
                                                            ? "bg-blue-50 text-[#075EB5]"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <span className="text-sm font-medium">
                                                        {item.name}
                                                    </span>

                                                    <span className="text-sm text-slate-500">
                                                        {item.nativeName}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="px-3 py-5 text-center text-sm text-slate-500">
                                                No languages found.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ==================================================
                PAGE CONTENT
            ================================================== */}

            <main className="mx-auto w-full max-w-[1600px] px-5 py-7 md:px-8 md:py-9 lg:px-10">

                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="relative mb-12 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-sm">

                    <div className="pointer-events-none absolute inset-0 opacity-50">
                        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
                        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
                    </div>

                    <div className="relative px-6 py-12 sm:px-10 lg:px-14 lg:py-16">

                        <div className="max-w-4xl">

                            {/* Badge */}

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold tracking-wide text-[#075EB5]">
                                <BookOpen size={15} />
                                {t.heroBadge}
                            </div>

                            {/* Heading */}

                            <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-[#14213D] sm:text-4xl lg:text-5xl">
                                {t.heroTitle}
                            </h1>

                            {/* Description */}

                            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                                {t.heroDescription}
                            </p>

                            {/* Actions */}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={scrollToContent}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-md cursor-pointer"
                                >
                                    <BookOpen size={18} />
                                    {t.explore}
                                </button>

                                <a
                                    href={MEITY_RULES_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#075EB5] transition hover:-translate-y-0.5 hover:bg-blue-50 cursor-pointer"
                                >
                                    <FileText size={18} />
                                    {t.officialRules}
                                    <ArrowUpRight size={16} />
                                </a>
                            </div>
                        </div>

                        {/* Decorative icon */}

                        <div className="pointer-events-none absolute -bottom-10 -right-8 hidden lg:block">
                            <div className="flex h-72 w-72 items-center justify-center rounded-full border border-blue-200/70 bg-blue-100/30">
                                <ShieldCheck
                                    size={155}
                                    strokeWidth={1}
                                    className="text-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================================
                    OVERVIEW
                ================================================== */}

                <section id="dpdp-overview" className="mb-14 scroll-mt-28">

                    <SectionHeader
                        number="01"
                        label="Foundation"
                        title={t.overview}
                        description={t.overviewText}
                    />

                    <div className="grid gap-5 md:grid-cols-2">

                        <InfoCard
                            icon={Scale}
                            title={t.act}
                            description="The primary legislation establishing the legal framework for processing digital personal data in India and protecting the rights of Data Principals."
                            accent="violet"
                            number="01"
                        />

                        <InfoCard
                            icon={FileCheck2}
                            title={t.rules}
                            description="The Rules provide operational requirements and procedures for implementing important provisions of the DPDP framework."
                            accent="blue"
                            number="02"
                        />
                    </div>
                </section>

                {/* ==================================================
                    KEY TERMS
                ================================================== */}

                <section className="mb-14">

                    <SectionHeader
                        number="02"
                        label="Core Concepts"
                        title="Know the terminology"
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <InfoCard
                            icon={UserCheck}
                            title={t.principal}
                            description="The individual to whom the personal data relates."
                            accent="violet"
                            number="01"
                        />

                        <InfoCard
                            icon={Network}
                            title={t.fiduciary}
                            description="The person or organisation that determines the purpose and means of processing personal data."
                            accent="blue"
                            number="02"
                        />

                        <InfoCard
                            icon={Users}
                            title={t.processor}
                            description="A person or organisation that processes personal data on behalf of a Data Fiduciary."
                            accent="emerald"
                            number="03"
                        />

                        <InfoCard
                            icon={KeyRound}
                            title={t.consent}
                            description="Consent should be appropriately informed, specific and capable of being withdrawn."
                            accent="amber"
                            number="04"
                        />
                    </div>
                </section>

                {/* ==================================================
                    RIGHTS
                ================================================== */}

                <section className="mb-14">

                    <SectionHeader
                        number="03"
                        label="Data Principal"
                        title={t.rights}
                    />

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {[
                            {
                                icon: Search,
                                title: "Access Information",
                                text: "Understand what personal data is being processed and relevant information about its processing.",
                            },
                            {
                                icon: FileCheck2,
                                title: "Correction & Erasure",
                                text: "Individuals can exercise applicable rights relating to correction and erasure of personal data.",
                            },
                            {
                                icon: UserCheck,
                                title: "Grievance Redressal",
                                text: "A mechanism should exist for Data Principals to raise grievances relating to personal data processing.",
                            },
                            {
                                icon: X,
                                title: "Withdraw Consent",
                                text: "Where processing is based on consent, the Data Principal may withdraw that consent.",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Protection",
                                text: "Personal data should be handled in accordance with applicable requirements under the DPDP framework.",
                            },
                            {
                                icon: Info,
                                title: "Clear Information",
                                text: "Information provided to individuals should be clear and understandable.",
                            },
                        ].map((item, index) => (
                            <InfoCard
                                key={item.title}
                                icon={item.icon}
                                title={item.title}
                                description={item.text}
                                number={`0${index + 1}`}
                                accent={
                                    index % 3 === 0
                                        ? "violet"
                                        : index % 3 === 1
                                            ? "blue"
                                            : "emerald"
                                }
                            />
                        ))}
                    </div>
                </section>

                {/* ==================================================
                    AUDITEE RESPONSIBILITIES
                ================================================== */}

                <section className="mb-14">

                    <SectionHeader
                        number="04"
                        label="Auditee"
                        title={t.responsibilities}
                        description="Organisations handling personal data should establish appropriate governance, security and operational controls."
                    />

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        {[
                            "Know what personal data your organisation collects and why it is collected.",
                            "Maintain appropriate notices and consent mechanisms where required.",
                            "Limit collection and processing to legitimate and defined purposes.",
                            "Implement reasonable security safeguards for personal data.",
                            "Maintain mechanisms for handling Data Principal requests and grievances.",
                            "Establish appropriate data retention and deletion practices.",
                            "Maintain appropriate records, policies and evidence of compliance.",
                            "Have processes to identify, manage and respond to personal data breaches.",
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 transition-colors hover:bg-blue-50/40 md:px-7"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                    <CheckCircle2
                                        size={19}
                                        className="text-emerald-600"
                                    />
                                </div>

                                <p className="text-sm leading-7 text-slate-700 md:text-base">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ==================================================
                    NOTICE + CONSENT
                ================================================== */}

                <section className="mb-14">

                    <div className="grid gap-5 lg:grid-cols-2">

                        {/* NOTICE AND CONSENT */}

                        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm md:p-7">

                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                <ClipboardCheck size={23} />
                            </div>

                            <h3 className="text-xl font-bold text-[#173B70]">
                                {t.notice}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Before or at the time of collecting personal data,
                                organisations should provide appropriate information
                                regarding the processing, where required by the applicable
                                framework.
                            </p>

                            <div className="mt-6 space-y-4">
                                {[
                                    "Purpose of processing",
                                    "Information about the personal data being processed",
                                    "Relevant rights and mechanisms",
                                    "Clear and understandable communication",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-3 text-sm text-slate-700"
                                    >
                                        <CheckCircle2
                                            size={18}
                                            className="mt-0.5 shrink-0 text-violet-600"
                                        />
                                        <span className="leading-6">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECURITY AND BREACH */}

                        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-7">

                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <LockKeyhole size={23} />
                            </div>

                            <h3 className="text-xl font-bold text-[#173B70]">
                                {t.security}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Organisations should establish reasonable safeguards
                                designed to protect personal data against unauthorised
                                processing, loss or compromise.
                            </p>

                            <div className="mt-6 space-y-4">
                                {[
                                    "Access control",
                                    "Security safeguards",
                                    "Incident response",
                                    "Breach management",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-3 text-sm text-slate-700"
                                    >
                                        <CheckCircle2
                                            size={18}
                                            className="mt-0.5 shrink-0 text-blue-600"
                                        />
                                        <span className="leading-6">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================================
                    QUICK CHECKLIST
                ================================================== */}

                <section className="mb-14">

                    <SectionHeader
                        number="05"
                        label="Self Check"
                        title={t.checklist}
                    />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {[
                            "Personal data inventory available",
                            "Privacy notice implemented",
                            "Consent mechanism reviewed",
                            "Data processing purposes documented",
                            "Security safeguards implemented",
                            "Access controls configured",
                            "Data retention practices defined",
                            "Grievance mechanism available",
                            "Breach response process established",
                        ].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                    <CheckCircle2
                                        size={19}
                                        className="text-emerald-600"
                                    />
                                </div>

                                <span className="text-sm font-medium leading-6 text-slate-700">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ==================================================
                    OFFICIAL MEITY CTA
                ================================================== */}

                <section className="mb-10 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-sm">

                    <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-100/70 text-[#075EB5]">
                                <Globe2 size={25} />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-[#173B70]">
                                    {t.readMore}
                                </h3>

                                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                                    Refer to the official Ministry of Electronics
                                    and Information Technology publication for the
                                    complete text.
                                </p>
                            </div>
                        </div>

                        <a
                            href={MEITY_RULES_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-md cursor-pointer"
                        >
                            Read on MeitY
                            <ArrowUpRight size={17} />
                        </a>
                    </div>
                </section>

                {/* ==================================================
                    FOOTER NOTE
                ================================================== */}

                <div className="border-t border-slate-200 py-7 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <ShieldCheck
                            size={17}
                            className="text-[#075EB5]"
                        />

                        <span className="text-sm font-semibold text-[#173B70]">
                            DPACOMPASS Learning Centre
                        </span>
                    </div>

                    <p className="mx-auto max-w-3xl text-xs leading-6 text-slate-500">
                        This learning page provides a simplified overview for
                        educational and compliance-awareness purposes. Refer to
                        the official legislation and rules for authoritative
                        legal requirements.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LearnDPDP;
