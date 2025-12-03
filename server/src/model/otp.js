import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otp:{
        type:String,
        required:true
    },
    isUsed:{
        type:Boolean
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const Otp = mongoose.model("otp",OtpSchema);
export {Otp}
