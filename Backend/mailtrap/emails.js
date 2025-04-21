import { transporter } from "./nodemailer.config.js";
import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const mailOptions = {
        from: `"AdyaNews" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Error sending verification email.");
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const mailOptions = {
        from: `"AdyaNews" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Our App!",
        html: `<p>Hello ${name},</p><p>Welcome to our app! We're excited to have you on board.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent successfully.");
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Error sending welcome email.");
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    const mailOptions = {
        from: `"AdyaNews" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Password",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent successfully.");
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Error sending password reset email.");
    }
};

export const sendResetSuccessEmail = async (email) => {
    const mailOptions = {
        from: `"AdyaNews" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Password reset success email sent successfully.");
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw new Error("Error sending password reset success email.");
    }
};
