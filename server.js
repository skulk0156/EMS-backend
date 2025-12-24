import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import teamRoutes from './routes/teamRoutes.js';
import dashboardRoute from './routes/dashboardRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/tasks.Routes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Mount all user routes
app.use("/api/users", userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/projects', projectRoutes);
app.use('/api/attendance', attendanceRoutes);




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Your Dababase is Connected to your Server ✅"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT} Congratulations`));
