import { transporter } from "./nodemailer.config.js";

export const sendVerificationEmail = async (to, verificationCode) => {
    const mailOptions = {
        from: `"Your App Team" <${process.env.EMAIL_USER}>`, // Sender address
        to, // Recipient email
        subject: "Verify Your Email", // Subject line
        html: `
            <p>Hello,</p>
            <p>Thank you for signing up! Your verification code is:</p>
            <h2>${verificationCode}</h2>
            <p>Enter this code on the verification page to complete your registration.</p>
            <p>This code will expire in 15 minutes.</p>
            <p>Best regards,<br>Your App Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};