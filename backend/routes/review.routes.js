import express from "express";
import { 
  createReview, 
  getReviewsByProduct, 
  analyzeProductReviews 
} from "../controllers/review.controller.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Test route is working" });
});

// Analyze a product using Reddit data
router.get("/analyze", analyzeProductReviews);

// Create a new review (internal use or manual entry)
router.post("/", createReview);

// Get all reviews for a specific product (by ObjectId)
// This MUST go last to avoid catching other routes like /analyze
router.get("/:productId", getReviewsByProduct);

export default router;
