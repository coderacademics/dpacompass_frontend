
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, LogIn, Clock3 } from "lucide-react";
import { SESSION_EXPIRED_EVENT } from "../utilities/fetchWithAuth";

const SessionExpiredScreen = () => {
    const [expired, setExpired] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleSessionExpired = () => {
            setExpired(true);
        };

        window.addEventListener(
            SESSION_EXPIRED_EVENT,
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                SESSION_EXPIRED_EVENT,
                handleSessionExpired
            );
        };
    }, []);

    const handleSignIn = () => {
        setExpired(false);
        navigate("/signin", { replace: true });
    };

    if (!expired) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-slate-900/30 px-4 py-6 backdrop-blur-sm">

            {/* Background decoration */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl" />

            <div className="session-expired-card relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_25px_80px_-20px_rgba(15,23,42,0.25)] sm:p-9">

                {/* Top accent */}
                <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                {/* Icon */}
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-amber-100/70 [animation-duration:2.5s]" />

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
                        <ShieldAlert
                            size={36}
                            strokeWidth={1.8}
                            className="text-amber-600"
                        />
                    </div>

                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-red-500 text-white shadow-sm">
                        <Clock3 size={13} strokeWidth={2.5} />
                    </span>
                </div>

                {/* Heading */}
                <div className="mb-3">
                    <span className="mb-3 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
                        Authentication Required
                    </span>

                    <h2 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-[28px]">
                        Your Session Has Expired
                    </h2>
                </div>

                {/* Description */}
                <p className="mx-auto mb-7 max-w-sm text-sm leading-6 text-slate-500">
                    For your security, your current session is no longer
                    active. Please sign in again to continue using
                    <span className="font-semibold text-slate-700">
                        {" "}DPACOMPASS.
                    </span>
                </p>

                {/* Information */}
                <div className="mb-7 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-left">
                    <ShieldAlert
                        size={18}
                        className="mt-0.5 shrink-0 text-blue-600"
                    />
                    <p className="text-xs leading-5 text-slate-600">
                        Your account and saved information remain unchanged.
                        You only need to authenticate again to restore access.
                    </p>
                </div>

                {/* Sign in button */}
                <button
                    onClick={handleSignIn}
                    className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#075EB5] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-xl hover:shadow-blue-900/20 focus:outline-none focus:ring-4 focus:ring-blue-200 active:translate-y-0"
                >
                    <LogIn
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                    Sign In Again
                </button>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldAlert size={13} />
                    <span>Secure authentication powered by DPACOMPASS</span>
                </div>
            </div>

            <style>{`
                @keyframes sessionCardEnter {
                    from {
                        opacity: 0;
                        transform: translateY(24px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .session-expired-card {
                    animation: sessionCardEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .session-expired-card,
                    .session-expired-card * {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SessionExpiredScreen;
