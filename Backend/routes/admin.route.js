import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import { 
  getAllUsers, 
  getUserStats,
  getContentStats, 
  updateUser, 
  deleteUser, 
  setUserRole 
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply middleware to all admin routes
router.use(verifyToken);
router.use(verifyAdmin);

// User management routes
router.get("/users", getAllUsers);
router.get("/stats/users", getUserStats);
router.get("/stats/content", getContentStats);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.put("/users/:userId/role", setUserRole);

export default router;