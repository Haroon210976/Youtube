import { v2 as cloudinary } from 'cloudinary';
import { log } from '../contants.js';
import fs from 'fs';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Corrected to a string
    });
    // log('File has been successfully uploaded:', response);

    // Clean up the local file
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Log the error for debugging
    log('Error uploading file to Cloudinary:', error);

    // Clean up the local file even in case of error
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
