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
} from "lucide-react";

/*
 * DPACOMPASS LEARNING CENTRE
 *
 * CURRENT MODE: Static bilingual content stored in CONTENT below.
 *
 * FUTURE API INTEGRATION:
 * Keep the CONTENT data shape unchanged. When the Django API is ready,
 * replace the static CONTENT assignment with the API response and pass that
 * response through the same normalisation layer.
 *
 * Expected future response:
 * {
 *   default_language: "en",
 *   languages: [{ code: "en", name: "English", native_name: "English" },
 *               { code: "hi", name: "Hindi", native_name: "हिन्दी" }],
 *   translations: { en: { ... }, hi: { ... } }
 * }
 */

const LANGUAGES = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

const MEITY_ACT_URL =
    "https://www.meity.gov.in/content/digital-personal-data-protection-act-2023";
const MEITY_RULES_URL =
    "https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa";

/*
 * All user-facing content is centralised here.
 * Do not add page copy directly inside JSX. Add/update it in both language
 * objects so switching language changes the complete page consistently.
 */
const CONTENT = {
    en: {
        ui: {
            brandName: "DPACOMPASS",
            brandSubtitle: "Privacy Learning Centre",
            searchLanguage: "Search language...",
            noLanguagesFound: "No languages found.",
            explore: "Explore DPDP",
            readOfficialAct: "Read Official Act",
            readOfficialRules: "Read Official Rules",
            readOnMeity: "Read on MeitY",
        },
        hero: {
            badge: "DPDP LEARNING CENTRE",
            title: "Learn the Digital Personal Data Protection Framework",
            description:
                "Understand the key concepts, rights, responsibilities and compliance requirements under India's Digital Personal Data Protection framework.",
        },
        sections: [
            {
                id: "overview",
                number: "01",
                label: "Foundation",
                title: "DPDP at a Glance",
                description:
                    "The Digital Personal Data Protection framework establishes rules for processing digital personal data while protecting the rights of individuals.",
                layout: "cards",
                columns: 2,
                items: [
                    {
                        id: "act",
                        icon: "scale",
                        title: "Digital Personal Data Protection Act, 2023",
                        description:
                            "The primary legislation establishing the legal framework for processing digital personal data in India and protecting the rights of Data Principals.",
                        accent: "violet",
                        number: "01",
                    },
                    {
                        id: "rules",
                        icon: "file",
                        title: "Digital Personal Data Protection Rules, 2025",
                        description:
                            "The Rules provide operational requirements and procedures for implementing important provisions of the DPDP framework.",
                        accent: "blue",
                        number: "02",
                    },
                ],
            },
            {
                id: "terminology",
                number: "02",
                label: "Core Concepts",
                title: "Know the terminology",
                layout: "cards",
                columns: 4,
                items: [
                    {
                        id: "data-principal",
                        icon: "user",
                        title: "Data Principal",
                        description: "The individual to whom the personal data relates.",
                        accent: "violet",
                        number: "01",
                    },
                    {
                        id: "data-fiduciary",
                        icon: "network",
                        title: "Data Fiduciary",
                        description:
                            "The person or organisation that determines the purpose and means of processing personal data.",
                        accent: "blue",
                        number: "02",
                    },
                    {
                        id: "data-processor",
                        icon: "users",
                        title: "Data Processor",
                        description:
                            "A person or organisation that processes personal data on behalf of a Data Fiduciary.",
                        accent: "emerald",
                        number: "03",
                    },
                    {
                        id: "consent",
                        icon: "key",
                        title: "Consent",
                        description:
                            "Consent should be appropriately informed, specific and capable of being withdrawn.",
                        accent: "amber",
                        number: "04",
                    },
                ],
            },
            {
                id: "rights",
                number: "03",
                label: "Data Principal",
                title: "Rights of Data Principals",
                layout: "cards",
                columns: 3,
                items: [
                    {
                        id: "access",
                        icon: "search",
                        title: "Access Information",
                        description:
                            "Understand what personal data is being processed and relevant information about its processing.",
                        accent: "violet",
                    },
                    {
                        id: "correction-erasure",
                        icon: "file",
                        title: "Correction & Erasure",
                        description:
                            "Individuals can exercise applicable rights relating to correction and erasure of personal data.",
                        accent: "blue",
                    },
                    {
                        id: "grievance",
                        icon: "user",
                        title: "Grievance Redressal",
                        description:
                            "A mechanism should exist for Data Principals to raise grievances relating to personal data processing.",
                        accent: "emerald",
                    },
                    {
                        id: "withdraw-consent",
                        icon: "close",
                        title: "Withdraw Consent",
                        description:
                            "Where processing is based on consent, the Data Principal may withdraw that consent.",
                        accent: "amber",
                    },
                    {
                        id: "protection",
                        icon: "shield",
                        title: "Protection",
                        description:
                            "Personal data should be handled in accordance with applicable requirements under the DPDP framework.",
                        accent: "blue",
                    },
                    {
                        id: "clear-information",
                        icon: "info",
                        title: "Clear Information",
                        description:
                            "Information provided to individuals should be clear and understandable.",
                        accent: "violet",
                    },
                ],
            },
            {
                id: "auditee-responsibilities",
                number: "04",
                label: "Auditee",
                title: "What an Auditee Should Know",
                description:
                    "Organisations handling personal data should establish appropriate governance, security and operational controls.",
                layout: "list",
                items: [
                    { id: "inventory", title: "Know what personal data your organisation collects and why it is collected." },
                    { id: "notice-consent", title: "Maintain appropriate notices and consent mechanisms where required." },
                    { id: "purpose", title: "Limit collection and processing to legitimate and defined purposes." },
                    { id: "safeguards", title: "Implement reasonable security safeguards for personal data." },
                    { id: "requests", title: "Maintain mechanisms for handling Data Principal requests and grievances." },
                    { id: "retention", title: "Establish appropriate data retention and deletion practices." },
                    { id: "records", title: "Maintain appropriate records, policies and evidence of compliance." },
                    { id: "breach", title: "Have processes to identify, manage and respond to personal data breaches." },
                ],
            },
            {
                id: "notice-security",
                number: "05",
                label: "Operational Controls",
                title: "Notice, Consent, Security & Breach Management",
                layout: "two_column",
                items: [
                    {
                        id: "notice-consent",
                        icon: "clipboard",
                        title: "Notice & Consent",
                        description:
                            "Before or at the time of collecting personal data, organisations should provide appropriate information regarding the processing, where required by the applicable framework.",
                        points: [
                            { id: "purpose", text: "Purpose of processing" },
                            { id: "data", text: "Information about the personal data being processed" },
                            { id: "rights", text: "Relevant rights and mechanisms" },
                            { id: "communication", text: "Clear and understandable communication" },
                        ],
                    },
                    {
                        id: "security-breach",
                        icon: "lock",
                        title: "Security & Breach",
                        description:
                            "Organisations should establish reasonable safeguards designed to protect personal data against unauthorised processing, loss or compromise.",
                        points: [
                            { id: "access", text: "Access control" },
                            { id: "safeguards", text: "Security safeguards" },
                            { id: "response", text: "Incident response" },
                            { id: "management", text: "Breach management" },
                        ],
                    },
                ],
            },
            {
                id: "checklist",
                number: "06",
                label: "Self Check",
                title: "Quick Compliance Checklist",
                layout: "checklist",
                items: [
                    { id: "inventory", title: "Personal data inventory available" },
                    { id: "notice", title: "Privacy notice implemented" },
                    { id: "consent", title: "Consent mechanism reviewed" },
                    { id: "purpose", title: "Data processing purposes documented" },
                    { id: "safeguards", title: "Security safeguards implemented" },
                    { id: "access", title: "Access controls configured" },
                    { id: "retention", title: "Data retention practices defined" },
                    { id: "grievance", title: "Grievance mechanism available" },
                    { id: "breach", title: "Breach response process established" },
                ],
            },
        ],
        officialResource: {
            title: "Read the official DPDP Act and Rules",
            description:
                "Refer to the official Ministry of Electronics and Information Technology publications for the complete text of the Act and Rules.",
            actButton: "Read DPDP Act",
            rulesButton: "Read DPDP Rules",
            url: MEITY_RULES_URL,
            actUrl: MEITY_ACT_URL,
        },
        footer: {
            title: "DPACOMPASS Learning Centre",
            disclaimer:
                "This learning page provides a simplified overview for educational and compliance-awareness purposes. Refer to the official legislation and rules for authoritative legal requirements.",
        },
    },

    hi: {
        ui: {
            brandName: "DPACOMPASS",
            brandSubtitle: "गोपनीयता शिक्षण केंद्र",
            searchLanguage: "भाषा खोजें...",
            noLanguagesFound: "कोई भाषा नहीं मिली।",
            explore: "DPDP के बारे में जानें",
            readOfficialAct: "आधिकारिक अधिनियम पढ़ें",
            readOfficialRules: "आधिकारिक नियम पढ़ें",
            readOnMeity: "MeitY पर पढ़ें",
        },
        hero: {
            badge: "DPDP शिक्षण केंद्र",
            title: "डिजिटल व्यक्तिगत डेटा संरक्षण रूपरेखा को समझें",
            description:
                "भारत की डिजिटल व्यक्तिगत डेटा संरक्षण रूपरेखा के अंतर्गत प्रमुख अवधारणाओं, अधिकारों, जिम्मेदारियों और अनुपालन आवश्यकताओं को समझें।",
        },
        sections: [
            {
                id: "overview",
                number: "01",
                label: "आधारभूत जानकारी",
                title: "DPDP एक नज़र में",
                description:
                    "डिजिटल व्यक्तिगत डेटा संरक्षण रूपरेखा डिजिटल व्यक्तिगत डेटा के प्रसंस्करण के लिए नियम निर्धारित करती है और व्यक्तियों के अधिकारों की रक्षा करती है।",
                layout: "cards",
                columns: 2,
                items: [
                    {
                        id: "act",
                        icon: "scale",
                        title: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023",
                        description:
                            "यह भारत में डिजिटल व्यक्तिगत डेटा के प्रसंस्करण के लिए कानूनी रूपरेखा स्थापित करने और डेटा प्रिंसिपल के अधिकारों की रक्षा करने वाला प्रमुख कानून है।",
                        accent: "violet",
                        number: "01",
                    },
                    {
                        id: "rules",
                        icon: "file",
                        title: "डिजिटल व्यक्तिगत डेटा संरक्षण नियम, 2025",
                        description:
                            "ये नियम DPDP रूपरेखा के महत्वपूर्ण प्रावधानों को लागू करने के लिए प्रक्रियाएँ और परिचालन संबंधी आवश्यकताएँ निर्धारित करते हैं।",
                        accent: "blue",
                        number: "02",
                    },
                ],
            },
            {
                id: "terminology",
                number: "02",
                label: "मुख्य अवधारणाएँ",
                title: "प्रमुख शब्दावली जानें",
                layout: "cards",
                columns: 4,
                items: [
                    {
                        id: "data-principal",
                        icon: "user",
                        title: "डेटा प्रिंसिपल (Data Principal)",
                        description: "वह व्यक्ति जिससे संबंधित व्यक्तिगत डेटा है।",
                        accent: "violet",
                        number: "01",
                    },
                    {
                        id: "data-fiduciary",
                        icon: "network",
                        title: "डेटा फिड्यूशियरी (Data Fiduciary)",
                        description:
                            "वह व्यक्ति या संगठन जो व्यक्तिगत डेटा के प्रसंस्करण का उद्देश्य और तरीके निर्धारित करता है।",
                        accent: "blue",
                        number: "02",
                    },
                    {
                        id: "data-processor",
                        icon: "users",
                        title: "डेटा प्रोसेसर (Data Processor)",
                        description:
                            "वह व्यक्ति या संगठन जो डेटा फिड्यूशियरी की ओर से व्यक्तिगत डेटा का प्रसंस्करण करता है।",
                        accent: "emerald",
                        number: "03",
                    },
                    {
                        id: "consent",
                        icon: "key",
                        title: "सहमति (Consent)",
                        description:
                            "सहमति उचित जानकारी पर आधारित, विशिष्ट और वापस ली जा सकने योग्य होनी चाहिए।",
                        accent: "amber",
                        number: "04",
                    },
                ],
            },
            {
                id: "rights",
                number: "03",
                label: "डेटा प्रिंसिपल",
                title: "डेटा प्रिंसिपल के अधिकार",
                layout: "cards",
                columns: 3,
                items: [
                    {
                        id: "access",
                        icon: "search",
                        title: "जानकारी प्राप्त करने का अधिकार",
                        description:
                            "यह जानना कि किस व्यक्तिगत डेटा का प्रसंस्करण किया जा रहा है और उसके प्रसंस्करण से संबंधित जानकारी क्या है।",
                        accent: "violet",
                    },
                    {
                        id: "correction-erasure",
                        icon: "file",
                        title: "सुधार और मिटाने का अधिकार",
                        description:
                            "व्यक्ति लागू प्रावधानों के अनुसार अपने व्यक्तिगत डेटा में सुधार और उसे मिटाने के अधिकार का उपयोग कर सकते हैं।",
                        accent: "blue",
                    },
                    {
                        id: "grievance",
                        icon: "user",
                        title: "शिकायत निवारण का अधिकार",
                        description:
                            "व्यक्तिगत डेटा के प्रसंस्करण से संबंधित शिकायत दर्ज करने के लिए उपयुक्त व्यवस्था उपलब्ध होनी चाहिए।",
                        accent: "emerald",
                    },
                    {
                        id: "withdraw-consent",
                        icon: "close",
                        title: "सहमति वापस लेने का अधिकार",
                        description:
                            "जहाँ प्रसंस्करण सहमति पर आधारित है, वहाँ डेटा प्रिंसिपल अपनी सहमति वापस ले सकता है।",
                        accent: "amber",
                    },
                    {
                        id: "protection",
                        icon: "shield",
                        title: "डेटा संरक्षण",
                        description:
                            "व्यक्तिगत डेटा का प्रबंधन DPDP रूपरेखा के लागू प्रावधानों के अनुसार किया जाना चाहिए।",
                        accent: "blue",
                    },
                    {
                        id: "clear-information",
                        icon: "info",
                        title: "स्पष्ट जानकारी",
                        description:
                            "व्यक्तियों को दी जाने वाली जानकारी स्पष्ट और समझने योग्य होनी चाहिए।",
                        accent: "violet",
                    },
                ],
            },
            {
                id: "auditee-responsibilities",
                number: "04",
                label: "ऑडिटी",
                title: "ऑडिटी को क्या जानना चाहिए",
                description:
                    "व्यक्तिगत डेटा का प्रबंधन करने वाले संगठनों को उचित शासन, सुरक्षा और परिचालन नियंत्रण स्थापित करने चाहिए।",
                layout: "list",
                items: [
                    { id: "inventory", title: "जानें कि आपका संगठन कौन-सा व्यक्तिगत डेटा एकत्र करता है और उसे क्यों एकत्र किया जाता है।" },
                    { id: "notice-consent", title: "जहाँ आवश्यक हो, उचित नोटिस और सहमति व्यवस्था बनाए रखें।" },
                    { id: "purpose", title: "डेटा संग्रह और प्रसंस्करण को वैध तथा निर्धारित उद्देश्यों तक सीमित रखें।" },
                    { id: "safeguards", title: "व्यक्तिगत डेटा के लिए उचित सुरक्षा उपाय लागू करें।" },
                    { id: "requests", title: "डेटा प्रिंसिपल के अनुरोधों और शिकायतों के निपटारे की व्यवस्था बनाए रखें।" },
                    { id: "retention", title: "डेटा प्रतिधारण और मिटाने की उचित प्रक्रियाएँ निर्धारित करें।" },
                    { id: "records", title: "अनुपालन से संबंधित अभिलेख, नीतियाँ और साक्ष्य बनाए रखें।" },
                    { id: "breach", title: "व्यक्तिगत डेटा उल्लंघनों की पहचान, प्रबंधन और प्रतिक्रिया के लिए प्रक्रियाएँ रखें।" },
                ],
            },
            {
                id: "notice-security",
                number: "05",
                label: "परिचालन नियंत्रण",
                title: "नोटिस, सहमति, सुरक्षा और डेटा उल्लंघन प्रबंधन",
                layout: "two_column",
                items: [
                    {
                        id: "notice-consent",
                        icon: "clipboard",
                        title: "नोटिस और सहमति",
                        description:
                            "लागू रूपरेखा के अनुसार, व्यक्तिगत डेटा एकत्र करने से पहले या उसके समय संगठन को प्रसंस्करण के संबंध में उपयुक्त जानकारी प्रदान करनी चाहिए।",
                        points: [
                            { id: "purpose", text: "प्रसंस्करण का उद्देश्य" },
                            { id: "data", text: "प्रसंस्कृत किए जा रहे व्यक्तिगत डेटा की जानकारी" },
                            { id: "rights", text: "संबंधित अधिकार और उनका उपयोग करने की व्यवस्था" },
                            { id: "communication", text: "स्पष्ट और समझने योग्य संचार" },
                        ],
                    },
                    {
                        id: "security-breach",
                        icon: "lock",
                        title: "सुरक्षा और डेटा उल्लंघन",
                        description:
                            "संगठनों को व्यक्तिगत डेटा को अनधिकृत प्रसंस्करण, हानि या समझौते से बचाने के लिए उचित सुरक्षा उपाय स्थापित करने चाहिए।",
                        points: [
                            { id: "access", text: "पहुँच नियंत्रण" },
                            { id: "safeguards", text: "सुरक्षा उपाय" },
                            { id: "response", text: "घटना पर प्रतिक्रिया" },
                            { id: "management", text: "डेटा उल्लंघन प्रबंधन" },
                        ],
                    },
                ],
            },
            {
                id: "checklist",
                number: "06",
                label: "स्व-जाँच",
                title: "त्वरित अनुपालन चेकलिस्ट",
                layout: "checklist",
                items: [
                    { id: "inventory", title: "व्यक्तिगत डेटा की सूची उपलब्ध है" },
                    { id: "notice", title: "गोपनीयता नोटिस लागू है" },
                    { id: "consent", title: "सहमति व्यवस्था की समीक्षा की गई है" },
                    { id: "purpose", title: "डेटा प्रसंस्करण के उद्देश्य दर्ज हैं" },
                    { id: "safeguards", title: "सुरक्षा उपाय लागू हैं" },
                    { id: "access", title: "पहुँच नियंत्रण निर्धारित हैं" },
                    { id: "retention", title: "डेटा प्रतिधारण की प्रक्रियाएँ निर्धारित हैं" },
                    { id: "grievance", title: "शिकायत निवारण व्यवस्था उपलब्ध है" },
                    { id: "breach", title: "डेटा उल्लंघन प्रतिक्रिया प्रक्रिया स्थापित है" },
                ],
            },
        ],
        officialResource: {
            title: "आधिकारिक DPDP अधिनियम और नियम पढ़ें",
            description:
                "अधिनियम और नियमों का संपूर्ण पाठ देखने के लिए इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय (MeitY) के आधिकारिक प्रकाशनों का संदर्भ लें।",
            actButton: "DPDP अधिनियम पढ़ें",
            rulesButton: "DPDP नियम पढ़ें",
            url: MEITY_RULES_URL,
            actUrl: MEITY_ACT_URL,
        },
        footer: {
            title: "DPACOMPASS शिक्षण केंद्र",
            disclaimer:
                "यह शिक्षण पृष्ठ शैक्षिक और अनुपालन-जागरूकता उद्देश्यों के लिए एक सरल परिचय प्रदान करता है। प्रामाणिक कानूनी आवश्यकताओं के लिए आधिकारिक अधिनियम और नियमों का संदर्भ लें।",
        },
    },
};

