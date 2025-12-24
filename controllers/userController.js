import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// ---------------- Multer Setup ----------------
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });


// ---------------- Login User ----------------
export const loginUser = async (req, res) => {
  try {
    const { employeeId, password, role } = req.body;

    const user = await User.findOne({ employeeId, role });
    if (!user)
      return res.status(404).json({ message: "Invalid employee ID or role" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, employeeId: user.employeeId, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "3h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        email: user.email,
        department: user.department,
        location: user.location,
        address: user.address,
        designation: user.designation,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        joining_date: user.joining_date,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Create User ----------------
export const createUser = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      role,
      password,
      department,
      designation,
      location,
      address,
      phone,
      joining_date,
    } = req.body;

    if (!employeeId || !name || !email || !role || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      employeeId,
      name,
      email,
      role,
      password: hashedPassword,
      department: department || "",
      designation: designation || "",
      phone: phone || "",
      joining_date: joining_date || "",
      profileImage: req.file ? `uploads/${req.file.filename}` : "",
    });

    await newUser.save();
    res.status(201).json({ message: "User created", user: newUser });

  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Get All Users ----------------
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- GET ONLY MANAGERS ----------------
export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" })
      .select("-password");

    res.status(200).json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error);
    res.status(500).json({ message: "Server error while fetching managers" });
  }
};


// ---------------- Get User By ID ----------------
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid User ID" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Update User ----------------
export const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid ID" });

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete old image
    if (req.file && user.profileImage && fs.existsSync(user.profileImage)) {
      fs.unlinkSync(user.profileImage);
    }

    const updatedData = { ...req.body };
    if (req.file) updatedData.profileImage = `uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.json({ message: "User updated", user: updatedUser });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Delete User ----------------
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid ID" });

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profileImage && fs.existsSync(user.profileImage)) {
      fs.unlinkSync(user.profileImage);
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
