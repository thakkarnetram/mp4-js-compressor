import express from "express";
import multer from "multer";
import { compressVideoController } from "../controller/compressController.js";
import { enforceAnonLimit } from "../middleware/anonLimit.js";

const router = express.Router();
const upload = multer({ dest: '/tmp', limits: { fileSize: 1024 * 1024 * 1024 } });

router.post("/compress/video", upload.array("video", 20), enforceAnonLimit, compressVideoController);
// router.post("/compress/videos", upload.array("video",20), compressVideoController);

export { router as compressRouterVideo };
