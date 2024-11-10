import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';

// Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = 'createdAt',
    sortType = 'desc',
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // Create filter object based on query or userId
  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: 'i' }; // Case-insensitive search on title
  }
  if (userId) {
    filter.user = userId; // Filter videos by specific userId
  }

  // Handle pagination
  const skip = (page - 1) * limit;

  // Sort videos
  const sortOptions = {};
  sortOptions[sortBy] = sortType === 'asc' ? 1 : -1; // Ascending or descending

  // Retrieve videos with filters, pagination, and sorting
  const videos = await Video.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sortOptions)
    .exec();

  // Count total documents for pagination
  const totalVideos = await Video.countDocuments(filter);

  // Send API response with videos and pagination info
  res.status(200).json(
    new ApiResponse(200, videos, {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalVideos / limit),
      totalVideos,
    })
  );
});

// Public a video
const publishAVideo = asyncHandler(async (req, res) => {
  // get data --> title, description , video , thumbnail , isPublished
  // validate Data
  // Upload video and thumbnail on cloudinary
  // return response

  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video

  // Validation
  if (
    !title ||
    !description ||
    !req.files?.videoFile ||
    !req.files?.thumbnail
  ) {
    throw new ApiError(
      400,
      'Title , Description , Video and thumbnail are mandatory fields'
    );
  }

  let videoFileLocalPath, thumbnailLocalPath;
  if (req.files?.videoFile?.length > 0) {
    videoFileLocalPath = req.files.videoFile[0].path;
  }
  if (req.files?.thumbnail?.length > 0) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoFileLocalPath) {
    throw new ApiError(400, 'Video is Missing');
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, 'Thumbnail is Missing');
  }

  // Uplaod on Cloudinary
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, 'Video : Issues While Uploading on Cloudinary');
  }
  if (!thumbnail) {
    throw new ApiError(400, 'Thumbnail : Issues While Uploading on Cloudinary');
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile?.url || '',
    thumbnail: thumbnail?.url || '',
    isPublished: isPublished || true,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(500, 'Something went wrong while uploading video');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video is Successfully Published'));
});

// Get Video By ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not Found');
  }

  // Initialize lastView if it doesn't exist
  if (!req.session.lastView) {
    req.session.lastView = {};
  }

  // Check if the user has already viewed the video today
  const today = new Date().toISOString().split('T')[0]; // Get today's date

  if (req.session.lastView[videoId] !== today) {
    // If the user hasn't viewed this video today, increment the view count
    video.views += 1; // Increment the view count
    await video.save(); // Save the updated video document
    req.session.lastView[videoId] = today; // Update the last viewed date for this video
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $addToSet: { watchHistory: videoId },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video fetched Successfully'));
});

// Update Video Details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!title || !description) {
    throw new ApiError(400, 'All Fields Are mandatory');
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, 'Thumbnail is Missing');
  }

  // Upload on Cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail?.url) {
    throw new ApiError(
      400,
      'updated Thumbnail : Issues While Uploading on Cloudinary'
    );
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }
  if (video.thumbnail) {
    await deleteFromCloudinary(video.thumbnail, 'image');
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      title,
      description,
      thumbnail: thumbnail.url || '',
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(400, 'Issues while updating video details');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, 'Video Updated Successfully'));
});

// Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Delete the video file from Cloudinary
  try {
    await deleteFromCloudinary(video.videoFile, 'video');
    await deleteFromCloudinary(video.thumbnail, 'image');
  } catch (error) {
    throw new ApiError(
      500,
      'Error deleting video or thumbnail from Cloudinary'
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId }, 'Video Successfully Deleted'));
});

// Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid Video Id');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video publish status changed to ${video.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
