require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./db/connect");
const File = require("./models/File");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const nosqlSanitizer = require("express-nosql-sanitizer");
const { xss } = require("express-xss-sanitizer");
const sendEmailMailjet = require("./controllers/sendEmail");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.set("trust proxy", true);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    console.warn(`🚫 Too many requests from ${req.ip}`);
    res.status(429).json({ msg: "Too many requests — slow down." });
  },
});

app.use(nosqlSanitizer());
app.use(limiter);

const allowedOrigins = [
  "http://localhost:5173",
  "https://encrypt-share.vercel.app",
  /^https:\/\/encrypt-share.*\.vercel\.app$/,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      );
      if (isAllowed) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(fileUpload());

// 📥 Upload Route
app.post("/", async (req, res) => {
  if (!req.files || !req.files.encryptedFile) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.encryptedFile;
  const { originalName, receiverEmail, password, expiryMinutes } = req.body;
  const userId = req.headers["user-id"];
  const filename = Date.now() + "_" + file.name;
  const uploadDir = path.join(__dirname, "/uploads");

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  const uploadPath = path.join(uploadDir, filename);

  try {
    await file.mv(uploadPath);
    const extension = path.extname(originalName);
    const fileId = uuidv4();
    const downloadLink = `${req.protocol}://${req.get("host")}/download/${fileId}`;
    const expiresAt = expiryMinutes
      ? new Date(Date.now() + parseInt(expiryMinutes) * 60000)
      : null;

    const newFile = new File({
      fileName: filename,
      originalName,
      path: uploadPath,
      downloadLink,
      extension,
      password,
      userId,
      expiresAt,
    });

    await newFile.save();

    if (receiverEmail) {
      await sendEmailMailjet(receiverEmail, fileId);
    }

    res.status(200).json({ msg: "File uploaded successfully", link: downloadLink });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ msg: "Error while uploading file", error: err.message });
  }
});

// 📥 Download Route
app.get("/download/:id", async (req, res) => {
  const downloadLink = `${req.protocol}://${req.get("host")}/download/${req.params.id}`;
  const file = await File.findOne({ downloadLink });

  const password = req.headers["password"];
  if (!file || !file.path || file.password !== password) {
    return res.status(403).json({ msg: "Access denied" });
  }

  if (file.expiresAt && new Date() > file.expiresAt) {
    fs.unlink(file.path, () => {});
    file.deleted = true;
    file.deletedAt = new Date();
    await file.save();
    return res.status(410).json({ msg: "File has expired and is no longer available." });
  }

  const filename = file.originalName || "downloaded_file";
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);

  res.download(file.path, filename, async (err) => {
    if (!err) {
      fs.unlink(file.path, () => {});
      file.deleted = true;
      file.deletedAt = new Date();
      await file.save();
    }
  });
});


// 📧 Email Trigger
app.post("/send", express.json(), async (req, res) => {
  const { receiverEmail, fileID, senderName } = req.query;
  try {
    await sendEmailMailjet(receiverEmail, fileID, senderName);
    res.status(200).json({ msg: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🧪 Healthcheck
app.get("/ping", (req, res) => {
  res.status(200).send("✅ Backend is alive");
});

// 📂 Get User Files
app.get("/my-files", async (req, res) => {
  const userId = req.headers["user-id"];
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  try {
    // Return both active and deleted files
    const files = await File.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ files });
  } catch (err) {
    res.status(500).json({ msg: "Failed to retrieve files" });
  }
});


// ⏰ Auto-cleanup expired files every minute
setInterval(async () => {
  try {
    const now = new Date();
    const expiredFiles = await File.find({
      expiresAt: { $lte: now },
      deleted: { $ne: true },
    });

    for (const file of expiredFiles) {
      fs.unlink(file.path, (err) => {
        if (err) console.error("❌ Failed to delete file:", err.message);
      });
      file.deleted = true;
      file.deletedAt = now;
      await file.save();
    }
  } catch (err) {
    console.error("❌ Cleanup error:", err.message);
  }
}, 60 * 1000);
 // Every 1 minute

// 🚀 Start Server
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log("🚀 Server running on port", port));
  } catch (error) {
    console.error("❌ Startup error:", error.message);
  }
};

start();
