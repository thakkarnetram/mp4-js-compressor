import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();

    const initials = (user?.email || "U")
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase();

    const plan = user?.plan || "free";

    const payments = Array.isArray(user?.payments) ? user.payments : [];
    const latestPayment = payments.length
        ? [...payments].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0]
        : null;

    const latestPaymentDate = latestPayment
        ? new Date(latestPayment.createdAt)
        : null;

    const planExpiresAt = user?.planExpiresAt
        ? new Date(user.planExpiresAt)
        : null;

    const formatDate = (d) =>
        d?.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    return (
        <section className="px-6 py-12 flex justify-center">
            <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg shadow-slate-900/30">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Your Profile
                </h2>

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {initials}
                    </div>
                </div>

                <div className="text-center mb-3">
                    <p className="text-lg font-medium">{user?.email}</p>
                </div>

                <div className="text-center mb-4">
                    <span className="px-3 py-1 text-sm rounded-full bg-slate-900 border border-slate-700 text-blue-400">
                        {plan.toUpperCase()} Member
                    </span>
                </div>

                <div className="mt-4 space-y-1 text-sm text-slate-300 text-center">
                    <p>
                        <span className="text-slate-400">Last payment:</span>{" "}
                        {latestPaymentDate
                            ? `${latestPayment.amount} ₹ via ${
                                  latestPayment.method || "—"
                              } on ${formatDate(latestPaymentDate)}`
                            : "No payments yet"}
                    </p>

                    <p>
                        <span className="text-slate-400">Plan valid till:</span>{" "}
                        {planExpiresAt ? formatDate(planExpiresAt) : "—"}
                    </p>
                </div>
            </div>
        </section>
    );
}
