// backend/controllers/projectController.js
import Project from "../models/Project.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

/**
 * Create Project
 */
export const createProject = async (req, res) => {
  try {
    const { project_name, description, manager_id, deadline, status, team_id } = req.body;

    if (!project_name || !manager_id) {
      return res.status(400).json({ message: "Project name and manager are required" });
    }

    const project = await Project.create({
      project_name,
      description: description || "",
      manager: manager_id,
      team: team_id || null,
      status: status || "In Progress",
      deadline: deadline || null,
    });

    await project.populate("manager", "name email role");
    await project.populate("team", "team_name");

    res.status(201).json({ message: "Project created successfully", project });
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get Projects (with filters & summary)
 * Query params supported:
 * - search (name / manager name)
 * - status
 * - manager (manager id)
 * - team (team id)
 * - from (ISO date)
 * - to (ISO date)
 * - page (number)
 * - limit (number)
 */
export const getProjects = async (req, res) => {
  try {
    const {
      search,
      status,
      manager,
      team,
      from, // start date lower bound (projects with deadline >= from)
      to, // end date upper bound (projects with deadline <= to)
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortDir = "desc",
    } = req.query;

    const q = {};

    if (status) q.status = status;
    if (manager) q.manager = manager;
    if (team) q.team = team;

    // date range on deadline
    if (from || to) {
      q.deadline = {};
      if (from) q.deadline.$gte = new Date(from);
      if (to) q.deadline.$lte = new Date(to);
    }

    // text search in project_name or manager name (manager search will need a join)
    // We'll search project_name first and then filter by populated manager name.
    if (search) {
      q.project_name = { $regex: search, $options: "i" };
    }

    const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);
    const sort = { [sortBy]: sortDir === "asc" ? 1 : -1 };

    // Fetch projects with population
    let projects = await Project.find(q)
      .populate("manager", "name email role")
      .populate("team", "team_name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10));

    // If search matches manager name but project_name didn't match, also include those
    if (search) {
      // find managers whose name matches
      const managers = await User.find({ name: { $regex: search, $options: "i" } }).select("_id");
      const managerIds = managers.map((m) => m._id.toString());
      if (managerIds.length > 0) {
        const extra = await Project.find({ manager: { $in: managerIds } })
          .populate("manager", "name email role")
          .populate("team", "team_name")
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit, 10));
        // merge unique by id
        const map = new Map(projects.map((p) => [p._id.toString(), p]));
        extra.forEach((p) => {
          if (!map.has(p._id.toString())) map.set(p._id.toString(), p);
        });
        projects = Array.from(map.values());
      }
    }

    // Build summary counts across all matching projects (ignores pagination)
    const allMatching = await Project.find(q)
      .populate("manager", "name")
      .populate("team", "team_name");

    const total = allMatching.length;
    const completed = allMatching.filter((p) => p.status === "Completed").length;
    const inProgress = allMatching.filter((p) => p.status === "In Progress").length;
    const onHold = allMatching.filter((p) => p.status === "On Hold").length;

    const summary = {
      total,
      completed,
      inProgress,
      onHold,
    };

    res.status(200).json({ projects, summary });
  } catch (err) {
    console.error("Get Projects Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get project by id
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("manager", "name email role")
      .populate("team", "team_name");

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (err) {
    console.error("Get Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update Project
 */
export const updateProject = async (req, res) => {
  try {
    const { project_name, description, manager_id, deadline, status, team_id } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        project_name,
        description,
        manager: manager_id,
        deadline,
        status,
        team: team_id || null,
      },
      { new: true }
    )
      .populate("manager", "name email role")
      .populate("team", "team_name");

    if (!updatedProject) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project updated successfully", project: updatedProject });
  } catch (err) {
    console.error("Update Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete Project
 */
export const deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


















// import Project from "../models/Project.js";

// // ---------------- Create Project ----------------
// export const createProject = async (req, res) => {
//   try {
//     const { project_name, description, manager_id, deadline, status } = req.body;

//     if (!project_name || !manager_id) {
//       return res.status(400).json({ message: "Project name and manager are required" });
//     }

//     const project = await Project.create({
//       project_name,
//       description: description || "",
//       manager: manager_id,
//       status: status || "In Progress",
//       deadline: deadline || null,
//     });

//     // Populate manager info before sending response
//     await project.populate("manager", "name email role");

//     res.status(201).json({ message: "Project created successfully", project });
//   } catch (err) {
//     console.error("Create Project Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ---------------- Get All Projects ----------------
// export const getProjects = async (req, res) => {
//   try {
//     const projects = await Project.find().populate("manager", "name email role");
//     res.status(200).json({ data: projects });
//   } catch (err) {
//     console.error("Get Projects Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ---------------- Get Project By ID ----------------
// export const getProjectById = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id).populate(
//       "manager",
//       "name email role"
//     );
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     res.status(200).json(project);
//   } catch (err) {
//     console.error("Get Project Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ---------------- Update Project ----------------
// export const updateProject = async (req, res) => {
//   try {
//     const { project_name, description, manager_id, deadline, status } = req.body;

//     const updatedProject = await Project.findByIdAndUpdate(
//       req.params.id,
//       {
//         project_name,
//         description,
//         manager: manager_id,
//         deadline,
//         status,
//       },
//       { new: true }
//     ).populate("manager", "name email role");

//     if (!updatedProject)
//       return res.status(404).json({ message: "Project not found" });

//     res.status(200).json({ message: "Project updated successfully", project: updatedProject });
//   } catch (err) {
//     console.error("Update Project Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ---------------- Delete Project ----------------
// export const deleteProject = async (req, res) => {
//   try {
//     const deletedProject = await Project.findByIdAndDelete(req.params.id);
//     if (!deletedProject)
//       return res.status(404).json({ message: "Project not found" });

//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (err) {
//     console.error("Delete Project Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
