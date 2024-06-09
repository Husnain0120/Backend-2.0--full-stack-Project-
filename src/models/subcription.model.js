import mongoose, { Schema } from "mongoose";

// Define the subscription schema
const subscriptionSchema = new Schema(
  {


    // Reference to the user who is subscribing
    subscriber: {
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true // Add required to ensure this field is always provided
    },


    // Reference to the user who is being subscribed to (the channel)
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true // Add required to ensure this field is always provided
    },


    
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt timestamps
  }
);

// Create the Subscription model from the schema
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
