import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  punch_in: {
    type: String,
    required: true
  },
  punch_out: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Leave"],
    default: "Absent"
  },
  workingHours: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per employee per date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true }); 

export default mongoose.model("Attendance", attendanceSchema);