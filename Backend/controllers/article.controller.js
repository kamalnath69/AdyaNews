import Groq from "groq-sdk";
import { SavedArticle } from "../models/savedArticle.model.js";
import mongoose from "mongoose";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const summarizeArticle = async (req, res) => {
  
  const { text } = req.body;
  try {
    const prompt = `
Given the following news article, do the following:
1. Summarize it in 3-5 key points.
2. Provide a main takeaway sentence.
3. Classify the overall sentiment as positive, negative, or neutral.

Respond in JSON with keys: key_points (array), main_takeaway (string), sentiment (string).

Article:
${text}
`;
    
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 512,
    });

    let result = {};
    try {
      console.log("Raw response:", completion.choices[0].message.content);
      const raw = completion.choices[0].message.content;
      const match = raw.match(/```json\s*([\s\S]*?)```|({[\s\S]*})/i);
      const jsonString = match ? (match[1] || match[2]) : raw;
      result = JSON.parse(jsonString);
    } catch {
      result = { key_points: [], main_takeaway: "", sentiment: "neutral" };
    }

    res.json(result);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Groq summarization failed" });
  }
};

export const recommendArticles = async (req, res) => {
  const { articles, target } = req.body;
  try {
    const prompt = `
Given the following list of articles and a target article, return the indices (0-based) of the 3 articles most similar in content to the target article. Respond as a JSON array of indices.

Target Article:
${target}

Articles:
${articles.map((a, i) => `[${i}]: ${a}`).join('\n')}
`;

    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 128,
    });

    let indices = [];
    try {
      indices = JSON.parse(completion.choices[0].message.content);
    } catch {
      indices = [];
    }

    res.json({ indices });
  } catch (error) {
    res.status(500).json({ error: "Groq recommendation failed" });
  }
};

// Get user's saved articles
export const getSavedArticles = async (req, res) => {
    try {
        const userId = req.userId;
        
        const savedArticles = await SavedArticle.find({ userId })
            .sort({ createdAt: -1 }); // Most recently saved first
        
        res.status(200).json(savedArticles);
    } catch (error) {
        console.error("Error fetching saved articles:", error);
        res.status(500).json({ message: "Error fetching saved articles" });
    }
};

// Save an article
export const saveArticle = async (req, res) => {
    try {
        const userId = req.userId;
        const articleData = req.body;
        
        // Check if already saved
        const existing = await SavedArticle.findOne({ 
            userId, 
            articleId: articleData.id 
        });
        
        if (existing) {
            return res.status(400).json({ message: "Article already saved" });
        }
        
        // Create new saved article
        console.log('content debug ', articleData.content);
        console.log('title description ', articleData.description);
        const savedArticle =  new SavedArticle({
            userId,
            articleId: articleData.id,
            title: articleData.title,
            source: articleData.source,
            publishDate: new Date(articleData.publishDate),
            description: articleData.description,
            content: articleData.content,
            image: articleData.image,
            tags: articleData.tags || [],
            author: articleData.author || 'Unknown',
            readTime: articleData.readTime || '5 min read',
            category: articleData.category || 'general',
            isRead: false
        });
        
        await savedArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        console.error("Error saving article:", error);
        res.status(500).json({ message: "Error saving article" });
    }
};

// Unsave an article
export const unsaveArticle = async (req, res) => {
    try {
        const userId = req.userId;
        const { articleId } = req.params;
        
        const result = await SavedArticle.findOneAndDelete({ userId, articleId });
        
        if (!result) {
            return res.status(404).json({ message: "Saved article not found" });
        }
        
        res.status(200).json({ message: "Article removed from saved items" });
    } catch (error) {
        console.error("Error removing saved article:", error);
        res.status(500).json({ message: "Error removing saved article" });
    }
};

// Toggle read status
export const toggleReadStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { articleId } = req.params;
        
        // Find the article with stringified IDs to avoid ObjectID issues
        const article = await SavedArticle.findOne({ 
            userId: userId.toString(), 
            articleId: articleId.toString() 
        });
        
        if (!article) {
            return res.status(404).json({ message: "Saved article not found" });
        }
        
        // Toggle the isRead status
        article.isRead = !article.isRead;
        await article.save();
        
        console.log(`Article ${articleId} read status toggled to: ${article.isRead}`);
        
        res.status(200).json({ 
            articleId,
            isRead: article.isRead 
        });
    } catch (error) {
        console.error("Error toggling read status:", error);
        res.status(500).json({ message: "Error updating article" });
    }
};

// Update article category
export const updateArticleCategory = async (req, res) => {
    try {
        const userId = req.userId;
        const { articleId } = req.params;
        const { category } = req.body;
        
        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }
        
        const article = await SavedArticle.findOne({ userId, articleId });
        
        if (!article) {
            return res.status(404).json({ message: "Saved article not found" });
        }
        
        article.category = category;
        await article.save();
        
        res.status(200).json({ 
            articleId,
            category 
        });
    } catch (error) {
        console.error("Error updating article category:", error);
        res.status(500).json({ message: "Error updating article category" });
    }
};

// Update article tags
export const updateArticleTags = async (req, res) => {
    try {
        const userId = req.userId;
        const { articleId } = req.params;
        const { tags } = req.body;
        
        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: "Tags must be an array" });
        }
        
        const article = await SavedArticle.findOne({ userId, articleId });
        
        if (!article) {
            return res.status(404).json({ message: "Saved article not found" });
        }
        
        article.tags = tags;
        await article.save();
        
        res.status(200).json({ 
            articleId,
            tags 
        });
    } catch (error) {
        console.error("Error updating article tags:", error);
        res.status(500).json({ message: "Error updating article tags" });
    }
};

// Get all categories and tags for the current user
export const getUserArticleMetadata = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get all categories
        const categoriesResult = await SavedArticle.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get all tags
        const tagsResult = await SavedArticle.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        const categories = categoriesResult.map(c => ({ 
            name: c._id, 
            count: c.count 
        }));
        
        const tags = tagsResult.map(t => ({ 
            name: t._id, 
            count: t.count 
        }));
        
        res.status(200).json({ categories, tags });
    } catch (error) {
        console.error("Error getting user article metadata:", error);
        res.status(500).json({ message: "Error fetching user data" });
    }
};