import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { EventRegistry, QueryArticlesIter } from "eventregistry"; // Import Event Registry
import adminRoutes from "./routes/admin.route.js";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.routes.js";
import articleRoutes from "./routes/article.route.js";
import { User } from "./models/user.model.js"; // Import User model
import { verifyToken } from "./middleware/verifyToken.js"; // Import auth middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Update your CORS configuration to properly handle OPTIONS requests
const corsOptions = {
  origin: '*', // Since we're not using credentials, wildcard is fine
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], 
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
  credentials: false // Explicitly disable credentials
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '5mb' })); // allows us to parse incoming requests:req.body
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/article", articleRoutes);
app.use("/api/admin", adminRoutes);

// Add explicit OPTIONS handler for the news endpoint
app.options('/api/news', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.sendStatus(204);
});

// 🔐 Replace this with your Event Registry API key
const er = new EventRegistry({ apiKey: process.env.NEWS_API_KEY });

// Make news API route protected with auth middleware
app.get("/api/news/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // This comes from authMiddleware
    
    // Get user from database to check language preference
    const user = await User.findById(userId);
    const userLanguage = user?.language || 'en'; // Default to English if not found
    
    // Map the ISO language code to EventRegistry's format
    const langMap = {
      'en': 'eng',
      'es': 'spa',
      'fr': 'fra',
      'it': 'ita',
      'pt': 'por',
      'ru': 'rus',
      'ar': 'ara',
      'zh': 'zho',
      'ja': 'jpn',
      'ko': 'kor',
      'hi': 'hin',
      'ta': 'tam',
      // Add more mappings as needed
    };
    
    // Convert to EventRegistry language format or default to 'eng'
    const erLanguage = langMap[userLanguage] || 'eng';
    
    const query = {
      main: req.query.q || '',
      topic: req.query.topic || '',
      category: req.query.category || '',
      source: req.query.source || ''
    };

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    // Build query string, filtering out empty values
    const queryTerm = Object.values(query)
      .filter(term => term.trim())
      .join(' ') || 'latest';

    // Pass the language to fetchArticles
    let articles = await fetchArticles(queryTerm, page, pageSize, erLanguage);
    
    // If no results and we have multiple terms, try with main query only
    if (articles.length === 0 && query.main) {
      articles = await fetchArticles(query.main, page, pageSize, erLanguage);
    }

    res.json(articles);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Public news API route without auth middleware (add this after your existing news route)
app.get("/api/public/news/", async (req, res) => {
  try {
    // Hardcode language to English
    const erLanguage = 'eng'; // EventRegistry format for English
    
    const query = {
      main: req.query.q || '',
      topic: req.query.topic || '',
      category: req.query.category || '',
      source: req.query.source || ''
    };

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    // Build query string, filtering out empty values
    const queryTerm = Object.values(query)
      .filter(term => term.trim())
      .join(' ') || 'latest';

    // Pass the language to fetchArticles
    let articles = await fetchArticles(queryTerm, page, pageSize, erLanguage);
    
    // If no results and we have multiple terms, try with main query only
    if (articles.length === 0 && query.main) {
      articles = await fetchArticles(query.main, page, pageSize, erLanguage);
    }

    res.json(articles);
  } catch (error) {
    console.error("Error fetching public news:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Update the fetchArticles function to be more robust
async function fetchArticles(searchQuery, page = 1, pageSize = 9, language = "eng") {
  try {
    const articlesIter = new QueryArticlesIter(er, {
      keywords: searchQuery,
      lang: language,
      isDuplicateFilter: "keepAll",
      startSourceRankPercentile: 0, // Allow all sources for better results
      endSourceRankPercentile: 100,
      dataType: ["news", "pr"],
      sortBy: "date",
      maxItems: page * pageSize + 5 // Fetch a few extra to ensure we have enough
    });

    const articles = [];
    let count = 0;
    
    for await (const article of articlesIter) {
      if (count >= page * pageSize) break;
      
      // Skip articles without essential fields
      if (!article.title || !article.body) continue;
      
      articles.push({
        id: article.uri || article.id || `article-${Date.now()}-${count}`,
        title: article.title || "Untitled Article",
        url: article.url || "#",
        date: article.date || new Date().toISOString(),
        source: article.source?.title || "Unknown Source",
        image: article.image || "https://via.placeholder.com/640x360?text=No+Image+Available",
        description: article.body?.substring(0, 160) + "..." || "No description available",
        content: article.body || "Article content unavailable",
        author: article.author || "Unknown",
        publishDate: article.date || new Date().toISOString(),
      });
      
      count++;
    }

    // Return only the articles for the requested page
    const start = (page - 1) * pageSize;
    const result = articles.slice(start, start + pageSize);
  
    
    return result;
  } catch (error) {
    console.error("Error in fetchArticles:", error);
    return []; // Return empty array instead of throwing to avoid crashes
  }
}

// Replace with a simple API status endpoint:
app.get("/", (req, res) => {
  res.json({ 
    status: "online",
    message: "AdyaNews API is running",
    version: "1.0.0",
    documentation: "Visit /api-docs for API documentation"
  });
});

// Keep your existing app.listen code
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: ", PORT);
});