const ICONS = {
    book: BookOpen,
    shield: ShieldCheck,
    check: CheckCircle2,
    file: FileText,
    search: Search,
    scale: Scale,
    user: UserCheck,
    network: Network,
    users: Users,
    key: KeyRound,
    close: X,
    info: Info,
    clipboard: ClipboardCheck,
    lock: LockKeyhole,
    globe: Globe2,
};

const ACCENTS = {
    violet: {
        card: "border-violet-100",
        icon: "bg-violet-100 text-violet-700",
    },
    blue: {
        card: "border-blue-100",
        icon: "bg-blue-100 text-blue-700",
    },
    emerald: {
        card: "border-emerald-100",
        icon: "bg-emerald-100 text-emerald-700",
    },
    amber: {
        card: "border-amber-100",
        icon: "bg-amber-100 text-amber-700",
    },
};

const getIcon = (name) => ICONS[String(name || "").toLowerCase()] || FileText;

const InfoCard = ({ item }) => {
    const Icon = getIcon(item.icon);
    const accent = ACCENTS[item.accent] || ACCENTS.blue;

    return (
        <article className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${accent.card}`}>
            {item.number && (
                <span className="absolute right-5 top-4 text-3xl font-bold text-slate-100">
                    {item.number}
                </span>
            )}
            <div className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${accent.icon} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={23} />
            </div>
            <h3 className="relative mb-3 text-base font-bold text-[#173B70]">
                {item.title}
            </h3>
            <p className="relative whitespace-pre-line text-sm leading-7 text-slate-600">
                {item.description}
            </p>
        </article>
    );
};

const SectionHeader = ({ section }) => (
    <div className="mb-7">
        <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#075EB5]">
                {section.number}
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#075EB5]">
                {section.label}
            </p>
        </div>
        <h2 className="text-2xl font-bold text-[#14213D] sm:text-3xl">
            {section.title}
        </h2>
        {section.description && (
            <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600 md:text-base">
                {section.description}
            </p>
        )}
    </div>
);

const ContentSection = ({ section }) => {
    const items = Array.isArray(section.items) ? section.items : [];

    if (section.layout === "list" || section.layout === "checklist") {
        return (
            <section className="mb-14">
                <SectionHeader section={section} />
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {items.map((item, index) => (
                        <div key={item.id ?? index} className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 transition-colors hover:bg-blue-50/40 md:px-7">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                <CheckCircle2 size={19} className="text-emerald-600" />
                            </div>
                            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 md:text-base">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (section.layout === "two_column") {
        return (
            <section className="mb-14">
                {section.title && <SectionHeader section={section} />}
                <div className="grid gap-5 lg:grid-cols-2">
                    {items.map((item) => {
                        const Icon = getIcon(item.icon);
                        return (
                            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Icon size={23} />
                                </div>
                                <h3 className="text-xl font-bold text-[#173B70]">{item.title}</h3>
                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{item.description}</p>
                                <div className="mt-6 space-y-4">
                                    {item.points.map((point) => (
                                        <div key={point.id} className="flex items-start gap-3 text-sm text-slate-700">
                                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
                                            <span className="leading-6">{point.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        );
    }

    return (
        <section className="mb-14">
            <SectionHeader section={section} />
            <div className={`grid gap-5 ${section.columns === 2 ? "md:grid-cols-2" : section.columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                {items.map((item) => (
                    <InfoCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
};

const LearnDPDP = ({ contentData = null }) => {
    /*
     * Static now; API later:
     * const source = contentData || CONTENT;
     * If the API returns { translations: { en, hi } }, normalise it here.
     */
    const source = contentData?.translations || contentData || CONTENT;
    const [language, setLanguage] = useState("en");
    const [languageOpen, setLanguageOpen] = useState(false);
    const [search, setSearch] = useState("");

    const t = source[language] || source.en || CONTENT.en;
    const selectedLanguage = LANGUAGES.find((item) => item.code === language);

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
        document.getElementById("dpdp-overview")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen w-full bg-[#F4F7FB] text-slate-800">
            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                            <ShieldCheck size={25} className="text-[#075EB5]" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-[#173B70]">{t.ui.brandName}</p>
                            <p className="text-xs text-slate-500">{t.ui.brandSubtitle}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setLanguageOpen((previous) => !previous)}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                            aria-expanded={languageOpen}
                        >
                            <Languages size={19} className="text-[#075EB5]" />
                            <span>{selectedLanguage.nativeName}</span>
                            <ChevronDown size={17} className={`text-slate-500 transition-transform ${languageOpen ? "rotate-180" : ""}`} />
                        </button>

                        {languageOpen && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Close language selector"
                                    className="fixed inset-0 z-40 cursor-default"
                                    onClick={() => setLanguageOpen(false)}
                                />
                                <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/50">
                                    <div className="border-b border-slate-100 p-3">
                                        <div className="relative">
                                            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                value={search}
                                                onChange={(event) => setSearch(event.target.value)}
                                                placeholder={t.ui.searchLanguage}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
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
                                                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition ${language === item.code ? "bg-blue-50 text-[#075EB5]" : "text-slate-700 hover:bg-slate-50"}`}
                                                >
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                    <span className="text-sm text-slate-500">{item.nativeName}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="px-3 py-5 text-center text-sm text-slate-500">{t.ui.noLanguagesFound}</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-[1600px] px-5 py-7 md:px-8 md:py-9 lg:px-10">
                <section className="relative mb-12 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-sm">
                    <div className="pointer-events-none absolute inset-0 opacity-50">
                        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
                        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
                    </div>
                    <div className="relative px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
                        <div className="max-w-4xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold tracking-wide text-[#075EB5]">
                                <BookOpen size={15} />
                                {t.hero.badge}
                            </div>
                            <h1 className="max-w-4xl whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-[#14213D] sm:text-4xl lg:text-5xl">
                                {t.hero.title}
                            </h1>
                            <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-slate-600 sm:text-lg">
                                {t.hero.description}
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={scrollToContent}
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-md"
                                >
                                    <BookOpen size={18} />
                                    {t.ui.explore}
                                </button>
                                <a
                                    href={t.officialResource.actUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#075EB5] transition hover:-translate-y-0.5 hover:bg-blue-50"
                                >
                                    <FileText size={18} />
                                    {t.ui.readOfficialAct}
                                    <ArrowUpRight size={16} />
                                </a>
                                <a
                                    href={t.officialResource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#075EB5] transition hover:-translate-y-0.5 hover:bg-blue-50"
                                >
                                    <FileCheck2 size={18} />
                                    {t.ui.readOfficialRules}
                                    <ArrowUpRight size={16} />
                                </a>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute -bottom-10 -right-8 hidden lg:block">
                            <div className="flex h-72 w-72 items-center justify-center rounded-full border border-blue-200/70 bg-blue-100/30">
                                <ShieldCheck size={155} strokeWidth={1} className="text-blue-200" />
                            </div>
                        </div>
                    </div>
                </section>

                <div id="dpdp-overview" className="scroll-mt-28">
                    {t.sections.map((section) => (
                        <ContentSection key={section.id} section={section} />
                    ))}
                </div>

                <section className="mb-10 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-100/70 text-[#075EB5]">
                                <Globe2 size={25} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#173B70]">{t.officialResource.title}</h3>
                                <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-7 text-slate-600">{t.officialResource.description}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <a
                                href={t.officialResource.actUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3.5 text-sm font-semibold text-[#075EB5] transition hover:bg-blue-50"
                            >
                                {t.officialResource.actButton}
                                <ArrowUpRight size={17} />
                            </a>
                            <a
                                href={t.officialResource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-md"
                            >
                                {t.officialResource.rulesButton}
                                <ArrowUpRight size={17} />
                            </a>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-slate-200 py-7 text-center">
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <ShieldCheck size={17} className="text-[#075EB5]" />
                        <span className="text-sm font-semibold text-[#173B70]">{t.footer.title}</span>
                    </div>
                    <p className="mx-auto max-w-3xl whitespace-pre-line text-xs leading-6 text-slate-500">
                        {t.footer.disclaimer}
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default LearnDPDP;
