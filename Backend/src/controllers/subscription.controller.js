import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import { log } from '../contants.js';

// How many User Subscribed to the Channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Validate userId
  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, 'Invalid channel ID');
  }

  // Check if the channel exists
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, 'Channel not found');
  }

  // Aggregate to count the subscribers
  const subscribersData = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $count: 'subscribersCount',
    },
  ]);

  const subscribersCount =
    subscribersData.length > 0 ? subscribersData[0].subscribersCount : 0;

  log('Subscribers Count : ', subscribersCount);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribersCount },
        'Subscribers successfully fetched'
      )
    );
});

// Get How many Users are subscribed by the Channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // Validate subscriberId
  if (!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, 'Invalid subscriber ID');
  }

  // Check if the subscriber exists
  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new ApiError(404, 'Subscriber not found');
  }

  // Aggregate to count the subscribed channels
  const subscribedCount = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $count: 'subscribedCount',
    },
  ]);

  // Set default count to 0 if no subscriptions are found
  const count = subscribedCount.length ? subscribedCount[0].subscribedCount : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count },
        'Subscribed channels count fetched successfully'
      )
    );
});

// Toggle the Subscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, 'Invalid channel ID');
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiErrorpiError(404, 'Channel not found');
  }

  const existingSubscriber = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscriber) {
    await Subscription.findByIdAndDelete(existingSubscriber._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Unsubscribed successfully'));
  }

  const newSubscription = await Subscription.create({
    channel: channelId,
    subscriber: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newSubscription, 'Subscribed successfully'));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
