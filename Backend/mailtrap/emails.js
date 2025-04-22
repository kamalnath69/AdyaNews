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
    console.log("Reset url", resetURL);
    
    // Debug the template and replacement
    let emailHtml = PASSWORD_RESET_REQUEST_TEMPLATE;
    
    // Replace the link URL directly with explicit string targeting
    emailHtml = emailHtml.split('href="{resetURL}"').join(`href="${resetURL}"`);
    
    // Add fallback text link in case the button doesn't work
    emailHtml = emailHtml.replace(
        'This link will expire in 1 hour for security reasons.',
        `If the button doesn't work, copy and paste this link into your browser: <br><a href="${resetURL}">${resetURL}</a><br><br>This link will expire in 1 hour for security reasons.`
    );
    
    const mailOptions = {
        from: `"AdyaNews" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Password",
        html: emailHtml,
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
