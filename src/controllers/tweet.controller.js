import mongoose, { isValidObjectId } from "mongoose";

import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Create Tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  const createdTweet = await Tweet.findById(tweet._id).populate(
    "owner",
    "username fullname avatar",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweet created successfully"));
});

// 2. Get User Tweets
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const userExists = await User.findById(userId);

  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const skip = (page - 1) * limit;

  const [tweets, totalTweets] = await Promise.all([
    Tweet.find({
      owner: userId,
    })
      .populate("owner", "username fullname avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Tweet.countDocuments({
      owner: userId,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tweets,
        pagination: {
          totalTweets,
          currentPage: page,
          totalPages: Math.ceil(totalTweets / limit),
          limit,
          hasNextPage: page * limit < totalTweets,
          hasPreviousPage: page > 1,
        },
      },
      "User tweets fetched successfully",
    ),
  );
});

// 3. Update Tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  const updatedTweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: req.user._id,
    },
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("owner", "username fullname avatar");

  if (!updatedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to update it",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

// 4. Delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!deletedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to delete it",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
