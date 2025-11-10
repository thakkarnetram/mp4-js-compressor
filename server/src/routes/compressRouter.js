import express from "express";
import {compressVideoController} from "../controller/compressController.js";
const compressRouter = express.Router();

compressRouter
    .route("/compress")
    .post(compressVideoController)

export {compressRouter};
