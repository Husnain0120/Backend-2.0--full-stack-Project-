import { asyncHandler } from '../utils/async-handler.js';

const registerUser = asyncHandler(async (req, res) => {
    // Setting the response status to 200 (OK)
    // Sending a JSON response with a message "ok"
    res.status(200).json({
        message: "ok"
    });
});

// Exporting the registerUser function for use in other parts of the application
export { registerUser };
