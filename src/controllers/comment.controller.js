import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import mongoose from 'mongoose';
import { Comment } from '../models/comment.model.js';

// Add Comment
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid Video Id');
  }

  if (!content) {
    throw new ApiError(400, 'Please provide comment content');
  }

  const comment = await Comment.create({
    content,
    owner: req.user?._id,
    video: videoId,
  });

  if (!comment) {
    throw new ApiError(404, 'Error while creating comment');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, 'Successfully commented'));
});

// Update Comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid Comment Id');
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, 'Not Authorized to update this comment');
  }

  if (!content) {
    throw new ApiError(400, 'Please provide comment content');
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, 'Error while updating comment');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, 'Successfully updated comment'));
});

// Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid Comment Id');
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, 'Not Authorized to delete this comment');
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new ApiError(404, 'Error while deleting comment');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Successfully deleted comment'));
});

// Get All Comment on Video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid Video Id');
  }

  const aggregate = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        'ownerDetails.uername': 1,
        'ownerDetails.avatar': 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const comments = await Comment.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, 'Successfully fetched comments'));
});

export { getVideoComments, addComment, updateComment, deleteComment };
