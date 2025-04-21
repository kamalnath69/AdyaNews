import {User} from "../models/user.model.js"; // Ensure this is the correct path to your User model
import bcrypt from 'bcryptjs';

// Fetch user profile
export const getUserProfile = async (req, res) => {
    console.log("Fetching user profile...");
    try {
        console.log("req.user: ", req.userId);
        const userId = req.userId; // Assuming `req.user` is populated by an authentication middleware
        const user = await User.findById(userId).select("-password"); // Exclude the password field
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile" });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: "User ID not found. Authentication required." });
        }
        
        // Use name instead of fullName
        const { name, email, language, interests, notifications, phoneNumber, address, profilePhoto } = req.body;

        // Create an update object with only the fields provided
        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (language) updateFields.language = language;
        if (interests) updateFields.interests = interests;
        if (notifications) updateFields.notifications = notifications;
        if (phoneNumber) updateFields.phoneNumber = phoneNumber;
        if (address) updateFields.address = address;
        if (profilePhoto) updateFields.profilePhoto = profilePhoto;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error updating user profile" });
    }
};

// Update user language
export const updateUserLanguage = async (req, res) => {
    try {
        const userId = req.userId || req.user.id; // support both
        const { language } = req.body;
        if (!language) {
            return res.status(400).json({ message: "Language is required" });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { language, hasSelectedLanguage: true },
            { new: true, runValidators: true }
        ).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating language" });
    }
};

// Update user interests
export const updateUserInterests = async (req, res) => {
    try {
        const userId = req.userId || req.user.id; // support both
        const { interests } = req.body;
        if (!Array.isArray(interests) || interests.length === 0) {
            return res.status(400).json({ message: "Interests are required" });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { interests, hasSelectedInterests: true },
            { new: true, runValidators: true }
        ).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating interests" });
    }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        // Clear any session/cookies if you're using them
        res.clearCookie('jwt');
        
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Error deleting account" });
    }
};