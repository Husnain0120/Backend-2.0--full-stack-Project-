import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js';
import { uploadoncloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from front-end
  const { fullname, email, username, password } = req.body;
//console.log("email", email);
  
  // Validation - check if any field is empty
  if ([fullname, email, username, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already registered
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check images, check for avatar
  // . . . console.log(req.files); . . . .
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
    coverImageLocalPath = req.files.coverImage?.[0].path;
  }


  
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadoncloudinary(avatarLocalPath);
  const coverImage = await uploadoncloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Create user object - create entry in database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return response
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

// Exporting the registerUser function for use in other parts of the application
export { registerUser };