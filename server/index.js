import express from "express";
import cors from "cors";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { compressRouterVideo } from "./src/routes/compressRouterVideo.js";
import { compressRouterImage } from "./src/routes/compressRouterImage.js";
import { authRouter } from "./src/routes/authRouter.js";
import { connectDatabase } from "./src/utils/mongoConnection.js";
import { paymentRouter } from "./src/routes/paymentRouter.js";
import cookieParser from "cookie-parser";

connectDatabase();
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
app.use(cookieParser());
const allowedOrigins = [
  "https://tinycompression.netlify.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// mount routers (each router will apply its own multer)
app.use("/api/v1/", compressRouterVideo);
app.use("/api/v1/", compressRouterImage);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/payments", paymentRouter);

// simple ping
app.get("/", (req, res) => res.send("Server is up"));

// basic multer error handler
app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ error: "Unexpected file field", details: err.message });
  }
  console.error(err);
  res.status(500).json({ error: err?.message || "Internal server error" });
});

app.listen(8082, () => console.log("Server Running on :8082"));
