import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User ID is required"],
        trim: true
    },
    userName: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        minlength: [2, "User name must be at least 2 characters long"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
    },
    review: {
        type: String,
        required: [true, "Review text is required"],
        trim: true,
        minlength: [10, "Review must be at least 10 characters long"],
        maxlength: [500, "Review cannot exceed 500 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Add text index for search functionality
ReviewSchema.index({ review: 'text', userName: 'text' });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;  
