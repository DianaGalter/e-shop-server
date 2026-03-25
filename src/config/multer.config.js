const multer = require("multer");
const path = require("path");

const uploadsRootDirectory = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, uploadsRootDirectory);
  },
  filename: (request, file, callback) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}${path.extname(file.originalname) || ".jpg"}`;
    callback(null, uniqueName);
  },
});

const fileFilter = (request, file, callback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    callback(null, true);
  } else {
    callback(
      new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
