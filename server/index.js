// This script can compress mp4 files to a decent quality in less size
// useful for bulk compression of files
// better than compression sites

// -crf 21 use the int value to toggle quality of compression
// lower the number higher the quality and file size
// higher the number lower the quality and file size

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import {compressRouter} from "./src/routes/compressRouter.js";
import multer from "multer";

const upload =  multer({dest:"uploads/"})
// set the path for ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
app.use(bodyParser.json());
app.use(cors())

app.use("/api/v1",upload.single("video"),compressRouter);

app.listen(8082,() => {
    console.log("Server Running ")
})

