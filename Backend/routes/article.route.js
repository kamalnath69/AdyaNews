import express from "express";
import { summarizeArticle,
    recommendArticles,
    getSavedArticles,
    saveArticle,
    unsaveArticle,
    toggleReadStatus,
    updateArticleCategory,
    updateArticleTags,
    getUserArticleMetadata } from "../controllers/article.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();


// Get all saved articles
router.get('/saved',verifyToken, getSavedArticles);

// Save an article
router.post('/save',verifyToken, saveArticle);

// Unsave an article
router.delete('/unsave/:articleId',verifyToken, unsaveArticle);

router.post("/summarize", verifyToken, summarizeArticle);
router.post("/recommend", verifyToken, recommendArticles);

router.put('/read/:articleId', verifyToken, toggleReadStatus);

// Update article category
router.put('/category/:articleId',verifyToken, updateArticleCategory);

// Update article tags
router.put('/tags/:articleId',verifyToken, updateArticleTags);

// Get user article metadata (categories and tags)
router.get('/metadata',verifyToken, getUserArticleMetadata);

export default router;