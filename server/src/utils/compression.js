

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Compress a video file using FFmpeg.
 * @param {string} inputPath - Path to the source video.
 * @param {string} outputPath - Path to save compressed video.
 * @returns {Promise<void>}
 */
export const compressVideo = (inputPath, outputPath,crf) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                "-vcodec libx264",
                "-acodec copy",
                `-crf ${crf}`,
                "-preset medium",
                "-movflags +faststart",
            ])
            .on("end", () => {
                console.log("✅ Compression successful:", outputPath);
                resolve();
            })
            .on("error", (err, stdout, stderr) => {
                console.error("❌ FFmpeg Error:", err.message);
                console.error("FFmpeg stderr:", stderr);
                reject(err);
            })
            .save(outputPath);
    });
};
