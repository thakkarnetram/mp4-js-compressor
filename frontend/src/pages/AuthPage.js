import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const search = new URLSearchParams(location.search);
    const nextPath = search.get("next") || "/profile";

    useEffect(() => {
        if (step === "email") {
            const el = document.querySelector("#email");
            el?.focus();
        } else {
            inputRefs.current[0]?.focus();
        }
    }, [step]);

    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8082";

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setError("");
        setMessage("");

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "Failed to send OTP. Please try again.");
            } else {
                setMessage(data?.message || "OTP sent to your email.");
                setStep("otp");
            }
        } catch (err) {
            console.error("sendOtp error:", err);
            setError("Failed to send OTP. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").trim();
        if (!/^\d{6}$/.test(paste)) return;
        const digits = paste.split("");
        setOtp(digits);
        inputRefs.current[5]?.focus();
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault();
        setError("");
        setMessage("");

        const code = otp.join("");
        if (code.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "Invalid OTP. Please try again.");
                return;
            }

            // Expecting { ok: true, user, token } from backend
            const { user, token } = data;
            if (!user || !token) {
                setError("Invalid server response. Try again.");
                return;
            }

            login(user, token);

            navigate(nextPath, { replace: true });
        } catch (err) {
            console.error("verifyOtp error:", err);
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setMessage("");
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const data = await res.json();
            if (!res.ok) setError(data?.message || "Failed to resend OTP.");
            else setMessage(data?.message || "OTP resent.");
        } catch (err) {
            console.error("resend err", err);
            setError("Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-16 px-6 bg-slate-900 flex justify-center">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg shadow-slate-900/40"
            >
                <h2 className="text-2xl font-semibold mb-2 text-center">
                    {step === "email" ? "Sign in or Sign up" : "Enter OTP"}
                </h2>
                <p className="text-sm text-slate-400 mb-6 text-center">
                    {step === "email"
                        ? "Enter your email to receive a one-time login code."
                        : `We’ve sent a 6-digit code to ${email}`}
                </p>

                {step === "email" && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="text-left">
                            <label className="block text-sm mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                autoComplete="email"
                                type="email"
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed rounded-lg py-2 text-sm font-semibold"
                        >
                            {loading ? "Sending OTP..." : "Continue"}
                        </button>
                    </form>
                )}

                {step === "otp" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className="w-10 h-10 md:w-11 md:h-11 text-center text-lg rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed rounded-lg py-2 text-sm font-semibold"
                        >
                            {loading ? "Verifying..." : "Verify & Continue"}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={loading}
                            className="w-full text-xs text-slate-400 hover:text-slate-200 mt-2"
                        >
                            Didn’t get a code? Resend OTP
                        </button>
                    </form>
                )}

                {error && (
                    <div className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                {message && !error && (
                    <div className="mt-4 text-sm text-emerald-300 bg-emerald-900/20 border border-emerald-800/50 rounded-lg px-3 py-2">
                        {message}
                    </div>
                )}

                {step === "otp" && (
                    <button
                        type="button"
                        onClick={() => {
                            setStep("email");
                            setOtp(["", "", "", "", "", ""]);
                            setMessage("");
                            setError("");
                        }}
                        className="mt-4 text-xs text-slate-500 hover:text-slate-300"
                    >
                        Change email
                    </button>
                )}
            </motion.div>
        </section>
    );
}
