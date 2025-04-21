import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS, // Gmail app password
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("Error with email transporter:", error);
    } else {
        console.log("Email transporter is ready to send messages.");
    }
});