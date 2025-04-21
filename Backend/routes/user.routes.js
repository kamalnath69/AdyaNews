import express from "express";
import { getUserProfile, updateUserProfile, updateUserLanguage, updateUserInterests, deleteUserAccount } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Route to fetch user profile
router.get("/profile", verifyToken, getUserProfile);

// Route to update user profile
router.put("/profile", verifyToken, updateUserProfile);

// Route to update user language
router.put("/language", verifyToken, updateUserLanguage);

// Route to update user interests
router.put("/interests", verifyToken, updateUserInterests);

// Route to delete user account
router.delete('/delete-account', verifyToken, deleteUserAccount);

export default router;