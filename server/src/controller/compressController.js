import fs from "fs";
import path from "path";
import { compressVideo, compressImage } from "../utils/compression.js";
import archiver from "archiver";
import pLimit from "p-limit";
import Job from "../model/job.js"; 

if (!fs.existsSync("compressed")) fs.mkdirSync("compressed");

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

const compressImageController = async (req,res) => {
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
        return res.status(500).json({message:err})
    }
}

export {
    createCompressionJob,
    getJobStatus,
    downloadJobResult,
    compressImageController
};