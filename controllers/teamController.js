import Team from "../models/Team.js";

// Create Team
export const createTeam = async (req, res) => {
  const { team_name, team_leader_id, member_ids } = req.body;
  try {
    const members = member_ids ? member_ids.map(id => ({ employee: id })) : [];
    const team = await Team.create({ team_name, team_leader: team_leader_id, members });
    await team.populate("team_leader", "name role email");
    await team.populate("members.employee", "name role email");
    res.status(201).json({ message: "Team created successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Teams
export const getTeams = async (req, res) => {
  try {
    let teams;
    if (req.user.role === "admin") {
      teams = await Team.find()
        .populate("team_leader", "name role email")
        .populate("members.employee", "name role email");
    } else {
      teams = await Team.find({
        $or: [{ team_leader: req.user.id }, { "members.employee": req.user.id }],
      })
        .populate("team_leader", "name role email")
        .populate("members.employee", "name role email");
    }
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, team_leader_id, member_ids } = req.body;
    const members = member_ids ? member_ids.map(empId => ({ employee: empId })) : [];
    const team = await Team.findByIdAndUpdate(
      id,
      { team_name, team_leader: team_leader_id, members },
      { new: true }
    )
      .populate("team_leader", "name role email")
      .populate("members.employee", "name role email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json({ message: "Team updated successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single team by ID
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id)
      .populate("team_leader", "name role email")
      .populate("members.employee", "name role email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
