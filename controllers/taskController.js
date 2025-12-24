import Task from "../models/Task.js";
import User from "../models/User.js";

// GET tasks for manager team only
export const getTasks = async (req, res) => {
  try {
    const managerId = req.user.id;

    const tasks = await Task.find({ manager_id: managerId })
      .populate("assigned_to", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// GET employees under this manager
export const getTeamMembers = async (req, res) => {
  try {
    const managerId = req.user.id;

    const teamMembers = await User.find({ manager_id: managerId })
      .select("name email _id");

    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" });
  }
};

// ADD new task
export const addTask = async (req, res) => {
  try {
    const { title, description, assigned_to, deadline } = req.body;

    const newTask = new Task({
      title,
      description,
      assigned_to,
      manager_id: req.user.id,
      deadline
    });

    await newTask.save();
    res.json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: "Failed to add task" });
  }
};
