import User from "../models/User.js";
import Task from "../models/Task.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const user = await User.findOne({ employeeId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch real task data
    const totalTasks = await Task.countDocuments({ assignedTo: employeeId });
    const completedTasks = await Task.countDocuments({ assignedTo: employeeId, status: "completed" });
    const pendingTasks = totalTasks - completedTasks;
    const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Admin can see total users
    let totalUsers = 0;
    if (user.role === "admin") {
      totalUsers = await User.countDocuments();
    }

    // Fetch recent activities (optional: from separate Activity collection later)
    const activities = [
      { id: 1, activity: "Checked dashboard", time: "Just now" },
      { id: 2, activity: "Updated task status", time: "2 hrs ago" },
    ];

    res.status(200).json({
      employeeId: user.employeeId,
      role: user.role,
      totalTasks,
      completedTasks,
      pendingTasks,
      performance,
      totalUsers,
      activities,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
