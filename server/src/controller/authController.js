import {User} from "../model/user.js";
import {Otp} from "../model/otp.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {sendEmailOTP} from "../utils/emailSender.js";
dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY

export const sendOtpController = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        email = email.trim().toLowerCase();

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.findOneAndUpdate(
            { email },
            { email, otp: otpCode, createdAt: new Date() },
            { upsert: true, new: true }
        );

        await sendEmailOTP(email, otpCode);

        return res.json({ ok: true, message: "OTP sent" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};


export const verifyOtpController = async (req, res) => {
    try {
        let { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

        email = email.trim().toLowerCase();

        const otpRecord = await Otp.findOne({ email }).lean();
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await Otp.deleteOne({ email });

        let user;
        try {
            user = await User.findOneAndUpdate(
                { email },
                {
                    $setOnInsert: { email, createdAt: new Date(), name: "" },
                    $set: { lastLogin: new Date() }
                },
                { new: true, upsert: true }
            ).lean();
        } catch (err) {
            if (err.code === 11000) {
                user = await User.findOne({ email }).lean();
            } else {
                throw err;
            }
        }

        const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

        return res.json({ ok: true, user, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
