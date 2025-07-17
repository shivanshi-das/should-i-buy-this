import express from "express";
import { getAllProducts, getProductById, createProduct} from "../controllers/product.controller.js";

const router = express.Router();


// GET /api/products
// Get all products
router.get('/', getAllProducts);

// GET /api/products/:id
// Get a single product by ID
router.get('/:id', getProductById);

// POST /api/products
// Create a new product
router.post('/', createProduct);

export default router;
