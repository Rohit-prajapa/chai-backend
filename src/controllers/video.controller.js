import mongoose, { isValidObjectId } from "mongoose";

import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 1. Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const allowedSortFields = ["createdAt", "views", "title"];

  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  const sortDirection = sortType === "asc" ? 1 : -1;

  const filter = {};

  if (query?.trim()) {
    filter.$or = [
      { title: { $regex: query.trim(), $options: "i" } },
      { description: { $regex: query.trim(), $options: "i" } },
    ];
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    filter.owner = userId;
  }

  // Public listing: only published videos
  filter.isPublished = true;

  const [videos, totalVideos] = await Promise.all([
    Video.find(filter)
      .populate("owner", "username fullName avatar")
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),

    Video.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          totalVideos,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalVideos / limitNumber),
          limit: limitNumber,
          hasNextPage: pageNumber * limitNumber < totalVideos,
          hasPreviousPage: pageNumber > 1,
        },
      },
      "Videos fetched successfully",
    ),
  );
});

// 2. Publish A Video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);

  if (!videoFile?.url) {
    throw new ApiError(400, "Video upload failed");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail?.url) {
    throw new ApiError(400, "Thumbnail upload failed");
  }

  const video = await Video.create({
    title: title.trim(),
    description: description.trim(),
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration || 0,
    owner: req.user._id,
    isPublished: true,
  });

  const publishedVideo = await Video.findById(video._id).populate(
    "owner",
    "username fullName avatar",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, publishedVideo, "Video published successfully"));
});

// 3. Get Video By ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullName avatar",
  );

  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  // Increase video views
  await Video.findByIdAndUpdate(videoId, {
    $inc: {
      views: 1,
    },
  });

  video.views += 1;

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// 4. Update Video
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(404, "Video not found or you are not authorized");
  }

  const updateFields = {};

  if (title !== undefined) {
    if (!title.trim()) {
      throw new ApiError(400, "Title cannot be empty");
    }

    updateFields.title = title.trim();
  }

  if (description !== undefined) {
    if (!description.trim()) {
      throw new ApiError(400, "Description cannot be empty");
    }

    updateFields.description = description.trim();
  }

  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail?.url) {
      throw new ApiError(400, "Thumbnail upload failed");
    }

    updateFields.thumbnail = thumbnail.url;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("owner", "username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// 5. Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const deletedVideo = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!deletedVideo) {
    throw new ApiError(404, "Video not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

// 6. Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(404, "Video not found or you are not authorized");
  }

  video.isPublished = !video.isPublished;

  await video.save({
    validateBeforeSave: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videoId: video._id,
        isPublished: video.isPublished,
      },
      `Video ${video.isPublished ? "published" : "unpublished"} successfully`,
    ),
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
