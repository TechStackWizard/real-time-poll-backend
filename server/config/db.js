import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

export default function mongoDB() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Mongodb connected!"))
        .catch((e) => console.log("Mongodb not connected : ", e))
} 
