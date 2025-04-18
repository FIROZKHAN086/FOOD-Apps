import { Router } from "express";
import { createReview, getReviews, searchReviews } from "../Controller/ReviweC.js";

const ReviewRouter = Router();

// Routes
ReviewRouter.post("/", createReview);
ReviewRouter.get("/", getReviews);
ReviewRouter.get("/search", searchReviews);

// Handle 404 for review routes
ReviewRouter.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

export default ReviewRouter;
