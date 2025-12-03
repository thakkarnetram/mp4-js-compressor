import Razorpay from "razorpay";
import crypto from "crypto";
import {User} from "../model/user.js"; // your mongoose model

const razor = new Razorpay({
    key_id: process.env.RAZOR_PAY_KEY,
    key_secret: process.env.RAZOR_PAY_KEY_SECRET,
});

const PLAN_PRICES = {
    Free: 0,
    Pro: 199,
};


export const createOrder = async (req, res) => {
    try {
        const userId = req.user && req.user.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { plan } = req.body;
        console.log(PLAN_PRICES[plan])
        if (!plan || !PLAN_PRICES[plan]) return res.status(400).json({ message: "Invalid plan" });

        const amountPaise = PLAN_PRICES[plan] * 100;

        const options = {
            amount: amountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: { plan, userId },
        };

        const order = await razor.orders.create(options);

        return res.json({ ok: true, order, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error("createOrder err", err);
        return res.status(500).json({ message: "Server error" });
    }
};


export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment fields" });
        }

        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid signature" });
        }

        const order = await razor.orders.fetch(razorpay_order_id);
        const plan = order.notes?.plan || req.body.plan || "Pro";
        const userId = order.notes?.userId || req.user.sub;

        const planDurationDays = 30;
        const planExpiresAt = new Date(Date.now() + planDurationDays * 24 * 60 * 60 * 1000);

        await User.findByIdAndUpdate(userId, {
            plan,
            planExpiresAt,
            $push: {
                payments: {
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    plan,
                    amount: order.amount / 100,
                    createdAt: new Date(),
                },
            },
        });

        return res.json({ ok: true, message: "Payment verified and plan updated" });
    } catch (err) {
        console.error("verifyPayment err", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const activateFree = async (req, res) => {
    try {
        const userId = req.user && req.user.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { plan } = req.body;
        if (!plan) return res.status(400).json({ message: "Missing plan" });

        if (!(plan in PLAN_PRICES)) {
            console.log(plan)
            return res.status(400).json({ message: "Invalid plan" });
        }
        if (PLAN_PRICES[plan] !== 0) {
            return res.status(400).json({ message: "Plan is not free" });
        }

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.plan === plan && user.planExpiresAt && new Date(user.planExpiresAt) > new Date()) {
            return res.json({ ok: true, message: "Free plan already active", user });
        }

        const planDurationDays = 30;
        const planExpiresAt = new Date(Date.now() + planDurationDays * 24 * 60 * 60 * 1000);

        const updated = await User.findByIdAndUpdate(
            userId,
            {
                plan,
                planExpiresAt,
                $push: {
                    payments: {
                        paymentId: null,
                        orderId: null,
                        plan,
                        amount: 0,
                        method: "free",
                        createdAt: new Date(),
                    },
                },
            },
            { new: true }
        ).lean();

        return res.json({ ok: true, message: "Free plan activated", user: updated });
    } catch (err) {
        console.error("activateFree err", err);
        return res.status(500).json({ message: "Server error" });
    }
};
