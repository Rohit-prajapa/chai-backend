import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  const { username, fullname, email, password } = req.body;
console.log("REQUEST BODY:", req.body);
console.log("REQUEST FILES:", req.files);
  // Validation
  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  // Get local file paths
  const localPathAvatar = req.files?.avatar?.[0]?.path;
  const localPathCoverImage = req.files?.coverImage?.[0]?.path;

  // Check avatar
  if (!localPathAvatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(localPathAvatar);

  // Upload cover image if provided
  const coverImage = localPathCoverImage
    ? await uploadOnCloudinary(localPathCoverImage)
    : null;

  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Create user
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove password and refreshToken from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // Return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
