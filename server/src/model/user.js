import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    paymentId: String,
    orderId: String,
    plan: String,
    amount: Number,
    method: {
        type: String,
        default: "razorpay"
    },
    createdAt: { 
        type: Date, 
        default: Date.now
     },
});

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free"
    },
    planExpiresAt: Date,
    payments: [PaymentSchema],
})

const User = mongoose.model("user", UserSchema)
export { User }
