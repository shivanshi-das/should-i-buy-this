import Product from "../models/product.model.js";
import Review from "../models/review.model.js";


// Internal Use Only
const createReview = async (req, res) => {
    try {
        const { productName, platform, content, sentimentScore, pros, cons, author } = req.body;

        if (!productName || !platform || !content) { // Mostly for debug purposes atm
            return res.status(400).json({
                message: "Missing required fields: product, platform, or content",
                success: false,
            });
        }

        if (sentimentScore !== undefined && (sentimentScore < -1 || sentimentScore > 1)) {
            return res.status(400).json({
                message: "Sentiment score must be between -1 and 1",
                success: false,
            }); // debugging 
        }

        // fetch product id
        const product = await Product.findOne({ name: productName });

        if (!product) {
            return res.status(404).json({
                message: "Product not found. Create the product before adding reviews.",
                success: false,
            });
        }

        const review = new Review({
            product: product._id,
            platform,
            content,
            sentimentScore,
            pros,
            cons,
            author
        })

        const reviewEntry = await review.save();

        // Auto Update Avg Rating 

        const reviews = await Review.find({
            product: product._id,
            sentimentScore: { $ne: null }
        });

        const total = reviews.reduce((sum, r) => sum + r.sentimentScore, 0);
        const avg = reviews.length ? total / reviews.length : 0; 

        // update 

        product.avgRating = parseFloat(avg.toFixed(2)); // 2 decimal points 
        await product.save();

        return res.status(201).json({
            message: "Review created.",
            review: reviewEntry,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error while creating review.",
            success: false
        });
    }
}

// User Facing 
const getReviewsByProduct = async (req, res) => {
    try {
        // Optional filtering 
        const { productId } = req.params;
        const { platform } = req.query;

        if (!productId) {
            return res.status(400).json({
                message: "Missing productId in route parameter.",
                success: false
            });
        }

        const query = {
            product: productId
        }

        if (platform) {
            query.platform = platform;
        }
        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({
            reviews,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error while fetching reviews.",
            success: false
        });
    }
}

export { createReview, getReviewsByProduct };