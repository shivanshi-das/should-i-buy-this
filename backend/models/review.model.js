import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  platform: {
    type: String, // e.g., "YouTube", "Reddit", "TikTok"
    required: true,
    trim: true
  },
  author: { // optional : in the case that it is a user review 
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  sentimentScore: {
    type: Number, // -1 = very negative, 0 = neutral, 1 = very positive
    min: -1,
    max: 1
  },
  pros: {
    type: [String],
    default: []
  },
  cons: {
    type: [String],
    default: []
  },
  url: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Review', ReviewSchema);
