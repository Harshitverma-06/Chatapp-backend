import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

// Configuration of Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    
    // Check if file exists before uploading
    if (!fs.existsSync(localfilepath)) {
      throw new Error(`File not found at path: ${localfilepath}`);
    }

    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    
    //file has been uploaded succesfully
    console.log("File is uploaded on Cloudinary", response.url);
    
    // Delete local file after successful upload
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
      console.log("Local file deleted:", localfilepath);
    }
    
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    
    // Remove the locally saved temporary file as the upload operation failed
    if (fs.existsSync(localfilepath)) {
      try {
        fs.unlinkSync(localfilepath);
        console.log("Local file deleted after error:", localfilepath);
      } catch (deleteError) {
        console.error("Error deleting local file:", deleteError);
      }
    }
    
    throw error;
  }
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
