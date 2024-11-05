import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Like } from '../models/like.model.js';
import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { Comment } from '../models/comment.model.js';
import { Tweet } from '../models/tweet.model.js';

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate videoId
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Check if the video is already liked by the user
  const likedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (likedVideo) {
    // If a like exists, remove it to unlike the video
    await likedVideo.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Video successfully unliked'));
  }

  // Otherwise, create a new like document
  const likeVideo = await Like.create({
    likedBy: req.user._id,
    video: videoId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, likeVideo, 'Video successfully liked'));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Validate commentId
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid Comment ID');
  }

  // Check if the Comment exists
  const comment = await Comment.findById(commentId); // Corrected model name
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Check if the comment is already liked by the user
  const likedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (likedComment) {
    // If a like exists, remove it to unlike the comment
    await likedComment.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Comment successfully unliked'));
  }

  // Otherwise, create a new like document
  const likeComment = await Like.create({
    likedBy: req.user._id,
    comment: commentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, likeComment, 'Comment successfully liked'));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Validate tweetId
  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, 'Invalid tweet ID');
  }

  // Check if the tweet exists
  const tweet = await Tweet.findById(tweetId); // Corrected model name
  if (!tweet) {
    throw new ApiError(404, 'Tweet not found');
  }

  // Check if the tweet is already liked by the user
  const likedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (likedTweet) {
    // If a like exists, remove it to unlike the tweet
    await likedTweet.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Tweet successfully unliked'));
  }

  // Otherwise, create a new like document
  const likeTweet = await Like.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, likeTweet, 'Tweet successfully liked'));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user?._id,
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'videoDetails',
      },
    },
    {
      $unwind: '$videoDetails',
    },
  ]);

  if (!likedVideos.length) {
    throw new ApiError(404, 'No liked videos found for this user');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, 'Liked videos retrieved successfully')
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
