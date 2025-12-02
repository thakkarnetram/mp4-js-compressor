import React from "react";

export default function Pricing() {
    const plans = [
        {
            title: "Free",
            price: "₹0",
            features: [
                "5 video at a time",
                "Max 200MB",
                "Basic compression settings"
            ],
        },
        {
            title: "Pro",
            price: "₹199 / month",
            features: [
                "Bulk compression",
                "Custom CRF settings",
                "Cloud storage (coming soon)",
            ],
            highlight: true,
        },
        // {
        //     title: "Agency",
        //     price: "₹499 / month",
        //     features: ["Unlimited compression", "API access", "Team dashboard"],
        // },
    ];

    return (
        <section id="pricing" className="bg-slate-900 text-white py-16 px-6">
            <h2 className="text-3xl font-semibold text-center mb-12">
                Pricing
            </h2>

            {/* Adjust grid to 1 col on mobile, 2 on desktop */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`p-8 rounded-2xl border transition-transform hover:scale-[1.03] ${
                            plan.highlight
                                ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-400/20"
                                : "bg-slate-800 border-slate-700"
                        }`}
                    >
                        <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                        <p className="text-xl mb-6">{plan.price}</p>

                        <ul className="space-y-2 text-sm text-slate-300 mb-8">
                            {plan.features.map((feature, j) => (
                                <li key={j}>✅ {feature}</li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-2 rounded-lg font-semibold ${
                                plan.highlight
                                    ? "bg-white text-blue-600 hover:bg-slate-100"
                                    : "bg-blue-600 hover:bg-blue-500"
                            }`}
                        >
                            Choose Plan
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
