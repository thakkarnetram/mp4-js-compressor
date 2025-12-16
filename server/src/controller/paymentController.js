import Razorpay from "razorpay";
import crypto from "crypto";
import { User } from "../model/user.js";

const RAZOR_KEY_ID = process.env.RAZOR_PAY_KEY;
const RAZOR_KEY_SECRET = process.env.RAZOR_PAY_KEY_SECRET;

if (!RAZOR_KEY_ID || !RAZOR_KEY_SECRET) {
    console.warn("Razorpay env vars missing: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
}

const razor = new Razorpay({
    key_id: RAZOR_KEY_ID,
    key_secret: RAZOR_KEY_SECRET,
});

const PLAN_PRICES = {
    free: 0,
    pro: 199,
};

export const createOrder = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { plan } = req.body;
        if (!plan || typeof plan !== "string") return res.status(400).json({ message: "Missing plan" });

        const planKey = plan.toLowerCase();
        if (!(planKey in PLAN_PRICES)) return res.status(400).json({ message: "Invalid plan" });

        const amountPaise = Math.round(PLAN_PRICES[planKey] * 100);

        const options = {
            amount: amountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: { plan: planKey, userId },
        };

        const order = await razor.orders.create(options);

        return res.json({ ok: true, order, keyId: RAZOR_KEY_ID });
    } catch (err) {
        console.error("createOrder err", err);
        return res.status(500).json({ message: "Server error creating order" });
    }
};

export const verifyPayment = async (req, res) => {
    try {

        const userIdFromReq = req.user?.sub;

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = req.body;
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment fields" });
        }

        if (!RAZOR_KEY_SECRET) {
            console.error("Missing RAZOR_KEY_SECRET env var - can't verify signature");
            return res.status(500).json({ message: "Server misconfiguration" });
        }


        const expected = crypto
            .createHmac("sha256", RAZOR_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expected !== razorpay_signature) {
            console.warn("Invalid signature", { expected, got: razorpay_signature });
            return res.status(400).json({ message: "Invalid signature" });
        }


        const order = await razor.orders.fetch(razorpay_order_id).catch((e) => {
            console.error("Failed to fetch order from Razorpay", e);
            return null;
        });


        const planKey = (order?.notes?.plan || plan || "pro").toLowerCase();
        const userId = order?.notes?.userId || userIdFromReq;
        if (!userId) return res.status(400).json({ message: "Missing user id in order or request" });


        const paidAmount = order ? Number(order.amount_paid || 0) : null;
        const expectedAmountPaise = PLAN_PRICES[planKey] * 100;

        if (paidAmount !== null && paidAmount !== expectedAmountPaise) {
            console.warn("Paid amount mismatch", { paidAmount, expectedAmountPaise });

        }

        const planDurationDays = 30;
        const planExpiresAt = new Date(Date.now() + planDurationDays * 24 * 60 * 60 * 1000);

        const updated = await User.findByIdAndUpdate(
            userId,
            {
                plan: planKey === "pro" ? "pro" : "free",
                planExpiresAt,
                $push: {
                    payments: {
                        paymentId: razorpay_payment_id,
                        orderId: razorpay_order_id,
                        plan: planKey,
                        amount: expectedAmountPaise ? expectedAmountPaise / 100 : undefined,
                        method: "razorpay",
                        createdAt: new Date(),
                    },
                },
            },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ message: "User not found to update plan" });
        }

        return res.json({ ok: true, message: "Payment verified and plan updated", user: updated });
    } catch (err) {
        console.error("verifyPayment err", err);
        return res.status(500).json({ message: "Server error while verifying payment" });
    }
};

export const activateFree = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { plan } = req.body;
        if (!plan) return res.status(400).json({ message: "Missing plan" });

        const planKey = plan.toLowerCase();
        if (!(planKey in PLAN_PRICES)) return res.status(400).json({ message: "Invalid plan" });
        if (PLAN_PRICES[planKey] !== 0) return res.status(400).json({ message: "Plan is not free" });

        const planDurationDays = 30;
        const planExpiresAt = new Date(Date.now() + planDurationDays * 24 * 60 * 60 * 1000);

        const updated = await User.findByIdAndUpdate(
            userId,
            {
                plan: planKey,
                planExpiresAt,
                $push: {
                    payments: {
                        paymentId: null,
                        orderId: null,
                        plan: planKey,
                        amount: 0,
                        method: "Free",
                        createdAt: new Date(),
                    },
                },
            },
            { new: true }
        ).lean();

        if (!updated) return res.status(404).json({ message: "User not found" });
        return res.json({ ok: true, message: "Free plan activated", user: updated });
    } catch (err) {
        console.error("activateFree err", err);
        return res.status(500).json({ message: "Server error" });
    }
};
