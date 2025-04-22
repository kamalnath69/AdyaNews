import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
        },
        profilePhoto: {
            type: String, // Store as base64 string
        },
        language: {
            type: String,
            default: 'en',
        },
        hasSelectedLanguage: {
            type: Boolean,
            default: false,
        },
        phoneNumber: {
            type: String,
        },
        address: {
            type: String,
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,
        resetPasswordExpiresAt: Date,
        verificationToken: String,
        verificationTokenExpiresAt: Date,
        interests: [String], // New field for interests
        hasSelectedInterests: { type: Boolean, default: false }, 
        role: { type: String, default: 'user' }, // New field for user role
        // Add notifications field with defaults
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            newsletter: { type: Boolean, default: false }
        }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);