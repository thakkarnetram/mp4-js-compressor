import express from "express";
import {activateFree, createOrder, verifyPayment} from "../controller/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order",requireAuth, createOrder);
router.post("/verify",  requireAuth,verifyPayment);
router.post("/subscriptions/activate",  requireAuth,activateFree);

export {router as paymentRouter};
