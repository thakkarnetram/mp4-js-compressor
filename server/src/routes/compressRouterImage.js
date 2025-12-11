import express from "express";
import multer from "multer";
import { compressImageController } from "../controller/compressController.js";
import { enforceAnonLimit } from "../middleware/anonLimit.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: '/tmp', limits: { fileSize: 1024 * 1024 * 1024 } });

router.post("/compress/image", optionalAuth, upload.single("image"), compressImageController);

export { router as compressRouterImage };
