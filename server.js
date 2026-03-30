const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/ai-interview", {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ DB Error:", err.message));

const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String
});

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed
    });

    res.json({ message: "Signup success" });
  } catch (err) {
    console.log("Signup error:", err.message);
    res.status(500).json({ message: "Error in signup" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ message: "Wrong password" });
    }

    res.json({
      message: "Login success",
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.log("Login error:", err.message);
    res.status(500).json({ message: "Error in login" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});