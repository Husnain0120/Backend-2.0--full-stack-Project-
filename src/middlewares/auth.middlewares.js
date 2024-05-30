import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

// Middleware to verify JSON Web Token (JWT)
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Retrieve token from cookies or authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // If no token is found, throw an unauthorized error
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user associated with the token and exclude sensitive fields
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    // If no user is found, throw an invalid token error
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Attach the user to the request object for use in subsequent middleware
    req.user = user;
    next();
  } catch (error) {
    // Handle token verification errors
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
