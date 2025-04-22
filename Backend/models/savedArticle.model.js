import mongoose from "mongoose";

const savedArticleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  articleId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: 'Unknown'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  description: String,
  content: String,
  image: String,
  tags: {
    type: [String],
    default: []
  },
  author: {
    type: String,
    default: 'Unknown'
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  category: {
    type: String,
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add a compound index to prevent duplicate saves
savedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const SavedArticle = mongoose.model("SavedArticle", savedArticleSchema);