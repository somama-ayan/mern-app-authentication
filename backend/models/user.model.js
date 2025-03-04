import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken:  String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationExpiresAt: Date
}, {timestamps: true})
// createdAt time like that attribute it will give by default
export const User = mongoose.model('User', userSchema)