import { User } from "../models/user.model.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
    
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin privileges required" });
    }
    
    next();
  } catch (error) {
    console.error("Error verifying admin:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};