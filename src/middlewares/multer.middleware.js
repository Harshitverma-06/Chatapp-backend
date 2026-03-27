import multer from "multer";

// Store uploaded files in memory (no local temp files).
// This allows us to stream the buffer directly to Cloudinary.
export const upload = multer({
  storage: multer.memoryStorage(),
});
