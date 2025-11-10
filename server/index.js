// This script can compress mp4 files to a decent quality in less size
// useful for bulk compression of files
// better than compression sites

// -crf 21 use the int value to toggle quality of compression
// lower the number higher the quality and file size
// higher the number lower the quality and file size

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import ffmpeg from "fluent-ffmpeg";
import ora from "ora";
import os from "os";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// set the path for ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function compressVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec("libx265")
            .audioCodec("aac")
            .outputOptions([
                "-crf 21",
                "-preset medium",
            ])
            .on("end", resolve)
            .on("error", reject)
            .save(outputPath);
    });
}

async function main() {

    const { inputDir } = await inquirer.prompt([
        {
            type: "input",
            name: "inputDir",
            message: "Enter the full path to your folder (e.g. C:\\Users\\YourName\\Downloads):",
            default: path.join(os.homedir(), "Downloads"),
        },
    ]);

    if (!fs.existsSync(inputDir)) {
        console.log(" Folder not found! Check your path and try again.");
        return;
    }

    const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith(".mp4"));
    if (files.length === 0) {
        console.log(" No MP4 files found in that folder.");
        return;
    }

    const { selectedFiles } = await inquirer.prompt([
        {
            type: "checkbox",
            name: "selectedFiles",
            message: "Select MP4 files to compress:",
            choices: files,
            validate: input => input.length > 0 ? true : "Please select at least one file!",
        },
    ]);

    const { outputDir } = await inquirer.prompt([
        {
            type: "input",
            name: "outputDir",
            message: "Enter output folder path (will be created if it doesn’t exist):",
            default: path.join(inputDir, "compressed"),
        },
    ]);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const file of selectedFiles) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);

        const spinner = ora(`Compressing ${file}...`).start();
        try {
            await compressVideo(inputPath, outputPath);
            spinner.succeed(`Compressed: ${file}`);
        } catch (err) {
            spinner.fail(` Error compressing ${file}: ${err.message}`);
        }
    }

    console.log(`All selected files compressed and saved in: ${outputDir}`);
}

main();
