import express from "express";
import { createReview, getReviewsByProduct } from "../controllers/review.controller.js";

const router = express.Router();

// Get all reviews for a specific product
router.get("/:productId", getReviewsByProduct);

router.get("/test", (req, res) => {
  res.json({ message: "Test route is working" });
});

// Create a new review
router.post("/", createReview);


export default router;
