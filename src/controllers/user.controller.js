import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary"
import { ApiResponse } from "../utils/ApiResonse.js";


const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation
  // check user is already exists or not
  //cehck for image or check for avatar
  // upload to clodinary
  //create user object- create entry in db
  // remove password and refresh token filed from response
  // check for user creation
  // return res

  const { username, fullname, email, password } = req.body
  console.log("username :", username);
  console.log("email", email);

  if (
    [fullname, email, username, password].some(() =>
    field?.trim()==="")
  ) {
    throw new ApiError(400,"all field are required");
  }
});

const existedUser=User.findOne({
  $or:[{username},{email}]
})

if (existedUser) {
  throw new ApiError(409,"username and password already exists");
}

const localPathavatar= req.files?.avatar[0]?.path;
const localPathcoverImage = req.files?.coverImage[0]?.path;

if (!localPathavatar) {
  throw new ApiError(400,"avatar is required");
}


const avatar = await uploadOnCloudinary(localPathavatar)
const coverImage =await uploadOnCloudinary(localPathcoverImage)
if (!avatar) {
  throw new ApiError(400,"avatar is Required");
}

const user=await User.create({
  fullname,
  avatar: avatar.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username:username.toLowercase()
})

const createdUser = await User.findById(user._Id).select(
  "-password  -refreshToken",
);

if (!createdUser) {
  throw new ApiError(500,"Internal Server Error");

}

return res.status(201).json(
  new ApiResponse(200,createdUser,"user register Successfully")
)





export { registerUser };
