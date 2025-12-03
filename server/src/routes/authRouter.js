import express from "express";
import {sendOtpController,verifyOtpController} from "../controller/authController.js";

const router = express.Router();

router
    .route("/send-otp")
    .post(sendOtpController)

router
    .route("/verify-otp")
    .post(verifyOtpController)

export {router as authRouter}
