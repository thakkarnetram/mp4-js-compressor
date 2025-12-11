import fs from "fs";
import path from "path";
import { compressVideo, compressImage } from "../utils/compression.js";
import archiver from "archiver";
import pLimit from "p-limit";
import Job from "../model/job.js";
import { User } from "../model/user.js"
import { AnonUsage } from "../model/anonymous.js";

const QUOTA_ANON = 25 * 1024 * 1024;
const QUOTA_STANDARD = 100 * 1024 * 1024;
const QUOTA_PRO = 250 * 1024 * 1024;

const getQuotaLimit = (user) => {
    if (user && user.plan === "pro") return QUOTA_PRO;
    if (user) return QUOTA_STANDARD;
    return QUOTA_ANON;
};

const getPlanLimit = (user) => {
    if (user && user.plan === "pro") {
        return { bytes: QUOTA_PRO, mb: 250 };
    }
    if (user) {
        return { bytes: QUOTA_STANDARD, mb: 100 };
    }
    return { bytes: QUOTA_ANON, mb: 25 };
};

const cleanupFiles = (files) => {
    files.forEach(f => {
        try {
            if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        } catch (e) { console.error('Cleanup error:', e); }
    });
};

const checkAndIncrementQuota = async (req, incomingBytes, dbUser) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (req.user) {
        let user = dbUser;
        if (!user) {
            const userId = req.user.sub || req.user._id;
            user = await User.findById(userId);
        }
        if (!user) {
            const userId = req.user.sub || req.user._id;
            user = await User.findById(userId);
        }
        if (!user) {
            return { allowed: false, message: "User account not found. Please log out and log in again." };
        }
        const limit = getQuotaLimit(user);
        if (!user.dailyUsage) {
            user.dailyUsage = { date: todayStr, bytes: 0 };
        }
        if (user.dailyUsage.date !== todayStr) {
            user.dailyUsage = { date: todayStr, bytes: 0 };
        }
        const currentUsed = user.dailyUsage.bytes || 0;
        if (currentUsed + incomingBytes > limit) {
            return {
                allowed: false,
                message: `Daily quota exceeded. Used: ${(currentUsed / 1024 / 1024).toFixed(1)}MB. Uploading this would exceed your ${(limit / 1024 / 1024).toFixed(0)}MB daily limit.`
            };
        }
        user.dailyUsage.bytes = currentUsed + incomingBytes;
        await user.save();
        return { allowed: true };
    }

    else {
        const cookieName = process.env.ANON_COOKIE_NAME || "anonId";
        const anonId = req.cookies?.[cookieName] || req.anonUsage?.anonId;

        if (!anonId) return { allowed: true };

        let entry = await AnonUsage.findOne({ anonId, dateStr: todayStr });
        if (!entry) {
            entry = new AnonUsage({ anonId, dateStr: todayStr, bytes: 0 });
        }

        const currentUsed = entry.bytes || 0;

        if (currentUsed + incomingBytes > limit) {
            return {
                allowed: false,
                message: `Anonymous daily quota exceeded. Used: ${(currentUsed / 1024 / 1024).toFixed(1)}MB. Limit: ${limit / 1024 / 1024}MB.`
            };
        }

        entry.bytes = currentUsed + incomingBytes;
        await entry.save();
        return { allowed: true };
    }
};

if (!fs.existsSync("compressed")) fs.mkdirSync("compressed");
setInterval(() => {
    const directory = "compressed";
    fs.readdir(directory, (err, files) => {
        if (err) return console.error("Cleanup error:", err);
        files.forEach((file) => {
            const filePath = path.join(directory, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                if (Date.now() - stats.mtimeMs > 3600000) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Failed to delete stale file:", filePath);
                        else console.log("🧹 Cleaned up stale file:", filePath);
                    });
                }
            });
        });
    });
}, 3600000);
const CONCURRENCY = 1;

