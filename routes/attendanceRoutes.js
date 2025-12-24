import express from "express";
import {
  createAttendance,
  logoutAttendance,
  getAllAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/", getAllAttendance);            // frontend GET
router.post("/", createAttendance);           // frontend POST
router.put("/logout", logoutAttendance);      // logout

export default router;
