import Product from "../models/product.model.js";

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        if (!products) {
            res.status(400).json({
                message: "No existing products yet.",
                success:false
            })
        }
        res.status(200).json({
            products,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(400).json({
                message: "Product not found.",
                success:false
            })
        }
        res.status(200).json({
            product,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

const createProduct = async (req, res) => {
    try {
        const { name, brand, category, imageUrl, avgRating, sources } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Product name is required' });
        }

        if (avgRating !== undefined && (avgRating < 0 || avgRating > 5)) {
            return res.status(400).json({ message: 'Average rating must be between 0 and 5' });
        }

        if (sources && !Array.isArray(sources)) {
            return res.status(400).json({ message: 'Sources must be an array of strings' });
        }

        const newProduct = new Product({
            name: name.trim(),
            brand,
            category,
            avgRating,
            sources
        });

        const productEntry = await newProduct.save();
        return res.status(200).json({
            message: "Product saved to db successfully.",
            productEntry,
            success:true
        });
    } catch (error) {
        console.log(error);
    }
}

export { getAllProducts, getProductById, createProduct};