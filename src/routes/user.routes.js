import { Router } from "express";
import { logInUser, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
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
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
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

// Export the router for use in other parts of the application
export default router;
