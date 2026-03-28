const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  assignedStudentEmails: user.assignedStudentEmails || [],
  title: user.title || "",
  department: user.department || "",
  phone: user.phone || "",
  office: user.office || "",
  hours: user.hours || "",
  bio: user.bio || "",
});

// login/register
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// login/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // login/register - allow these roles for registration
    const allowedRoles = ["student", "lecturer", "coordinator", "admin", "guardian"];
    const selectedRole = role || "student";

    // login/register - validate selected role
    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        message: "Invalid role for registration",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: selectedRole,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error during registration",
    });
  }
};

// login/register
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error during login",
    });
  }
};

// login/register
const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    user: toUserResponse(req.user),
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};