import Product from "../models/product.model.js";
import Review from "../models/review.model.js";


const createReview = async (req, res) => {
    try {
        const { productName, platform, content, sentimentScore } = req.body;

        if (!productName || !platform || !content) { // Mostly for debug purposes atm
            return res.status(404).json({
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
                message: "Product not found.",
                success: false,
            });
        }

        const review = new Review({
            product: product._id,
            content,
            platform,
            sentimentScore
        })

        const reviewEntry = await review.save();
        res.status(201).json({
            message: "Review created.",
            review: reviewEntry,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

const getReviewsByProduct = async (req, res) => {
    console.log("Fetching reviews for:", req.params.productId);
    try {
        const reviews = await Review.find({ product: req.params.productId });
        res.status(200).json({
            reviews,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export { createReview, getReviewsByProduct };