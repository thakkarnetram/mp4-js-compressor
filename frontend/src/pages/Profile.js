import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();
    console.log(user)
    const initials = (user?.email || "U")
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase();
    console.log(user)

    const plan = user?.plan || "Free";

    return (
        <section className="px-6 py-12 flex justify-center">
            <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg shadow-slate-900/30">

                <h2 className="text-2xl font-semibold mb-6 text-center">Your Profile</h2>

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {initials}
                    </div>
                </div>

                <div className="text-center mb-4">
                    <p className="text-lg font-medium">{user?.email}</p>
                </div>

                <div className="text-center mb-4">
                    <span className="px-3 py-1 text-sm rounded-full bg-slate-900 border border-slate-700 text-blue-400">
                        {plan.toUpperCase()} Member
                    </span>
                </div>

            </div>
        </section>
    );
}
