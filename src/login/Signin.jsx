import React, { useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";
import BackgroundLayout from "./BackgroundLayout";


const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

const Signin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        provider: "local",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [captchaKey, setCaptchaKey] = useState("");
    const [captchaImage, setCaptchaImage] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    // MFA / OTP verification state.
    const [isLeavingSignin, setIsLeavingSignin] = useState(false);
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [challengeId, setChallengeId] = useState("");
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
    const otp = otpDigits.join("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(300);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendsRemaining, setResendsRemaining] = useState(2);
    const otpInputRefs = useRef([]);

    // Username role-check state: controls the Auditee-only selector.
    // const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
    // const [isAuditee, setIsAuditee] = useState(false);
    // const [auditOptions, setAuditOptions] = useState([]);
    // const [selectedAuditOption, setSelectedAuditOption] = useState("");
    // const usernameCheckRequest = useRef(0);

    const fetchCaptcha = async () => {
        try {
            setCaptchaLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/auth/captcha/`,
                {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch CAPTCHA");
            }

            const data = await response.json();

            setCaptchaKey(data.captcha_key);
            setCaptchaImage(`${API_BASE_URL}${data.captcha_image}`);
            setCaptchaInput("");
        } catch (error) {
            console.error("CAPTCHA error:", error);
            toast.error("Unable to load CAPTCHA. Please try again.");
        } finally {
            setCaptchaLoading(false);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    // // Check the username role while the user types.
    // // Debounce requests to avoid calling the API on every keystroke.
    // useEffect(() => {
    //     const username = formData.username.trim();
    //     const requestId = ++usernameCheckRequest.current;

    //     if (!username) {
    //         setIsAuditee(false);
    //         setAuditOptions([]);
    //         setSelectedAuditOption("");
    //         setUsernameCheckLoading(false);
    //         return undefined;
    //     }

    //     const timeoutId = window.setTimeout(async () => {
    //         setUsernameCheckLoading(true);

    //         try {
    //             const response = await fetch(
    //                 `${API_BASE_URL}/api/auth/username-role-check/`,
    //                 {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Accept: "application/json",
    //                     },
    //                     body: JSON.stringify({ username }),
    //                 }
    //             );

    //             if (!response.ok) {
    //                 throw new Error(
    //                     `Username role check failed. HTTP ${response.status}`
    //                 );
    //             }

    //             const data = await response.json();

    //             // Ignore responses for an older username.
    //             if (requestId !== usernameCheckRequest.current) return;

    //             const auditee = data.is_auditee === true;
    //             const options = Array.isArray(data.audit_options)
    //                 ? data.audit_options.filter(
    //                     (option) =>
    //                         option &&
    //                         typeof option.value === "string" &&
    //                         typeof option.label === "string"
    //                 )
    //                 : [];

    //             setIsAuditee(auditee);
    //             setAuditOptions(auditee ? options : []);

    //             setSelectedAuditOption((current) => {
    //                 if (!auditee || options.length === 0) return "";

    //                 return options.some((option) => option.value === current)
    //                     ? current
    //                     : options[0].value;
    //             });

    //             if (!auditee) {
    //                 localStorage.removeItem("auditee_audit_option");
    //             }
    //         } catch (error) {
    //             if (requestId !== usernameCheckRequest.current) return;

    //             console.error("Username role check error:", error);
    //             setIsAuditee(false);
    //             setAuditOptions([]);
    //             setSelectedAuditOption("");
    //             localStorage.removeItem("auditee_audit_option");
    //         } finally {
    //             if (requestId === usernameCheckRequest.current) {
    //                 setUsernameCheckLoading(false);
    //             }
    //         }
    //     }, 400);

    //     return () => window.clearTimeout(timeoutId);
    // }, [formData.username]);

    // Five-minute resend cooldown, active only while the OTP screen is visible.
    useEffect(() => {
        if (!showOtpScreen || resendSeconds <= 0) return undefined;

        const timerId = window.setInterval(() => {
            setResendSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [showOtpScreen, resendSeconds > 0]);

    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const handleOtpChange = (index, value) => {
        const digit = value.replace(/[^0-9]/g, "").slice(-1);
        const nextDigits = [...otpDigits];
        nextDigits[index] = digit;
        setOtpDigits(nextDigits);

        if (digit && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            event.preventDefault();
            const nextDigits = [...otpDigits];

            if (nextDigits[index]) {
                nextDigits[index] = "";
                setOtpDigits(nextDigits);
            } else if (index > 0) {
                nextDigits[index - 1] = "";
                setOtpDigits(nextDigits);
                otpInputRefs.current[index - 1]?.focus();
            }
        } else if (event.key === "ArrowLeft" && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        } else if (event.key === "ArrowRight" && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (event) => {
        const pasted = event.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
        if (!pasted) return;

        event.preventDefault();
        const nextDigits = Array(6).fill("");
        pasted.split("").forEach((digit, index) => {
            nextDigits[index] = digit;
        });
        setOtpDigits(nextDigits);
        otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const maskEmail = (email) => {
        if (!email || !email.includes("@")) return email;

        const [localPart, ...domainParts] = email.split("@");
        const domain = domainParts.join("@");

        if (localPart.length <= 4) {
            return `${localPart.slice(0, 1)}${"*".repeat(Math.max(2, localPart.length - 2))}${localPart.slice(-1)}@${domain}`;
        }

        const visibleCount = localPart.length >= 8 ? 3 : 2;
        const maskedCount = Math.max(2, localPart.length - visibleCount * 2);

        return `${localPart.slice(0, visibleCount)}${"*".repeat(maskedCount)}${localPart.slice(-visibleCount)}@${domain}`;
    };

    // Request a new OTP using the existing MFA challenge.
    const handleResendOtp = async () => {
        if (resendSeconds > 0 || resendLoading || resendsRemaining <= 0) return;

        if (!challengeId) {
            toast.error("OTP session expired. Please sign in again.");
            setShowOtpScreen(false);
            setIsLeavingSignin(false);
            return;
        }

        try {
            setResendLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    challenge_id: challengeId,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message = data?.message || data?.detail || data?.error ||
                    "Unable to resend OTP. Please try again.";
                throw new Error(Array.isArray(message) ? message[0] : message);
            }

            if (data.mfa_required !== true || !data.challenge_id) {
                throw new Error("The resend OTP response is incomplete.");
            }

            setChallengeId(data.challenge_id);
            if (data.email) setOtpEmail(data.email);

            // Use the expiry and resend quota supplied by the backend.
            setResendSeconds(
                Number.isFinite(Number(data.expires_in))
                    ? Math.max(0, Number(data.expires_in))
                    : 300
            );

            if (Number.isFinite(Number(data.resends_remaining))) {
                setResendsRemaining(Math.max(0, Number(data.resends_remaining)));
            }

            setOtpDigits(Array(6).fill(""));
            otpInputRefs.current[0]?.focus();

            toast.success(
                data.message || "A new OTP has been sent to your registered email."
            );
        } catch (error) {
            console.error("Resend OTP error:", error);
            toast.error(error.message || "Unable to resend OTP. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const completeLogin = (data) => {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        // if (data.user?.role === 3 && isAuditee && selectedAuditOption) {
        //     localStorage.setItem("auditee_mode", selectedAuditOption);
        // } else {
        //     localStorage.removeItem("auditee_mode");
        //     localStorage.removeItem("auditee_audit_option");
        // }

        const role = data.user?.role;
        if (role === 3) navigate("/devdashboard");
        else if (role === 1) navigate("/admindashboard");
        else if (role === 2) navigate("/auditdashboard");
        else navigate("/dashboard");
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!challengeId) {
            toast.error("OTP session expired. Please sign in again.");
            setShowOtpScreen(false);
            setIsLeavingSignin(false);
            return;
        }

        if (!/^[0-9]{6}$/.test(otp)) {
            toast.warn("Please enter the complete 6-digit OTP.");
            return;
        }

        try {
            setOtpLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    challenge_id: challengeId,
                    otp: otp.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message = data?.message || data?.detail || data?.error ||
                    "OTP verification failed. Please check the code and try again.";
                toast.error(Array.isArray(message) ? message[0] : message);
                return;
            }

            if (!data.access || !data.refresh || !data.user) {
                toast.error("OTP verification response is incomplete.");
                return;
            }

            toast.success(data.message || "Login successful");
            completeLogin(data);
        } catch (error) {
            console.error("OTP verification error:", error);
            toast.error("Unable to verify OTP. Please try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaKey) {
            toast.warn("CAPTCHA is not loaded. Please refresh it.");
            return;
        }

        if (!captchaInput.trim()) {
            toast.warn("Please enter the CAPTCHA.");
            return;
        }

        // if (usernameCheckLoading) {
        //     toast.info("Please wait while we verify your username.");
        //     return;
        // }

        // if (isAuditee && !selectedAuditOption) {
        //     toast.warn("Please select an audit type.");
        //     return;
        // }

        try {
            setLoginLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/auth/login/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        provider: "local",
                        captcha_key: captchaKey,
                        captcha_value: captchaInput.trim(),
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                if (data.mfa_required === true && data.challenge_id) {
                    // Tokens are not issued to the frontend until OTP verification succeeds.
                    setChallengeId(data.challenge_id);
                    setOtpEmail(data.email || "");
                    setOtpDigits(Array(6).fill(""));
                    setResendSeconds(300);
                    setResendsRemaining(
                        Number.isFinite(Number(data.resends_remaining))
                            ? Math.max(0, Number(data.resends_remaining))
                            : 2
                    );
                    setIsLeavingSignin(true);

                    window.setTimeout(() => {
                        setShowOtpScreen(true);
                    }, 300);
                } else {
                    toast.error("Unexpected login response: MFA challenge details are missing.");
                    fetchCaptcha();
                }
            } else if (response.status === 403) {
                const message = Array.isArray(data?.message)
                    ? data.message[0]
                    : data?.message || data?.detail || data?.error || "";

                const normalizedMessage = String(message).toLowerCase();
                const accountStatus = String(
                    data?.account_status || data?.approval_status || data?.status || ""
                ).toLowerCase();

                const isApprovalPending =
                    normalizedMessage.includes("account not approved") ||
                    normalizedMessage.includes("approval pending") ||
                    normalizedMessage.includes("pending approval") ||
                    accountStatus === "pending" ||
                    accountStatus === "pending_approval" ||
                    data?.is_approved === false;

                if (isApprovalPending) {
                    // The PendingApproval page explains that email verification is
                    // complete but administrator approval is still required.
                    navigate("/pending", { replace: true });
                } else {
                    toast.error(message || "Forbidden");
                }

                fetchCaptcha();
            } else {
                toast.error(
                    data?.message ||
                    data?.detail ||
                    data?.error ||
                    "Invalid credentials"
                );

                fetchCaptcha();
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Server error. Try again after some time.");
        } finally {
            setLoginLoading(false);
        }
    };

    if (showOtpScreen) {
        return (
            <BackgroundLayout contentClassName="items-center">
                <div className="flex w-full justify-center">
                <section
                    className="relative z-10 w-full max-w-lg rounded-2xl border border-white/80 bg-white/90 p-7 shadow-2xl shadow-sky-900/20 backdrop-blur-xl sm:p-9"
                    style={{ animation: "otpCardEnter 450ms ease-out both" }}
                >
                    <style>
                        {`@keyframes otpCardEnter {
                            from { opacity: 0; transform: translateX(32px) scale(0.97); }
                            to { opacity: 1; transform: translateX(0) scale(1); }
                        }`}
                    </style>

                    <header className="mb-7 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            DPACOMPASS
                        </h1>
                        <div className="mx-auto my-4 h-1 w-14 rounded-full bg-linear-to-r from-sky-500 to-blue-700" />
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="1.7" className="h-8 w-8" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="m3 7 9 6 9-6" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            Verify your email
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Enter the one-time password sent to your registered email address.
                        </p>
                        {otpEmail && (
                            <p className="mt-2 break-all text-sm font-semibold text-sky-700">
                                {maskEmail(otpEmail)}
                            </p>
                        )}
                    </header>

                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label htmlFor="signin-otp"
                                className="mb-2 block text-sm font-semibold text-slate-700">
                                One-time password (OTP)
                            </label>
                            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                                {Array.from({ length: 6 }, (_, index) => (
                                    <input
                                        key={index}
                                        ref={(element) => {
                                            otpInputRefs.current[index] = element;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete={index === 0 ? "one-time-code" : "off"}
                                        aria-label={`OTP digit ${index + 1}`}
                                        value={otpDigits[index] || ""}
                                        onChange={(event) => handleOtpChange(index, event.target.value)}
                                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                                        onFocus={(event) => event.target.select()}
                                        maxLength={1}
                                        className="h-12 w-10 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 sm:h-14 sm:w-12"
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={otpLoading || !/^[0-9]{6}$/.test(otp)}
                            className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-sky-600 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:from-sky-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {otpLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        {resendSeconds > 0 ? (
                            <p className="text-sm text-slate-600">
                                Resend OTP available in{" "}
                                <span className="font-bold tabular-nums text-sky-700">
                                    {formatCountdown(resendSeconds)}
                                </span>
                            </p>
                        ) : resendsRemaining > 0 ? (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendLoading}
                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiRefreshCw className={resendLoading ? "animate-spin" : ""} size={16} />
                                {resendLoading ? "Resending OTP..." : `Resend OTP (${resendsRemaining} left)`}
                            </button>
                        ) : (
                            <p className="text-sm text-slate-500">
                                You have used all available OTP resend attempts.
                            </p>
                        )}
                    </div>

                    <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                        Enter the code from your registered email to complete sign-in.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        Secure sign-in verification
                    </div>
                </section>
                </div>
            </BackgroundLayout>
        );
    }

    return (
        <BackgroundLayout contentClassName="items-center">
            <section
                className={`relative z-10 w-full max-w-lg rounded-2xl border border-white/80 bg-white/90 p-7 shadow-2xl shadow-sky-900/20 backdrop-blur-xl transition-all duration-300 sm:p-9 ${
                    isLeavingSignin
                        ? "-translate-x-8 scale-95 opacity-0"
                        : "translate-x-0 scale-100 opacity-100"
                }`}
            >
                <header className="mb-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        DPACOMPASS
                    </h1>

                    <div className="mx-auto my-4 h-1 w-14 rounded-full bg-linear-to-r from-sky-500 to-blue-700" />

                    <h2 className="text-lg font-semibold text-slate-800">
                        Sign in to your account
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-slate-600">
                        Access your DPDP compliance dashboard securely.
                    </p>
                </header>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="signin-username"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Username
                        </label>

                        <input
                            id="signin-username"
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            className={inputClass}
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />
                    </div>

                    {/* AUDIT OPTION - AUDITEE USERS ONLY
                    {isAuditee && (
                        <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-4">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="auditee-audit-option"
                                    className="block text-sm font-semibold text-slate-800"
                                >
                                    Audit Type
                                </label>

                                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                                    Auditee
                                </span>
                            </div>

                            <p className="mb-3 text-xs leading-5 text-slate-600">
                                Select the type of audit you want to access.
                            </p>

                            <select
                                id="auditee-audit-option"
                                value={selectedAuditOption}
                                onChange={(event) =>
                                    setSelectedAuditOption(event.target.value)
                                }
                                disabled={
                                    usernameCheckLoading ||
                                    auditOptions.length === 0
                                }
                                required
                                className={inputClass}
                            >
                                {auditOptions.length === 0 ? (
                                    <option value="">
                                        No audit options available
                                    </option>
                                ) : (
                                    auditOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    )} */}

                    {/* {usernameCheckLoading && (
                        <p className="text-xs text-slate-500">
                            Checking account type...
                        </p>
                    )} */}

                    <div>
                        <label
                            htmlFor="signin-password"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                className={`${inputClass} pr-11`}
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:text-sky-700"
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <FiEyeOff size={18} />
                                ) : (
                                    <FiEye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Security verification
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex min-h-14 items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                                {captchaLoading ? (
                                    <span className="text-sm text-slate-500">
                                        Loading CAPTCHA...
                                    </span>
                                ) : captchaImage ? (
                                    <img
                                        src={captchaImage}
                                        alt="CAPTCHA challenge"
                                        className="h-10 min-w-0 flex-1 object-contain"
                                    />
                                ) : (
                                    <span className="text-sm text-slate-500">
                                        CAPTCHA unavailable
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={fetchCaptcha}
                                    disabled={captchaLoading}
                                    className="shrink-0 rounded-md p-2 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50"
                                    title="Refresh CAPTCHA"
                                    aria-label="Refresh CAPTCHA"
                                >
                                    <FiRefreshCw
                                        size={17}
                                        className={
                                            captchaLoading ? "animate-spin" : ""
                                        }
                                    />
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Enter CAPTCHA"
                                aria-label="Enter CAPTCHA"
                                className={inputClass}
                                value={captchaInput}
                                onChange={(e) =>
                                    setCaptchaInput(e.target.value)
                                }
                                autoComplete="off"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginLoading || captchaLoading}
                        className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-sky-600 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:from-sky-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loginLoading ? "Signing in..." : "Sign In"}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        New user?{" "}
                        <a
                            href="/signup"
                            className="font-semibold text-sky-700 underline-offset-4 hover:text-blue-800 hover:underline"
                        >
                            Create an account
                        </a>
                    </p>
                </form>
            </section>
        </BackgroundLayout>
    );
};

export default Signin;