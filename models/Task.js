import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  status: String,
  progress: Number,
});

export default mongoose.model("Task", taskSchema);
