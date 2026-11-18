import { useRef, useState } from "react";
import {
    UploadCloud,
    FileText,
    Image as ImageIcon,
    File,
    X,
    ExternalLink,
    Paperclip,
    FolderOpen
} from "lucide-react";

import { validateEvidenceFiles } from "../utils/auditorChecklistUtils";

export default function EvidenceUploader({
    existingEvidence = [],
    newEvidence = [],
    onChange,
    disabled = false
}) {
    const inputRef = useRef(null);
    const [error, setError] = useState("");
    const [dragging, setDragging] = useState(false);

    const handleFiles = (files) => {
        const selected = Array.from(files || []);

        if (!selected.length) return;

        const { validFiles, errors } =
            validateEvidenceFiles(selected);

        setError(errors.join(" "));

        if (validFiles.length) {
            onChange([...newEvidence, ...validFiles]);
        }
    };

    const handleInputChange = (event) => {
        handleFiles(event.target.files);
        event.target.value = "";
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);

        if (!disabled) {
            handleFiles(event.dataTransfer.files);
        }
    };

    const removeNewFile = (index) => {
        onChange(newEvidence.filter((_, i) => i !== index));
    };

    const getFileIcon = (name) => {
        const extension = name.split(".").pop()?.toLowerCase();

        if (["jpg", "jpeg", "png"].includes(extension)) {
            return <ImageIcon size={18} />;
        }

        if (["pdf", "doc", "docx"].includes(extension)) {
            return <FileText size={18} />;
        }

        return <File size={18} />;
    };

    const formatSize = (size) => {
        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="w-full space-y-4">

            {/* SECTION HEADING */}

            <div className="flex items-center gap-2">
                <Paperclip size={17} className="text-blue-700" />

                <h4 className="text-sm md:text-base font-semibold text-slate-800">
                    Evidence & Attachments
                </h4>

                <span className="text-xs text-slate-500">
                    (Optional)
                </span>
            </div>

            {/* EXISTING FILES */}

            {existingEvidence.length > 0 && (
                <div className="space-y-2">

                    <p className="text-xs font-medium text-slate-500">
                        Previously uploaded evidence
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                        {existingEvidence.map((file, index) => (
                            <div
                                key={file.id || index}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="text-blue-700 shrink-0">
                                        {getFileIcon(file.name || "file")}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">
                                            {file.name || `Evidence ${index + 1}`}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Existing attachment
                                        </p>
                                    </div>
                                </div>

                                {file.url && (
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 p-2 rounded-md
                                            text-blue-700 hover:bg-blue-50"
                                        title="Open evidence"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        ))}

                    </div>
                </div>
            )}

            {/* UPLOAD AREA */}

            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!disabled) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed p-5 md:p-6 transition-colors ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"} ${disabled ? "opacity-50" : ""}`}
            >
                <div className="flex flex-col sm:flex-row
                    sm:items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-xl
                            bg-blue-50 flex items-center
                            justify-center text-blue-700 shrink-0">
                            <UploadCloud size={25} />
                        </div>

                        <div>
                            <p className="text-sm md:text-base font-semibold text-slate-800">
                                Attach supporting evidence
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                                Drag and drop files here, or browse your device.
                            </p>

                            <p className="text-xs text-slate-500 mt-2">
                                PDF, DOC, DOCX, JPG, JPEG, PNG
                                <span className="mx-1">·</span>
                                Maximum 5 MB per file
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FolderOpen size={16} />
                        Browse Files
                    </button>

                </div>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="hidden"
                />

            </div>

            {/* NEW FILES */}

            {newEvidence.length > 0 && (
                <div className="space-y-2">

                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-700">
                            Selected files
                        </p>

                        <span className="text-xs text-blue-700">
                            {newEvidence.length} file(s)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                        {newEvidence.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="text-blue-700 shrink-0">
                                        {getFileIcon(file.name)}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">
                                            {file.name}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {formatSize(file.size)}
                                            {" · "}
                                            Ready to upload
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => removeNewFile(index)}
                                    className="p-2 rounded-md text-slate-500
                                        hover:text-red-700 hover:bg-red-500/10
                                        disabled:opacity-50"
                                    title="Remove file"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-700">
                    {error}
                </p>
            )}

        </div>
    );
}
