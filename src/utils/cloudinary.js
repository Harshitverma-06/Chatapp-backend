import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";

// Configuration of Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads an in-memory buffer to Cloudinary using `upload_stream`.
// Works with multer `memoryStorage()` where `req.file.buffer` is available.
const uploadOnCloudinary = async (buffer, options = {}) => {
  if (!buffer) return null;

  // Some clients may still send a base64/data URL string.
  if (typeof buffer === "string") {
    return cloudinary.uploader.upload(buffer, {
      resource_type: "auto",
      ...options,
    });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return null;
    
    // Extract public_id from the Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{extension}
    const urlParts = imageUrl.split("/");
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const publicId = filenameWithExtension.split(".")[0];
    
    // Delete from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary", response);
    return response;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new ApiError(500,error);
  }
};

export { uploadOnCloudinary , deleteFromCloudinary };
