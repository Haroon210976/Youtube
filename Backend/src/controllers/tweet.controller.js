import mongoose from 'mongoose';
import { Tweet } from '../models/tweet.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create Tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, 'Content for tweet not found');
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, 'Tweet Successfully Created'));
});

// Get User Tweets
const getUserTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find({ owner: req.user?._id });

  if (!tweets.length) {
    throw new ApiError(404, 'No tweets Found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, 'Tweets Successfully fetched'));
});

// Update Tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, 'Invalid Tweet Id');
  }

  if (!content) {
    throw new ApiError(400, 'Content for tweet not found');
  }

  const tweet = await Tweet.findById(tweetId);

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are Allowed to Update this tweet');
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(500, 'Issues while updating tweet');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, 'Tweet Successfully Updated'));
});

// Delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, 'Invalid Tweet Id');
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, 'Tweet not found');
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are Allowed to Update this tweet');
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(500, 'Error occurred while deleting the tweet');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweetId, 'Tweet Successfully Deleted'));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
