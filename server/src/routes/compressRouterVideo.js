import express from "express";
import multer from "multer";
import { compressVideoController } from "../controller/compressController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/compress/video", upload.single("video"), compressVideoController);

export { router as compressRouterVideo };
