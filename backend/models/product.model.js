import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  avgRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  sources: {
    type: [String], // ["YouTube", "Reddit", "TikTok"]
    default: [],
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

// check for uniques
ProductSchema.index({ name: 1, brand: 1 }, { unique: true });

export default mongoose.model('Product', ProductSchema);
