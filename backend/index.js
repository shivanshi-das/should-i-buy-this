import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import Product from "./models/product.model.js";
dotenv.config({});
// import routers 
import productRoutes from "./routes/product.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials:true
}
app.use(cors(corsOptions));

// routes
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = 5000; // 8000 blocked for whatever reason

const startServer = async () => {
  try {
    await connectDB(); 
    await Product.syncIndexes(); // ensure indexes are up-to-date
    console.log("Product indexes synced");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit if can't connect or sync
  }
};

startServer();