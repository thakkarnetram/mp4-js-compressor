import express from "express";
import multer from "multer"
import fs from "fs";
import path from "path";
import {compressVideo} from "../utils/compression.js";

if(!fs.existsSync("compressed")) fs.mkdirSync("compressed");

const compressVideoController = async (req,res) => {
    try {
        if(!req.file) {
            return res.status(400).json({message:"No file uploaded"})
        }
        const inputPath =  req.file.path;
        const outputPath = path.join("compressed",`${Date.now()}-${req.file.originalname}`)
        await compressVideo(inputPath,outputPath);

        res.download(outputPath,(err) => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            if(err) console.log("Error Sending File ",err)
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export {compressVideoController}
