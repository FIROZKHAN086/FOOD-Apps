import Review from "../Model/ReviewM.js";

export const createReview = async (req, res) => {
    try {
        const { userId, userName, rating, review } = req.body;

        // Validate request body manually
        if (!userId || !userName || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (rating < 0 || rating > 6) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 0 and 6"
            });
        }

        if (review.length < 10 || review.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Review must be between 10 and 500 characters"
            });
        }

        // Create new review
        const newReview = await Review.create({
            userId,
            userName,
            rating,
            review
        });

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: newReview
        });
    } catch (error) {
        console.error("Error creating review: ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        if (isNaN(pageNumber) || isNaN(limitNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters"
            });
        }

        // Get total count
        const total = await Review.countDocuments();

        // Get paginated reviews
        const reviews = await Review.find()
            .sort(sort)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reviews found"
            });
        }

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / limitNumber),
                limit: limitNumber
            }
        });
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const searchReviews = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const reviews = await Review.find({
            $text: { $search: query }
        }).sort({ score: { $meta: "textScore" } });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reviews found matching your search"
            });
        }

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error("Error searching reviews: ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
