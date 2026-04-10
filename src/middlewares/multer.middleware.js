import multer from "multer";

/**
 * Use in-memory uploads so services can push buffers to Cloudinary.
 * This matches usage across the codebase (e.g. `req.file.buffer`).
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
