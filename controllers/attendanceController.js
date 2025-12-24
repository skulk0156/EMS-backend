import Attendance from "../models/Attendance.js";

/**
 * CREATE / PUNCH IN
 * POST /api/attendance
 */
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, name, date, punch_in } = req.body;

    const existing = await Attendance.findOne({ employeeId, date });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = await Attendance.create({
      employeeId,
      name,
      date,
      punch_in,
      status: "Present",
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * LOGOUT / PUNCH OUT
 * PUT /api/attendance/logout
 */
export const logoutAttendance = async (req, res) => {
  try {
    const { employeeId, date, punch_out, workingHours } = req.body;

    const attendance = await Attendance.findOne({ employeeId, date });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found" });
    }

    attendance.punch_out = punch_out;
    attendance.workingHours = workingHours;

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL ATTENDANCE
 * GET /api/attendance
 */
export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
