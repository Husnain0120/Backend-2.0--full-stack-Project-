import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js';
import { uploadoncloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken'


// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to the user's document in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
  }
};

// Function to handle user registration
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Validation - check if any field is empty
  if ([fullname, email, username, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if a user with the same email or username already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check images - get avatar path from the request files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage?.[0]?.path;
  }

  // Validate presence of avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadoncloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadoncloudinary(coverImageLocalPath) : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Create a new user in the database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove password and refresh token fields from the response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return response with created user data
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

// Function to handle user login
const logInUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;
  console.log(email);
  if (!username && !email) {
    throw new ApiError(400, "Username or password is required");
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  // Generate access and refresh tokens
  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);

  // Remove sensitive fields from the response
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Return response with user data and set cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
      )
    );
});

// Function to handle user logout
const logOutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from the user's document in the database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    }, {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Clear cookies and return response
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});


// Function to refresh the access token using the refresh token
const refreshAccessToken = asyncHandler(async(req,res)=>{
 const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken ;

 if (!incomingRefreshToken) {
  throw new ApiError(401,"unauthorized request")
 }

try {
   const decodedToken =  jwt.verify(
    incomingRefreshToken.process.env.REFRESH_TOKEN_SECRET
   )
  
   const user =  await User.findById(decodedToken?._id)
  
   if (!user) {
    throw new ApiError(401,"invaild refresh Token")
   }
  
   if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401,"Refresh Token IN expired of used")
   }
  
   const options = {
    httpOnly:true,
    secure:true
   }
  
  const{accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newrefreshToken,options)
   .json(
    new ApiResponse(
      200,
      {accessToken,refreshToken:newrefreshToken,},
      "Access Token Refreshed "
    )
   )
} catch (error) {
  throw new ApiError (400,error?.message ||"invalid refresh token")
}

})

// Export functions for use in other parts of the application
export {
  registerUser,
  logInUser,
  logOutUser,
  refreshAccessToken,
};
