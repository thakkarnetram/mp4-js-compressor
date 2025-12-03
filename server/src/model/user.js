import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        index: true
    },
    plan:{
        type:String,
        enum:["free","pro"],
        default:"free"
    }
})

const User = mongoose.model("user",UserSchema)
export {User}
