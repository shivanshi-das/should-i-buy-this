import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import { searchFilteredPosts } from "../reddit/fetchPosts.js";
import { flattenToReviewCandidates } from "../reddit/utils.js";
import {
    isReviewLike,
    positiveKeywords,
    negativeKeywords
} from "../reddit/reviewSignals.js";

function extractSentences(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
}

function generateProductVariants(productName) {
    const base = productName.toLowerCase();
    const tokens = base.split(/\s+/);
    const variants = new Set([
        base,
        tokens.join(" "),
        tokens.filter(t => t !== "by").slice(0, 2).join(" "),
        tokens.find(t => t.length > 2),
        tokens.slice(-1)[0]
    ]);
    return [...variants];
}

function filterValidSentimentSnippets(sentences, productVariants, keywords) {
    const validSnippets = [];

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const lower = sentence.toLowerCase();

        if (keywords.some(k => lower.includes(k))) {
        if (keywords.some(k => lower.includes(k))) {
            const contextWindow = [
                sentences[i - 2] || "",
                sentences[i - 1] || "",
                sentence,
                sentences[i + 1] || "",
                sentences[i + 2] || "",
            ].join(" ").toLowerCase();

            const matchCount = productVariants.filter(v => contextWindow.includes(v)).length;
            const hasStrongMatch = productVariants.some(v => contextWindow.includes(v) && v.split(" ").length >= 2);
            const sentenceHasProductMention = productVariants.some(v => lower.includes(v));

            if ((matchCount >= 2 || hasStrongMatch) && sentenceHasProductMention) {
                validSnippets.push(sentence.trim());
            }
        }
    }

    return validSnippets;
}



const calculateSentiment = (text, productName) => {
    const content = text.toLowerCase();
    let score = 0;
    const pros = [];
    const cons = [];
    const prosWithContext = [];
    const consWithContext = [];

    const sentences = extractSentences(text);
    const productVariants = generateProductVariants(productName);

    const validPros = filterValidSentimentSnippets(sentences, productVariants, positiveKeywords);
    const validCons = filterValidSentimentSnippets(sentences, productVariants, negativeKeywords);

    for (const sentence of validPros) {
        for (const word of positiveKeywords) {
            if (sentence.toLowerCase().includes(word)) {
                score += 1;
                pros.push(word);
                prosWithContext.push(sentence);
            }
        }
    }

    for (const sentence of validCons) {
        for (const word of negativeKeywords) {
            if (sentence.toLowerCase().includes(word)) {
                score -= 1;
                cons.push(word);
                consWithContext.push(sentence);
            }
        }
    }

    const sentimentScore = Math.max(-1, Math.min(score / 5, 1));

    return {
        sentimentScore,
        pros,
        cons,
        prosWithContext,
        consWithContext,
        keywordCounts: {
            positives: countBy(pros),
            negatives: countBy(cons)
        }
    };
};

function countBy(arr) {
    return arr.reduce((acc, k) => {
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});
}

const createReview = async (req, res) => {
    try {
        const { productName, platform, content, sentimentScore, pros, cons, author } = req.body;

        if (!productName || !platform || !content) {
            return res.status(400).json({
                message: "Missing required fields: product, platform, or content",
                success: false,
            });
        }

        if (sentimentScore !== undefined && (sentimentScore < -1 || sentimentScore > 1)) {
            return res.status(400).json({
                message: "Sentiment score must be between -1 and 1",
                success: false,
            });
        }

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
        });

        const reviewEntry = await review.save();

        const reviews = await Review.find({
            product: product._id,
            sentimentScore: { $ne: null }
        });

        const total = reviews.reduce((sum, r) => sum + r.sentimentScore, 0);
        const avg = reviews.length ? total / reviews.length : 0;

        product.avgRating = parseFloat(avg.toFixed(2));
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

const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { platform } = req.query;

        if (!productId) {
            return res.status(400).json({
                message: "Missing productId in route parameter.",
                success: false
            });
        }

        const query = { product: productId };
        if (platform) query.platform = platform;

        const reviews = await Review.find(query).sort({ createdAt: -1 }).select("-__v");

        res.status(200).json({ reviews, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error while fetching reviews.",
            success: false
        });
    }
}

export const analyzeProductReviews = async (req, res) => {
    try {
        const productName = req.query.product;
        const shouldSave = req.query.save === "true";
        const subreddits = [
            "MakeupAddiction", "SkincareAddiction", "beautytalkph",
            "AsianBeauty", "oliveMUA", "MakeupReviews",
            "MakeupRehab", "drugstoreMUA", "makeup", "Sephora"
        ];

        if (![productName]) {
            return res.status(400).json({ error: "Missing ?product parameter" });
        }

        const rawThreads = await searchFilteredPosts(productName, subreddits, 20);
        const candidates = flattenToReviewCandidates(rawThreads);
        const filtered = candidates.filter(c => isReviewLike(c.content));

        let pros = [], cons = [], topQuotes = [], totalScore = 0;
        let prosWithContext = [], consWithContext = [];
        const reviewDocs = [];

        for (const entry of filtered) {
            const {
                sentimentScore,
                pros: p,
                cons: c,
                prosWithContext: pCtx,
                consWithContext: cCtx
            } = calculateSentiment(entry.content, productName);

            totalScore += sentimentScore;
            pros.push(...p);
            cons.push(...c);
            prosWithContext.push(...pCtx);
            consWithContext.push(...cCtx);

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
                    });
                }
            }
        }

        topQuotes = [...filtered]
            .sort((a, b) => b.upvotes - a.upvotes)
            .slice(0, 10)
            .map(entry => ({
                ...entry,
                ...calculateSentiment(entry.content, productName)
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
            prosContext: [...new Set(prosWithContext)],
            consContext: [...new Set(consWithContext)],
            keywordCounts: {
                positives: countBy(pros),
                negatives: countBy(cons)
            },
            topQuotes,
            totalReviews: filtered.length
        });
    } catch (error) {
        console.error("Error in analyzeProductReviews:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { createReview, getReviewsByProduct };