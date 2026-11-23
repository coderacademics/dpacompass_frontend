import React from "react";
import background from "../assets/background.png";
import ministryLogo from "../assets/Ministry_of_Electronics_and_Information_Technology.svg.webp";
import digitalIndiaLogo from "../assets/Digital_India_logo_vector.svg";
import cdacLogo from "../assets/CDAC_logo_high_resolution.svg";
import dpacompassLogo from "../assets/DPA_COMPASS_logo_high_resolution.svg";

/**
 * Shared institutional shell for Sign In, Sign Up, OTP and other auth pages.
 * Keep page-specific form state and authentication logic in the page components.
 */
const BackgroundLayout = ({ children, contentClassName = "" }) => {
    return (
        <main className="auth-shell relative isolate flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#eaf7ff] px-4 py-32 sm:px-6 sm:py-36">
            <div
                className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${background})` }}
                aria-hidden="true"
            />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-white/10" aria-hidden="true" />

            <header className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-400 items-start justify-between gap-4 px-4 pt-4 sm:px-8 sm:pt-6 lg:px-12">
                <img
                    src={ministryLogo}
                    alt="Government of India, Ministry of Electronics and Information Technology"
                    className="h-auto w-[42%] max-w-82.5 object-contain object-top-left sm:w-[35%] lg:max-w-107.5"
                />
                <img
                    src={digitalIndiaLogo}
                    alt="Digital India"
                    className="h-auto w-[25%] max-w-42.5 object-contain object-top-right sm:w-[20%] lg:max-w-52.5"
                />
            </header>

            <div className={`relative z-10 flex w-full justify-center ${contentClassName}`}>
                {children}
            </div>

            <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-400 items-end justify-between gap-3 px-4 pb-3 sm:px-8 sm:pb-5 lg:px-12">
                <img
                    src={cdacLogo}
                    alt="C-DAC"
                    className="h-auto w-28 max-w-[28vw] object-contain object-bottom-left sm:w-37.5 lg:w-47.5"
                />
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-100/90 bg-white/75 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-700 shadow-sm backdrop-blur-sm sm:bottom-6 sm:px-5 sm:py-2 sm:text-sm">
                    Developed by <span className="font-bold text-sky-700">C-DAC</span>
                </p>
                <img
                    src={dpacompassLogo}
                    alt="DPACOMPASS"
                    className="h-auto w-28 max-w-[28vw] object-contain object-bottom-right sm:w-37.5 lg:w-47.5"
                />
            </footer>
        </main>
    );
};

export default BackgroundLayout;
