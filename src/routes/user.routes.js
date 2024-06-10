import { Router } from "express";
import { 
    changeCurrentPassword,
    getChannelProfile, 
    getCurrentUser, 
    getWatchHistory, 
    logInUser, 
    logOutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage 
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

// Create a new router instance
const router = Router();

// Route for user registration
// This route uses the 'upload' middleware to handle file uploads for avatar and coverImage
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1 // Maximum of one file for 'avatar'
        },
        {
            name: "coverImage",
            maxCount: 1 // Maximum of one file for 'coverImage'
        }
    ]),
    registerUser // Controller to handle user registration
);

// Route for user login
router.route("/login").post(logInUser); // Controller to handle user login

// Secured routes (requires JWT verification)

// Route for user logout
router.route("/logout").post(verifyJWT, logOutUser); // Controller to handle user logout, with JWT verification

// Route to refresh the access token
router.route("/refresh-token").post(refreshAccessToken); // Controller to handle access token refresh

// Route to change the current user's password
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // Controller to handle password change, with JWT verification

// Route to get the current user's details
router.route("/current-user").get(verifyJWT, getCurrentUser); // Controller to get current user details, with JWT verification

// Route to update account details
router.route("/update-account").patch(verifyJWT, updateAccountDetails); // Controller to update account details, with JWT verification

// Route to update the user's avatar
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar); // Controller to update user avatar, with JWT verification and file upload handling

// Route to update the user's cover image
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage); // Controller to update user cover image, with JWT verification and file upload handling

// Route to get a user's channel profile by username
router.route("/c/:username").get(verifyJWT, getChannelProfile); // Controller to get channel profile, with JWT verification

// Route to get the current user's watch history
router.route("/history").get(verifyJWT, getWatchHistory); // Controller to get watch history, with JWT verification

// Export the router for use in other parts of the application
export default router;
