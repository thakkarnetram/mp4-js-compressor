import express from "express";
import cors from "cors";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { compressRouterVideo } from "./src/routes/compressRouterVideo.js";
import { compressRouterImage } from "./src/routes/compressRouterImage.js";
import {authRouter} from "./src/routes/authRouter.js";
import {connectDatabase} from "./src/utils/mongoConnection.js";
import {paymentRouter} from "./src/routes/paymentRouter.js";

connectDatabase();
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
app.use(cors());
app.use(express.json());

// mount routers (each router will apply its own multer)
app.use("/api/v1/", compressRouterVideo);
app.use("/api/v1/", compressRouterImage);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/payments", paymentRouter);

// simple ping
app.get("/ping", (req, res) => res.send("ok"));

// basic multer error handler
app.use((err, req, res, next) => {
    if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Unexpected file field", details: err.message });
    }
    console.error(err);
    res.status(500).json({ error: err?.message || "Internal server error" });
});

app.listen(8082, () => console.log("Server Running on :8082"));
