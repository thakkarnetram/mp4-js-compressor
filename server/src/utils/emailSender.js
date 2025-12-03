import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmailOTP = async (to, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"TinyCompression" <${process.env.GMAIL_USER}>`,
        to,
        subject: "Your TinyCompression Login OTP",
        html: `
            <div style="font-family: Arial; padding: 20px;">
                <h2>Your Login OTP 🔐</h2>
                <p>Your verification code is:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This OTP expires in 5 minutes.</p>
                <br/>
                <p>— Team TinyCompression</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
