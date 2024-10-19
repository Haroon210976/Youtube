import { v2 as cloudinary } from 'cloudinary';
import { log } from '../contants.js';
import fs from 'fs';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract public ID from image url
const extractPublicId = (url) => {
  try {
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];

    return publicId;
  } catch (error) {
    log('Error extracting publicId:', error);
    return null;
  }
};

// Upload Image on Cloudinary
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

// Delete Image from Cloudinary
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return null;

    const publicId = extractPublicId(url);

    if (!publicId) {
      throw new Error('Invalid public ID extracted');
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      throw new Error('Failed to delete image from Cloudinary');
    }

    return result;
  } catch (error) {
    throw new Error('Failed to delete image');
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
