import express from "express";
import {
	login,
	logoutUser,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	resendVerification,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logoutUser);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerification);
export default router;
