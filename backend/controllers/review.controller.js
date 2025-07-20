import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import { searchFilteredPosts } from "../reddit/fetchPosts.js";
import { flattenToReviewCandidates } from "../reddit/utils.js"; // Create this if not done
import {
    isReviewLike,
    positiveKeywords,
    negativeKeywords
} from "../reddit/reviewSignals.js";
import { raw } from "express";


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

        // auto update avg rating 

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

// helper : score sentiment + extract pros/cons 

const calculateSentiment = (text) => {
    const content = text.toLowerCase();
    let score = 0;
    const pros = [];
    const cons = [];

    for (const word of positiveKeywords) {
        if (content.includes(word)) {
            score += 1;
            pros.push(word);
        }
    }

    for (const word of negativeKeywords) {
        if (content.includes(word)) {
            score -= 1;
            cons.push(word);
        }
    }

    const sentimentScore = Math.max(-1, Math.min(score / 5, 1)); // -1 to 1
    return { sentimentScore, pros, cons };
}

export const analyzeProductReviews = async (req, res) => {
    try {
        const productName = req.query.product;
        const shouldSave = req.query.save === "true";
        const subreddits = ["MakeupAddiction", "SkincareAddiction", "beautytalkph", "AsianBeauty"]; // test

        if (![productName]) {
            return res.status(400).json({ error: "Missing ?product parameter" });
        }

        const rawThreads = await searchFilteredPosts(productName, subreddits, 10);
        const candidates = flattenToReviewCandidates(rawThreads);
        const filtered = candidates.filter(c => isReviewLike(c.content));

        let pros = [], cons = [], topQuotes = [], totalScore = 0;
        const reviewDocs = [];

        // collect score per candidate; prepare optional review docs;

        for (const entry of filtered) {
            const { sentimentScore, pros: p, cons: c } = calculateSentiment(entry.content);
            totalScore += sentimentScore;

            pros.push(...p);
            cons.push(...c);

            console.log("Filtered entries for topQuotes:", filtered.length);
            console.log("Sample entry:", filtered[0]);

            if (shouldSave) {
                const productDoc = await Product.findOne({ name: productName });
                if (productDoc) {
                    reviewDocs.push({
                        product: productDoc._id,
                        platform: "Reddit",
                        author: entry.author || "unknown",
                        content: entry.content,
                        sentimentScore,
                        pros: [...new Set(p)],
                        cons: [...new Set(c)],
                        url: entry.url
                    })
                }
            }
        }

        topQuotes = [...filtered]
            .map(entry => ({
                ...entry,
                ...calculateSentiment(entry.content)
            }))
            .sort((a, b) => b.sentimentScore - a.sentimentScore)
            .slice(0, 3)
            .map(e => ({
                snippet: e.content.slice(0, 150),
                author: e.author,
                url: e.url
            }));


        const avgSentiment = filtered.length ? totalScore / filtered.length : 0;
        let verdict = "Maybe";
        if (avgSentiment > 0.5) verdict = "Yes";
        else if (avgSentiment < 0) verdict = "No";

        return res.json({
            product: productName,
            verdict,
            sentimentScore: avgSentiment.toFixed(2),
            pros: [...new Set(pros)],
            cons: [...new Set(cons)],
            topQuotes,
            totalReviews: filtered.length
        });
    } catch (error) {
        console.error("Error in analyzeProductReviews:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
export { createReview, getReviewsByProduct };