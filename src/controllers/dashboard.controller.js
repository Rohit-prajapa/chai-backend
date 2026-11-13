import mongoose from "mongoose";

import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Get Channel Statistics
const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channelStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const videoIds = await Video.find({
    owner: channelId,
  }).distinct("_id");

  const totalLikes = await Like.countDocuments({
    video: { $in: videoIds },
  });

  const stats = {
    totalVideos: channelStats[0]?.totalVideos || 0,
    totalViews: channelStats[0]?.totalViews || 0,
    totalSubscribers,
    totalLikes,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Channel statistics fetched successfully"),
    );
});

// 2. Get All Videos Uploaded By Channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);

  const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const allowedSortFields = ["createdAt", "views", "title"];

  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  const sortDirection = sortType === "asc" ? 1 : -1;

  const videos = await Video.find({
    owner: channelId,
  })
    .sort({
      [sortBy]: sortDirection,
    })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .populate("owner", "username fullname avatar");

  const totalVideos = await Video.countDocuments({
    owner: channelId,
  });

  const response = {
    videos,
    pagination: {
      totalVideos,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalVideos / limitNumber),
      limit: limitNumber,
      hasNextPage: pageNumber * limitNumber < totalVideos,
      hasPreviousPage: pageNumber > 1,
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "Channel videos fetched successfully"),
    );
});

export { getChannelStats, getChannelVideos };
