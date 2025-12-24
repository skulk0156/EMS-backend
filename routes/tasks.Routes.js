import express from "express";
import { getTasks, getTeamMembers, addTask } from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.get("/team-members", authMiddleware, getTeamMembers);
router.post("/add", authMiddleware, addTask);

export default router;
