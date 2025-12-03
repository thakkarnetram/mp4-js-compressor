import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Pricing() {
    const { user, token } = useAuth();

    const API_BASE ="http://localhost:8082";
    const RAZORPAY_KEY = process.env.REACT_APP_RAZOR_PAY_KEY;

    const plans = [
        {
            id: "Free",
            title: "Free",
            price: "₹0",
            amount: 0,
            features: ["5 video at a time", "Max 200MB", "Basic compression settings"],
        },
        {
            id: "Pro",
            title: "Pro",
            price: "₹199 / month",
            amount: 199,
            features: ["Bulk compression", "Custom CRF settings"],
            highlight: true,
        },

    ];

    const handleBuy = async (planId) => {
        if (!token) {
            window.location.href = `/auth?next=/pricing`;
            return;
        }

        const chosenPlan = plans.find((p) => p.id === planId);
        if (!chosenPlan) {
            alert("Invalid plan selected.");
            return;
        }

        if (chosenPlan.amount === 0) {
            try {
                const res = await fetch(`${API_BASE}/api/v1/payments/subscriptions/activate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ plan: chosenPlan.id }),
                });
                const data = await res.json();
                console.log("activate-free response", res.status, data);

                if (!res.ok) {
                    alert(data?.message || "Could not activate free plan. Contact support.");
                    return;
                }

                alert("Free plan activated!");
                window.location.reload();
            } catch (err) {
                console.error("activate-free error", err);
                alert("Activation failed. Try again.");
            }
            return;
        }

        try {

            const createRes = await fetch(`${API_BASE}/api/v1/payments/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ plan: chosenPlan.id }),
            });

            const createData = await createRes.json();
            console.log("create-order response", createRes.status, createData);

            if (!createRes.ok) {
                console.error("create-order failed", createData);
                alert(createData?.message || "Could not create order. Try again.");
                return;
            }

            const order = createData.order || createData;
            if (!order || !order.id || !order.amount) {
                console.error("invalid create-order response", createData);
                alert("Payment initialization failed. Try again.");
                return;
            }

            if (!RAZORPAY_KEY) {
                console.error("Missing REACT_APP_RAZOR_PAY_KEY");
                alert("Payment initialization failed (missing key). Contact support.");
                return;
            }

            const options = {
                key: RAZORPAY_KEY,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "TinyCompression",
                description: chosenPlan.title,
                order_id: order.id,
                prefill: { email: user?.email },
                theme: { color: "#2563eb" },
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${API_BASE}/api/v1/payments/verify`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: chosenPlan.id,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        console.log("verify response", verifyRes.status, verifyData);

                        if (!verifyRes.ok) {
                            console.error("verify failed", verifyData);
                            alert(verifyData?.message || "Payment verification failed. Contact support.");
                            return;
                        }

                        alert("Payment successful — plan updated!");
                        window.location.reload();
                    } catch (err) {
                        console.error("verify error", err);
                        alert("Verification failed, contact support.");
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log("Razorpay modal closed by user");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("create order err", err);
            alert("Could not start payment. Try again.");
        }
    };

    return (
        <section id="pricing" className="bg-slate-900 text-white py-16 px-6">
            <h2 className="text-3xl font-semibold text-center mb-12">Pricing</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`p-8 rounded-2xl border transition-transform hover:scale-[1.03] ${
                            plan.highlight ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-400/20" : "bg-slate-800 border-slate-700"
                        }`}
                    >
                        <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                        <p className="text-xl mb-6">{plan.price}</p>
                        <ul className="space-y-2 text-sm text-slate-300 mb-8">
                            {plan.features.map((f, j) => (
                                <li key={j}>✅ {f}</li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleBuy(plan.id)}
                            className={`w-full py-2 rounded-lg font-semibold ${
                                plan.highlight ? "bg-white text-blue-600 hover:bg-slate-100" : "bg-blue-600 hover:bg-blue-500"
                            }`}
                        >
                            {plan.amount === 0 ? "Activate Free" : "Choose Plan"}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
