import express from "express";
import multer from "multer";
import { createCompressionJob, getJobStatus, downloadJobResult } from "../controller/compressController.js";
import { enforceAnonLimit } from "../middleware/anonLimit.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: '/tmp', limits: { fileSize: 1024 * 1024 * 1024 } });

// 1. Start Job
router.post("/compress/video/job", optionalAuth, upload.array("video", 20), enforceAnonLimit, createCompressionJob);

// 2. Poll Status
router.get("/compress/video/status/:jobId", optionalAuth, getJobStatus);

// 3. Download
router.get("/compress/video/download/:jobId", optionalAuth, downloadJobResult);

export { router as compressRouterVideo };
