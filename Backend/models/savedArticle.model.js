import mongoose from "mongoose";

const savedArticleSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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
            required: true
        },
        publishDate: {
            type: Date,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        content: {
            type: String
        },
        image: {
            type: String
        },
        tags: [String],
        author: {
            type: String
        },
        readTime: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            enum: ['general', 'business', 'technology', 'health', 'science', 'entertainment', 'sports', 'other'],
            default: 'general'
        }
    },
    { timestamps: true }
);

// Compound index to prevent duplicate saves
savedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const SavedArticle = mongoose.model("SavedArticle", savedArticleSchema);