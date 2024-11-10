import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { Video } from '../models/video.model.js';
import { Subscription } from '../models/subscription.model.js';
import { Like } from '../models/like.model.js';
import mongoose from 'mongoose';

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = await User.findById(channelId);

  if (!user) {
    throw new ApiError(400, 'channel Not found');
  }

  const totalVideos = await Video.countDocuments({ owner: channelId });

  const totalViewsResult = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: '$views',
        },
      },
    },
  ]);

  const totalViews =
    totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const totalLikes = await Like.countDocuments({ likedBy: channelId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes,
      },
      'Channel statistics fetched successfully'
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, 'Invalid Channel ID');
  }

  const user = await User.findById(channelId);
  if (!user) {
    throw new ApiError(404, 'Channel not found');
  }
  const videos = await Video.find({ owner: channelId });

  if (videos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], 'No videos uploaded by this channel'));
  }

  // Return the list of videos
  return res
    .status(200)
    .json(new ApiResponse(200, videos, 'Videos fetched successfully'));
});

export { getChannelStats, getChannelVideos };
