require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./db/connect");
const File = require("./models/File");
const fs = require("fs");
const rateLimit = require('express-rate-limit');
const nosqlSanitizer = require('express-nosql-sanitizer');
const { xss } = require('express-xss-sanitizer');

const sendEmailMailjet = require("./controllers/sendEmail");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());

app.set('trust proxy', 1); // Trust Render proxy

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use(nosqlSanitizer());
app.use(limiter);

const allowedOrigins = [
  'http://localhost:5173',
  'https://encrypt-share.vercel.app',
  /^https:\/\/encrypt-share.*\.vercel\.app$/   // All Vercel preview domains
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("Request Origin:", origin);
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    if (isAllowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

app.use(fileUpload());

// 📥 File Upload Route
app.post("/", express.json(), async (req, res) => {
  console.log("📥 Upload request received");

  if (!req.files || !req.files.encryptedFile) {
    console.log("❌ No file uploaded");
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.encryptedFile;
  const originalName = req.body.originalName;
  const receiverEmail = req.body.receiverEmail;
  const password = req.body.password;

  console.log("🔹 File:", file.name);
  console.log("🔹 originalName:", originalName);
  console.log("🔹 receiverEmail:", receiverEmail);
  console.log("🔹 password:", password);

  const filename = Date.now() + "_" + file.name;
  const uploadDir = __dirname + "/uploads";

  if (!fs.existsSync(uploadDir)) {
    console.log("📁 Creating uploads folder...");
    fs.mkdirSync(uploadDir);
  }

  const uploadPath = `${uploadDir}/${filename}`;

  try {
    console.log("💾 Moving file to:", uploadPath);
    await file.mv(uploadPath);

    const extension = path.extname(originalName);
    const fileId = uuidv4();
    const downloadLink = `${req.protocol}://${req.get('host')}/download/${fileId}`;

    console.log("🔗 Download Link:", downloadLink);

    const newFile = new File({
      fileName: filename,
      originalName,
      path: uploadPath,
      downloadLink,
      extension,
      password
    });

    await newFile.save();
    console.log("📝 File metadata saved to DB");

    if (receiverEmail) {
      try {
        console.log("📧 Sending email to:", receiverEmail);
        await sendEmailMailjet(receiverEmail, fileId);
        console.log("✅ Email sent");
      } catch (emailErr) {
        console.error("❌ Email error:", emailErr.message);
        return res.status(500).json({ msg: "Error sending email", error: emailErr.message });
      }
    }

    res.status(200).json({ msg: "File uploaded successfully", link: downloadLink });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).send({ msg: "Error while uploading file", error: err.message });
  }
});

// 📥 Download Route
app.get("/download/:id", async (req, res) => {
  try {
    const downloadLink = `${req.protocol}://${req.get('host')}/download/${req.params.id}`;
    const file = await File.findOne({ downloadLink });

    const password = req.headers['password'];
    if (!file || !file.path || file.password !== password) {
      return res.status(403).send({ msg: "Access denied" });
    }

    const filename = file.originalName || "downloaded_file";
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);

    res.download(file.path, filename, async (err) => {
      if (!err) {
        await File.deleteOne({ _id: file._id });

        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("❌ Error deleting file:", unlinkErr);
          } else {
            console.log("✅ File deleted after download");
          }
        });
      }
    });
  } catch (err) {
    console.error("❌ Download error:", err.message);
    res.status(500).send({ msg: "Error retrieving file", error: err.message });
  }
});

// 📧 Email Trigger Route
app.post("/send", express.json(), async (req, res) => {
  const { receiverEmail, fileID, senderName } = req.query;
  try {
    await sendEmailMailjet(receiverEmail, fileID, senderName);
    res.status(200).json({ msg: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start Server
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log("🚀 Server is listening on port " + port);
    });
  } catch (error) {
    console.error("❌ Startup error:", error.message);
  }
};

start();