const runBackgroundCompression = async (jobId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) return;

        job.status = "processing";
        await job.save();

        const limit = pLimit(CONCURRENCY);

        // Compress all files in the job
        await Promise.all(
            job.files.map((fileItem) =>
                limit(async () => {
                    const outName = `${jobId}-${Date.now()}-${fileItem.originalName}`;
                    const outputPath = path.join("compressed", outName);

                    // Run the actual FFmpeg compression
                    await compressVideo(fileItem.inputPath, outputPath, job.crf);

                    // Save the new path to the database object (in memory)
                    fileItem.outputPath = outputPath;

                    // Clean up the uploaded raw file
                    try {
                        if (fs.existsSync(fileItem.inputPath)) {
                            fs.unlinkSync(fileItem.inputPath);
                        }
                    } catch (e) {
                        console.warn("Cleanup warning:", e.message);
                    }
                })
            )
        );

        job.status = "done";
        job.completedAt = new Date();
        await job.save();
        console.log(`Job ${jobId} finished successfully.`);

    } catch (err) {
        console.error(`Job ${jobId} failed:`, err);
        await Job.findByIdAndUpdate(jobId, {
            status: "error",
            error: err.message || "Compression failed"
        });
    }
};

const createCompressionJob = async (req, res) => {
    try {
        const crf = Number(req.body.crf) || 24;
        const uploadedFiles = req.files || (req.file ? [req.file] : []);

        if (uploadedFiles.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        let userObj = null;
        if (req.user) {
            userObj = await User.findById(req.user.sub || req.user._id);
            if (!userObj) {
                cleanupFiles(uploadedFiles);
                return res.status(401).json({ message: "User not found. Please re-login." });
            }
        }
        const { bytes: maxLimitBytes, mb: maxLimitMB } = getPlanLimit(userObj);
        for (const file of uploadedFiles) {
            if (file.size > maxLimitBytes) {
                cleanupFiles(uploadedFiles);
                return res.status(403).json({
                    code: "FILE_TOO_LARGE",
                    message: `File "${file.originalname}" exceeds the individual file limit of ${maxLimitMB}MB for your plan.`
                });
            }
        }
        const totalBatchSize = uploadedFiles.reduce((acc, file) => acc + file.size, 0);
        if (totalBatchSize > maxLimitBytes) {
            cleanupFiles(uploadedFiles);
            return res.status(403).json({
                code: "LIMIT_EXCEEDED",
                message: `Total size (${(totalBatchSize / 1024 / 1024).toFixed(2)}MB) exceeds the batch limit of ${maxLimitMB}MB.`
            });
        }
        const quotaCheck = await checkAndIncrementQuota(req, totalBatchSize, userObj);
        if (!quotaCheck.allowed) {
            cleanupFiles(uploadedFiles);
            return res.status(403).json({
                code: "QUOTA_EXCEEDED",
                message: quotaCheck.message
            });
        }
        const newJob = new Job({
            userId: req.user?._id,
            crf: crf,
            files: uploadedFiles.map(f => ({
                originalName: f.originalname,
                inputPath: f.path
            }))
        });

        await newJob.save();

        runBackgroundCompression(newJob._id);

        return res.status(200).json({
            success: true,
            message: "Compression started",
            jobId: newJob._id
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to start job" });
    }
};

const getJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).select("status error completedAt");
        if (!job) return res.status(404).json({ message: "Job not found" });
        return res.json(job);
    } catch (err) {
        return res.status(500).json({ message: "Error checking status" });
    }
};

const downloadJobResult = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job || job.status !== 'done') {
            return res.status(400).json({ message: "Job is not ready yet." });
        }
        const files = job.files;
        if (files.length === 1) {
            const file = files[0];
            return res.download(file.outputPath, `compressed-${file.originalName}`, (err) => {
                if (!err) fs.unlinkSync(file.outputPath);
            });
        }
        else {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename=compressed-${job._id}.zip`);
            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(res);
            for (const item of files) {
                archive.file(item.outputPath, { name: item.originalName });
            }
            await archive.finalize();
        }
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ message: "Download failed" });
    }
};

const compressImageController = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image uploaded" });
        const inputPath = req.file.path;
        const outputPath = `${req.file.originalname}`
        await compressImage(inputPath, outputPath, 70);

        res.download(outputPath, (err) => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            if (err) console.log("Error sending image:", err);
        });
    } catch (err) {
        return res.status(500).json({ message: err })
    }
}

export {
    createCompressionJob,
    getJobStatus,
    downloadJobResult,
    compressImageController
};