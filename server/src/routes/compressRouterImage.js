import express from "express";
import multer from "multer";
import { compressImageController } from "../controller/compressController.js";

const router = express.Router();
const upload = multer({ dest: '/tmp', limits: { fileSize: 1024 * 1024 * 1024 } });

router.post("/compress/image", upload.single("image"), compressImageController);

export { router as compressRouterImage };
