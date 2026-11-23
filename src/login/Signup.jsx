import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";
import BackgroundLayout from "./BackgroundLayout";


const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm";
const VERIFY_EMAIL_OTP_ENDPOINT = "/api/auth/verify-email/";
const RESEND_EMAIL_OTP_ENDPOINT = "/api/auth/resend-email-otp/";
const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 5 * 60;

const PendingApproval = ({ onBack }) => (
    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/95 p-7 text-center text-white shadow-2xl backdrop-blur-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-amber-400">Approval Pending</h1>
        <p className="text-sm leading-relaxed text-slate-300">
            Your email has been verified and your registration has been submitted successfully.
            Your account approval is pending at the administration end. You will be notified once
            your account is reviewed and activated. Please try logging in after approval.
        </p>
        <div className="my-5 border-t border-slate-700" />
        <button
            type="button"
            onClick={onBack}
            className="w-full rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 py-2.5 font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
        >
            Back to Login
        </button>
    </div>
);



const Signup = () => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    const [emailOtpSent, setEmailOtpSent] = useState(false);

    const [showEmailOtpScreen, setShowEmailOtpScreen] = useState(false);

    const [isRegistrationLeaving, setIsRegistrationLeaving] = useState(false);

    const [emailVerified, setEmailVerified] = useState(false);

    const [registrationComplete, setRegistrationComplete] = useState(false);

    const [emailChallengeId, setEmailChallengeId] = useState("");

    const [emailOtp, setEmailOtp] = useState(Array(OTP_LENGTH).fill(""));

    const [emailOtpLoading, setEmailOtpLoading] = useState(false);

    const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);

    const [emailResendLoading, setEmailResendLoading] = useState(false);

    const [emailResendSeconds, setEmailResendSeconds] = useState(0);

    const emailOtpRefs = React.useRef([]);

    const [formData, setFormData] = useState({

        email: "",

        username: "",

        password: "",

        first_name: "",

        last_name: "",

        organization: "",

        designation: "",

        role: 0,

    });



    useEffect(() => {

        const fetchRoles = async () => {

            try {

                const res = await fetch(`${API_BASE_URL}/api/roles/`);

                const data = await res.json();

                setRoles(data);



                if (data.length > 0) {

                    setFormData((prev) => ({

                        ...prev,

                        role: data[0].name,

                    }));

                } else {

                    toast.error("Roles could not be loaded. Something went wrong!!");

                }

            } catch (err) {

                console.error("Failed to fetch roles", err);

            }

        };



        fetchRoles();

    }, []);



    const handleChange = (e) => {

        const { name, value } = e.target;



        setFormData({

            ...formData,

            [name]: name === "role" ? parseInt(value) : value,

        });

    };



    useEffect(() => {

        if (!showEmailOtpScreen || emailVerified || emailResendSeconds <= 0) return undefined;



        const timerId = window.setInterval(() => {

            setEmailResendSeconds((seconds) => Math.max(0, seconds - 1));

        }, 1000);



        return () => window.clearInterval(timerId);

    }, [showEmailOtpScreen, emailVerified, emailResendSeconds > 0]);



    const formatCountdown = (seconds) => {

        const minutes = Math.floor(seconds / 60);

        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

    };



    const maskEmail = (email) => {

        if (!email || !email.includes("@")) return email;

        const [localPart, domain] = email.split("@");

        if (localPart.length <= 4) {

            return `${localPart.slice(0, 1)}${"*".repeat(Math.max(1, localPart.length - 2))}${localPart.slice(-1)}@${domain}`;

        }

        return `${localPart.slice(0, 3)}${"*".repeat(Math.max(2, localPart.length - 6))}${localPart.slice(-3)}@${domain}`;

    };



    const resetEmailVerification = () => {

        setEmailVerified(false);

        setEmailOtpSent(false);

        setEmailChallengeId("");

        setEmailOtp(Array(OTP_LENGTH).fill(""));

        setEmailResendSeconds(0);

    };



    const handleEmailChange = (event) => {

        const nextEmail = event.target.value;

        setFormData((previous) => ({ ...previous, email: nextEmail }));

        if (emailVerified || emailOtpSent) {

            resetEmailVerification();

        }

    };



    const handleVerifyEmailOtp = async () => {

        const otp = emailOtp.join("");

        if (!emailChallengeId) {

            toast.error("Email verification session expired. Please register again.");

            return;

        }

        if (otp.length !== OTP_LENGTH || !/^[0-9]{6}$/.test(otp)) {

            toast.warn("Please enter the complete 6-digit OTP.");

            return;

        }



        try {

            setEmailVerifyLoading(true);

            const response = await fetch(`${API_BASE_URL}${VERIFY_EMAIL_OTP_ENDPOINT}`, {

                method: "POST",

                headers: { "Content-Type": "application/json", Accept: "application/json" },

                body: JSON.stringify({ challenge_id: emailChallengeId, otp }),

            });

            const data = await response.json().catch(() => ({}));



            if (!response.ok) {

                throw new Error(data?.detail || data?.message || data?.otp?.[0] || "Email verification failed.");

            }



            setEmailVerified(true);

            setEmailOtpSent(false);

            setEmailResendSeconds(0);

            setRegistrationComplete(true);

            toast.success(data?.message || "Email verified successfully. Your account is now pending admin approval.");

        } catch (err) {

            console.error("Verify email OTP error:", err);

            toast.error(err.message || "Invalid OTP. Please try again.");

        } finally {

            setEmailVerifyLoading(false);

        }

    };



    const handleResendEmailOtp = async () => {

        if (emailResendSeconds > 0 || emailResendLoading || !emailChallengeId) return;



        try {

            setEmailResendLoading(true);

            const response = await fetch(`${API_BASE_URL}${RESEND_EMAIL_OTP_ENDPOINT}`, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Accept: "application/json",

                },

                body: JSON.stringify({ challenge_id: emailChallengeId }),

            });

            const data = await response.json().catch(() => ({}));



            if (!response.ok) {

                const message = data?.message || data?.detail || data?.error ||

                    "Unable to resend email OTP. Please try again.";

                throw new Error(Array.isArray(message) ? message[0] : message);

            }



            if (data.challenge_id) setEmailChallengeId(data.challenge_id);

            setEmailOtp(Array(OTP_LENGTH).fill(""));

            setEmailResendSeconds(

                Number.isFinite(Number(data.expires_in))

                    ? Math.max(0, Number(data.expires_in))

                    : OTP_RESEND_SECONDS

            );

            toast.success(data?.message || "A new verification OTP has been sent.");

            emailOtpRefs.current[0]?.focus();

        } catch (err) {

            console.error("Resend email OTP error:", err);

            toast.error(err.message || "Unable to resend email OTP.");

        } finally {

            setEmailResendLoading(false);

        }

    };



    const handleEmailOtpChange = (index, value) => {

        const digit = value.replace(/[^0-9]/g, "").slice(-1);

        const nextOtp = [...emailOtp];

        nextOtp[index] = digit;

        setEmailOtp(nextOtp);



        if (digit && index < OTP_LENGTH - 1) {

            emailOtpRefs.current[index + 1]?.focus();

        }

    };



    const handleEmailOtpKeyDown = (index, event) => {

        if (event.key === "Backspace") {

            event.preventDefault();

            const nextOtp = [...emailOtp];

            if (nextOtp[index]) {

                nextOtp[index] = "";

                setEmailOtp(nextOtp);

            } else if (index > 0) {

                nextOtp[index - 1] = "";

                setEmailOtp(nextOtp);

                emailOtpRefs.current[index - 1]?.focus();

            }

        } else if (event.key === "ArrowLeft" && index > 0) {

            emailOtpRefs.current[index - 1]?.focus();

        } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {

            emailOtpRefs.current[index + 1]?.focus();

        }

    };



    const handleEmailOtpPaste = (event) => {
        const pasted = event.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        event.preventDefault();
        const nextOtp = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((digit, index) => { nextOtp[index] = digit; });
        setEmailOtp(nextOtp);
        emailOtpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

   const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
    formData.email.trim()
);



    const passwordChecks = {
        minLength: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[^A-Za-z0-9]/.test(formData.password),
    };

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);
    const isMatch =
        confirmPassword.length > 0 &&
        formData.password === confirmPassword;
    const isMismatch =
        confirmPassword.length > 0 &&
        formData.password !== confirmPassword;
    const handleSubmit = async (e) => {

        e.preventDefault();



        if (!isEmailValid) {

            toast.warn("Please enter a valid email address.");

            return;

        }

        if (!isPasswordValid) {

            toast.warn("Please meet all password requirements.");

            return;

        }

        if (formData.password !== confirmPassword) {

            toast.warn("Passwords do not match.");

            return;

        }



        try {

            setError("");

            setEmailOtpLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Accept: "application/json",

                },

                body: JSON.stringify(formData),

            });

            const data = await response.json().catch(() => ({}));



            if (!response.ok) {

                if (data.username || data.email || data.password) {

                    throw new Error(

                        data.username?.[0] || data.email?.[0] || data.password?.[0] ||

                        "Please check your registration details."

                    );

                }

                throw new Error(data?.detail || data?.message || "Registration could not be started.");

            }



            if (data.email_verification_required === true && data.challenge_id) {

                setEmailChallengeId(data.challenge_id);

                setEmailOtp(Array(OTP_LENGTH).fill(""));

                setEmailOtpSent(true);

                setEmailVerified(false);

                setEmailResendSeconds(

                    Number.isFinite(Number(data.expires_in))

                        ? Math.max(0, Number(data.expires_in))

                        : OTP_RESEND_SECONDS

                );



                // Animate the registration card out before rendering the OTP card.

                setIsRegistrationLeaving(true);

                toast.success(data.message || "Registration OTP sent successfully.");



                window.setTimeout(() => {

                    setShowEmailOtpScreen(true);

                    setIsRegistrationLeaving(false);

                    window.setTimeout(() => emailOtpRefs.current[0]?.focus(), 100);

                }, 380);

            } else {

                toast.success(data?.message || "Registration successful.");

                window.setTimeout(() => navigate("/signin"), 700);

            }

        } catch (err) {

            console.error("Registration error:", err);

            toast.error(err.message || "Server error. Please try again.");

        } finally {

            setEmailOtpLoading(false);

        }

    };



    return (

        <BackgroundLayout contentClassName="items-center justify-center" compact>

            <style>

                {`

                    @keyframes registrationCardExit {

                        0% { opacity: 1; transform: translateX(0) scale(1); }

                        100% { opacity: 0; transform: translateX(-42px) scale(0.97); }

                    }

                    @keyframes emailOtpCardEnter {

                        0% { opacity: 0; transform: translateX(42px) scale(0.97); }

                        100% { opacity: 1; transform: translateX(0) scale(1); }

                    }

                    @media (min-width: 768px) and (max-height: 820px) {
                        .signup-registration-card { padding: 0.8rem 1.15rem !important; }
                        .signup-registration-form { row-gap: 0.35rem !important; }
                        .signup-registration-form input,
                        .signup-registration-form select { padding-top: 0.38rem !important; padding-bottom: 0.38rem !important; }
                    }

                `}

            </style>

            <div className="flex w-full justify-center">
            {showEmailOtpScreen && !registrationComplete ? (

                <div

                    className="w-full max-w-lg rounded-2xl border border-white/80 bg-white/95 p-7 shadow-2xl shadow-sky-900/15 backdrop-blur-xl sm:p-9"

                    style={{ animation: "emailOtpCardEnter 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}

                >

                    <div className="text-center">

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">

                            DPACOMPASS

                        </h1>

                        <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-sky-500 to-blue-700" />



                        <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">

                            <FiMail size={30} />

                        </div>



                        <h2 className="mt-5 text-xl font-semibold text-slate-800">

                            Verify your email

                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">

                            Enter the one-time password sent to your registered email address.

                        </p>

                        <p className="mt-2 text-sm font-semibold text-sky-700">

                            {maskEmail(formData.email)}

                        </p>

                    </div>



                    <div className="mt-7">

                        <label className="mb-3 block text-sm font-medium text-slate-700">

                            One-time password (OTP)

                        </label>



                        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleEmailOtpPaste}>

                            {Array.from({ length: OTP_LENGTH }, (_, index) => (

                                <input

                                    key={index}

                                    ref={(element) => { emailOtpRefs.current[index] = element; }}

                                    type="text"

                                    inputMode="numeric"

                                    autoComplete={index === 0 ? "one-time-code" : "off"}

                                    aria-label={`OTP digit ${index + 1}`}

                                    value={emailOtp[index]}

                                    onChange={(event) => handleEmailOtpChange(index, event.target.value)}

                                    onKeyDown={(event) => handleEmailOtpKeyDown(index, event)}

                                    onFocus={(event) => event.target.select()}

                                    maxLength={1}

                                    className="h-12 w-10 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 sm:h-14 sm:w-12"

                                />

                            ))}

                        </div>



                        <button

                            type="button"

                            onClick={handleVerifyEmailOtp}

                            disabled={emailVerifyLoading || emailOtp.join("").length !== OTP_LENGTH}

                            className="mt-5 w-full rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-md shadow-sky-900/15 transition hover:from-sky-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"

                        >

                            {emailVerifyLoading ? "Verifying..." : "Verify OTP"}

                        </button>



                        <div className="mt-5 text-center text-sm text-slate-600">

                            {emailResendSeconds > 0 ? (

                                <>

                                    Resend OTP available in{" "}

                                    <span className="font-bold tabular-nums text-sky-700">

                                        {formatCountdown(emailResendSeconds)}

                                    </span>

                                </>

                            ) : (

                                <button

                                    type="button"

                                    onClick={handleResendEmailOtp}

                                    disabled={emailResendLoading}

                                    className="font-semibold text-sky-700 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"

                                >

                                    {emailResendLoading ? "Resending OTP..." : "Resend OTP"}

                                </button>

                            )}

                        </div>



                        <p className="mt-5 text-center text-xs leading-5 text-slate-500">

                            Enter the code from your registered email to complete registration.

                        </p>

                    </div>

                </div>

            ) : registrationComplete ? (

                <PendingApproval onBack={() => navigate("/signin")} />

            ) : (

            <div

                className="signup-registration-card w-full max-w-3xl rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-sky-900/20 backdrop-blur-xl sm:p-5 lg:p-6"

                style={isRegistrationLeaving

                    ? { animation: "registrationCardExit 360ms ease-in both", pointerEvents: "none" }

                    : undefined}

            >

                {/* Header */}

                <div className="mb-2 text-center">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">

                        DPACOMPASS

                    </h1>

                    <h2 className="mt-1 text-lg font-semibold text-slate-800">

                        Create Account

                    </h2>

                    <p className="mt-1 text-sm text-slate-600">

                        Register to access the DPDP compliance platform

                    </p>

                </div>



                {/* Form */}

                <form className="signup-registration-form space-y-2" onSubmit={handleSubmit}>

                    {/* Row 1 */}

                    <div className="grid grid-cols-2 gap-2">

                        <input

                            type="text"

                            name="first_name"

                            placeholder="First Name *"

                            className={inputClass}

                            value={formData.first_name}

                            onChange={handleChange}

                            required

                        />

                        <input

                            type="text"

                            name="last_name"

                            placeholder="Last Name *"

                            className={inputClass}

                            value={formData.last_name}

                            onChange={handleChange}

                            required

                        />

                    </div>



                    {/* Row 2 */}

                    <div className="grid grid-cols-1 gap-2">

                        <input

                            type="text"

                            name="username"

                            placeholder="Username *"

                            className={inputClass}

                            value={formData.username}

                            onChange={handleChange}

                            required

                        />

                    </div>



                    <div className="space-y-1">

                        <input

                            type="email"

                            name="email"

                            placeholder="Email *"

                            className={`${inputClass} min-w-0`}

                            value={formData.email}

                            onChange={handleEmailChange}

                            required

                            disabled={emailOtpSent || emailVerified}

                            aria-invalid={formData.email.length > 0 && !isEmailValid}

                        />

                        {formData.email.length > 0 && !isEmailValid && (

                            <p className="mt-1 text-xs text-red-600">

                                Please enter a valid email address.

                            </p>

                        )}

                        {emailVerified && (

                            <p className="text-xs font-medium text-emerald-700">

                                Email address verified successfully.

                            </p>

                        )}

                    </div>



                    <div className="grid grid-cols-1 gap-2">

                        <input

                            type="text"

                            name="organization"

                            placeholder="Organization Name *"

                            value={formData.organization}

                            onChange={handleChange}

                            className={inputClass}

                            required

                        />

                    </div>



                    {/* Row 3 */}

                    <div className="grid grid-cols-2 gap-2">

                        <select

                            className={inputClass}

                            name="role"

                            value={formData.role}

                            onChange={handleChange}

                            required

                        >

                            <option key={0} value={0}>

                                Select Role:

                            </option>

                            {roles.length > 0 ? (

                                roles.map((role) => (

                                    <option key={role.id} value={role.id}>

                                        {role.name}

                                    </option>

                                ))

                            ) : (

                                <option disabled>Loading roles...</option>

                            )}

                        </select>



                        <input

                            type="text"

                            name="designation"

                            placeholder="Designation"

                            className={inputClass}

                            value={formData.designation}

                            onChange={handleChange}

                        />

                    </div>



                    {/* Row 4 */}

                    <div className="grid grid-cols-2 gap-2">

                        {/* Password */}

                        <div>

                            <div className="relative">

                                <input

                                type={showPassword ? "text" : "password"}

                                name="password"

                                placeholder="Password *"

                                className={inputClass}

                                value={formData.password}

                                onChange={handleChange}

                                minLength={8}

                                autoComplete="new-password"

                                required

                            />



                                <button

                                    type="button"

                                    onClick={() => setShowPassword(!showPassword)}

                                    aria-label={showPassword ? "Hide password" : "Show password"}

                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-slate-700 transition"

                                >

                                    {showPassword ? (

                                        <FiEyeOff size={18} />

                                    ) : (

                                        <FiEye size={18} />

                                    )}

                                </button>

                            </div>

                            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2">

                                <p className="mb-1 text-xs font-semibold text-slate-700">

                                    Password must contain:

                                </p>

                                <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">

                                    {[

                                        ["minLength", "At least 8 characters"],

                                        ["uppercase", "At least 1 uppercase letter (A-Z)"],

                                        ["lowercase", "At least 1 lowercase letter (a-z)"],

                                        ["number", "At least 1 number (0-9)"],

                                        ["special", "At least 1 special character"],

                                    ].map(([key, label]) => (

                                        <li

                                            key={key}

                                            className={passwordChecks[key] ? "text-green-600" : "text-slate-500"}

                                        >

                                            <span className="inline-block w-4">

                                                {passwordChecks[key] ? "✓" : "○"}

                                            </span>

                                            {label}

                                        </li>

                                    ))}

                                </ul>

                            </div>

                        </div>



                        {/* Confirm Password */}

                        <div>

                            <div className="relative">

                                <input

                                type={showConfirm ? "text" : "password"}

                                placeholder="Confirm Password *"

                                className={inputClass}

                                value={confirmPassword}

                                onChange={(e) => setConfirmPassword(e.target.value)}

                                required

                            />



                                <button

                                    type="button"

                                    onClick={() => setShowConfirm(!showConfirm)}

                                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}

                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-slate-700 transition"

                                >

                                    {showConfirm ? (

                                        <FiEyeOff size={18} />

                                    ) : (

                                        <FiEye size={18} />

                                    )}

                                </button>

                            </div>



                            {confirmPassword.length > 0 && (

                                <p

                                    className={`text-xs mt-1 ${isMatch ? "text-green-400" : "text-red-400"

                                        }`}

                                >

                                    {isMatch

                                        ? "Passwords match"

                                        : "Passwords do not match"}

                                </p>

                            )}

                        </div>

                    </div>



                    {/* Button */}

                    <button

                        type="submit"

                        disabled={emailOtpLoading || emailOtpSent || isRegistrationLeaving || !isEmailValid || !isPasswordValid || !isMatch}

                        className={`w-full py-2.5 rounded-lg font-semibold mt-2 transition-all duration-200 ${!emailOtpLoading && !emailOtpSent && isEmailValid && isPasswordValid && isMatch

                                ? "bg-linear-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 hover:scale-[1.01] text-white shadow-md shadow-sky-900/20"

                                : "bg-slate-300 text-slate-500 cursor-not-allowed"

                            }`}

                    >

                        {emailOtpLoading ? "Sending verification OTP..." : emailOtpSent ? "Verify your email below" : "Create Account"}

                    </button>

                </form>



                {/* Register Link */}

                <p className="mt-2 text-center text-sm text-slate-600">

                    Already an user?{" "}

                    <a

                        href="/signin"

                        className="font-semibold text-sky-700 hover:text-blue-800"

                    >

                        Sign in

                    </a>

                </p>
            </div>

            )}
            </div>

        </BackgroundLayout>

    );

};



export default Signup;
