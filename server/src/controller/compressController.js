import fs from "fs";
import path from "path";
import {compressVideo,compressImage} from "../utils/compression.js";
import archiver from "archiver";
import pLimit from "p-limit"

if(!fs.existsSync("compressed")) fs.mkdirSync("compressed");

const CONCURRENCY = 2;
const compressVideoController = async (req, res) => {
    try {
        const crf = Number(req.body.crf) || 24;

        if (Array.isArray(req.files) && req.files.length > 0) {
            const files = req.files;
            const limit = pLimit(CONCURRENCY);
            const compressed = [];

            await Promise.all(
                files.map((file) =>
                    limit(async () => {
                        const inputPath = file.path;
                        const outName = `${Date.now()}-${file.originalname}`;
                        const outputPath = path.join("compressed", outName);

                        await compressVideo(inputPath, outputPath, crf);
                        compressed.push({ outputPath, originalName: file.originalname });

                        try {
                            fs.unlinkSync(inputPath);
                        } catch (e) {
                            console.warn("Failed to delete upload:", inputPath, e.message);
                        }
                    })
                )
            );

            res.setHeader("Content-Type", "application/zip");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=compressed-${Date.now()}.zip`
            );

            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.on("error", (err) => {
                throw err;
            });

            archive.pipe(res);

            for (const item of compressed) {
                archive.file(item.outputPath, {
                    name: `compressed-${item.originalName}`,
                });
            }

            await archive.finalize();

            res.on("finish", () => {
                setTimeout(() => {
                    for (const item of compressed) {
                        try {
                            fs.unlinkSync(item.outputPath);
                        } catch (e) {
                            console.warn("Failed to delete compressed:", item.outputPath, e.message);
                        }
                    }
                }, 2000); 
            });

            return; 
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const inputPath = req.file.path;
        const outputPath = path.join(
            "compressed",
            `${Date.now()}-${req.file.originalname}`
        );

        await compressVideo(inputPath, outputPath, crf);

        res.download(outputPath, (err) => {
            try {
                fs.unlinkSync(inputPath);
            } catch (e) {
                console.warn("Failed to delete upload:", inputPath, e.message);
            }
            try {
                fs.unlinkSync(outputPath);
            } catch (e) {
                console.warn("Failed to delete output:", outputPath, e.message);
            }
            if (err) console.log("Error sending file:", err);
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while compressing" });
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

export {compressVideoController,compressImageController}
