import express from "express";
import multer from "multer";
import { compressVideoController } from "../controller/compressController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/compress/video", upload.array("video",20), compressVideoController);
// router.post("/compress/videos", upload.array("video",20), compressVideoController);

export { router as compressRouterVideo };
