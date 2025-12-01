import fs from "fs";
import path from "path";
import {compressVideo,compressImage} from "../utils/compression.js";

if(!fs.existsSync("compressed")) fs.mkdirSync("compressed");

const compressVideoController = async (req,res) => {
    try {
        if(!req.file) {
            return res.status(400).json({message:"No file uploaded"})
        }
        const crf = req.body.crf || 24;
        const inputPath =  req.file.path;
        const outputPath = path.join("compressed",`${Date.now()}-${req.file.originalname}`)
        await compressVideo(inputPath,outputPath,crf);

        res.download(outputPath,(err) => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            if(err) console.log("Error Sending File ",err)
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({message:err})
    }
}

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
