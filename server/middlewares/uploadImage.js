import multer from "multer";
import path from "path";
import fs from "fs";

const allowedFolders = [
  "announcements",
  "activities",
  "kajian",
  "posts",
  "about",
  "donation",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.type;

    if (!allowedFolders.includes(folder)) {
      return cb(new Error("Tipe upload tidak valid"));
    }

    const uploadPath = path.join(process.cwd(), "uploads", folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Format gambar harus JPG, PNG, atau WEBP"));
  }

  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});