import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { Video } from '../models/video.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Playlist } from '../models/playlist.model.js';
import { Types } from 'mongoose';

// Create a Playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, 'Playlist Name and Description are mandatory');
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
    videos: [],
  });

  if (!playlist) {
    throw new ApiError(404, 'Playlist not created');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, 'Playlist created'));
});

// Get All User Playlists by userId
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid User');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, 'User not found');
  }

  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylists,
        'All user Playlists fetched successfully'
      )
    );
});

// Get Playlist By playlist id
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, 'Invalid Playlist');
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, 'Playlist Not Found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist successfully fetched'));
});

// Add Video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !playlistId ||
    !videoId ||
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, 'Invalid Playlist or Video');
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video Not Found');
  }

  const playlist = await Playlist.findById(playlistId);

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, 'Video already exists in the playlist');
  }

  playlist.videos.push(videoId);
  await playlist.save();

  // const playlist = await Playlist.findByIdAndUpdate(
  //   playlistId,
  //   {
  //     $addToSet: {
  //       videos: videoId,
  //     },
  //   },
  //   { new: true }
  // );

  if (!playlist) {
    throw new ApiError(404, 'Playlist Not Found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, 'Video Successfully added to playlist')
    );
});

// Remove Video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !playlistId ||
    !videoId ||
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, 'Invalid Playlist or Video');
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video Not Found');
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'Playlist Not Found');
  }

  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, 'Video Does not exists in the playlist');
  }

  const index = playlist.videos.indexOf(videoId);
  playlist.videos.splice(index, 1);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, 'Video Successfully removed from playlist')
    );
});

// Delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, 'Invalid Playlist');
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(404, 'Playlist Not Found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlistId }, 'Playlist Deleted successfully')
    );
});

// Update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, 'Invalid Playlist');
  }

  if (!name || !description) {
    throw new ApiError(400, 'Playlist Name and Description are mandatory');
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, 'Playlist Not Found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist Successfully Updated'));
});

// get all playlists of a video ?
const getAllPlaylistsOfVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid Video');
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video Not Found');
  }

  const playlists = await Playlist.find({ videos: videoId });
  if (!playlists) {
    throw new ApiError(404, 'Playlists Not Found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, 'Playlists fetched successfully'));
});

// get all playlists ?
const getAllPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find();
  if (!playlists) {
    throw new ApiError(404, 'Playlists Not Found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, 'All Playlists Fetched'));
});

// get all videos of playlist
const getAllVideosOfPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, 'Invalid Playlist');
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, 'Playlist Not Found');
  }

  const videos = await Video.find({
    _id: { $in: playlist.videos },
  });

  if (videos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], 'No videos found in playlist'));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, 'Videos fetched successfully'));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getAllPlaylistsOfVideo,
  getAllPlaylists,
  getAllVideosOfPlaylist,
};
