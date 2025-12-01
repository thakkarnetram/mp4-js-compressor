

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import sharp from "sharp";

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


export const compressImage = async (input,output,quality=80) => {
    try {
        await sharp(input)
            .jpeg({quality})
            .toFile(output);
        console.log(`✅ Compressed image saved: ${output}`);
    } catch (err) {
        console.error("❌ Image compression failed:", err);
    }
}
