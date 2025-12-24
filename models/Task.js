import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  status: String,
  progress: Number,
});

export default mongoose.model("Task", taskSchema);
