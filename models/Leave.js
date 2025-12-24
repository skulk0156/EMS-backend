import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["Sick leave", "Casual leave", "Paid leave", "Other"],
    default: "Sick leave"
  },
  from: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return !this.to || value <= this.to;
      },
      message: "From date must be before or equal to To date"
    }
  },
  to: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return !this.from || value >= this.from;
      },
      message: "To date must be after or equal to From date"
    }
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
}, {
  timestamps: true
});

export default mongoose.model("Leave", leaveSchema);