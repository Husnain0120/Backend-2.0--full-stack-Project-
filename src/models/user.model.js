import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Define the schema for the User model
const userSchema = new Schema(
    {
        // User's username, must be unique and in lowercase
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        // User's email, must be unique and in lowercase
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // User's full name
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        // URL to the user's avatar image
        avatar: {
            type: String,
            required: true,
        },

        // URL to the user's cover image
        coverImage: {
            type: String,
        },

        // Array of video IDs that the user has watched
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        // User's password
        password: {
            type: String,
            required: [true, "Password is required"],
        },

        // Refresh token for the user's session
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);



// Middleware to hash the user's password before saving it to the database
userSchema.pre("save", async function (next) {
    // If the password hasn't been modified, skip hashing
    if (!this.isModified("password")) return next();

    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});



// Method to check if the provided password matches the hashed password in the database
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};



// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};



// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};



// Create and export the User model
export const User = mongoose.model("User", userSchema);
