const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/ai-interview")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err.message));

const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({
      message: "Signup successful",
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.log("Signup error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json({
      message: "Login successful",
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.log("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

function cleanText(text) {
  return text
    .replace(/\u0000/g, " ")
    .replace(/\r/g, " ")
    .replace(/\n+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractSkills(lines) {
  const skills = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (
      lower.includes("programming languages:") ||
      lower.includes("web technologies:") ||
      lower.includes("frameworks/tools:") ||
      lower.includes("core concepts:")
    ) {
      const parts = line.split(":");
      if (parts[1]) {
        parts[1].split(",").forEach(item => {
          const skill = item.trim();
          if (skill) skills.push(skill);
        });
      }
    }
  }

  return [...new Set(skills)].slice(0, 12);
}

function extractProjects(lines) {
  const projects = [];

  for (const line of lines) {
    if (/^\d+\./.test(line)) {
      projects.push(line.replace(/^\d+\.\s*/, "").trim());
    }
  }

  return projects.slice(0, 4);
}

function calculateATS(text, skills, projects) {
  let score = 40;

  if (/professional summary/i.test(text)) score += 10;
  if (/technical skills/i.test(text)) score += 12;
  if (/projects/i.test(text)) score += 15;
  if (/internship|experience/i.test(text)) score += 10;
  if (/certifications|achievements/i.test(text)) score += 8;
  if (/github|linkedin|email|phone/i.test(text)) score += 5;

  score += Math.min(skills.length, 10);
  score += Math.min(projects.length * 3, 10);

  return Math.min(score, 95);
}

function generateQuestions({ skills, projects, stream, difficulty }) {
  const questions = [];

  questions.push("Tell me about yourself and your background.");

  if (projects.length > 0) {
    questions.push(`Explain your project "${projects[0]}" in detail.`);
  }

  if (projects.length > 1) {
    questions.push(`What did you learn from your project "${projects[1]}"?`);
  }

  if (skills.length > 0) {
    questions.push(`You mentioned "${skills[0]}". Where have you used it practically?`);
  }

  if (skills.length > 1) {
    questions.push(`Between "${skills[0]}" and "${skills[1]}", which one are you strongest in and why?`);
  }

  if (stream === "B.Tech" || stream === "BCA" || stream === "MCA") {
    questions.push("Describe one technical challenge you faced and how you solved it.");
  } else if (stream === "BBA" || stream === "MBA") {
    questions.push("Describe a business, teamwork, or leadership challenge you handled.");
  } else {
    questions.push("Describe one challenge from your academic or project journey.");
  }

  if (difficulty === "Hard") {
    questions.push("If your first solution fails, how would you improve it under pressure?");
  } else if (difficulty === "Medium") {
    questions.push("What are your strengths and what are you currently improving?");
  } else {
    questions.push("Why should we hire you?");
  }

  return [...new Set(questions)].slice(0, 6);
}

app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  let parser = null;

  try {
    const { stream = "B.Tech", difficulty = "Easy" } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file received by backend" });
    }

    console.log("📄 Upload received:", req.file.originalname);

    const fileName = (req.file.originalname || "").toLowerCase();
    if (!fileName.endsWith(".pdf")) {
      return res.status(400).json({ message: "Please upload a PDF file only" });
    }

    parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    const resumeText = cleanText(result.text || "");

    console.log("📄 Parsed text length:", resumeText.length);

    if (resumeText.length < 50) {
      return res.status(400).json({
        message: "PDF has too little readable text. Export your resume again as normal PDF."
      });
    }

    const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
    const skills = extractSkills(lines);
    const projects = extractProjects(lines);
    const atsScore = calculateATS(resumeText, skills, projects);
    const questions = generateQuestions({
      skills,
      projects,
      stream,
      difficulty
    });

    const keywords = [...new Set([...skills, ...projects])].slice(0, 10);

    res.json({
      message: "Resume analyzed successfully",
      atsScore,
      keywords,
      questions
    });
  } catch (err) {
    console.log("❌ Upload error:", err);
    res.status(500).json({
      message: "Resume processing failed on backend"
    });
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (_) {}
    }
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});