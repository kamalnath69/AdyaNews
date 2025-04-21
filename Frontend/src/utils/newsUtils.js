import axios from "axios";

export const NEWS_API_URL = 
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/public/news"
    : "https://adyanewsbackend.onrender.com/api/public/news";

export const SEARCH_KEYWORDS = [
  "technology", "business", "health", "science", "sports", "world", 
  "india", "ai", "finance", "startup", "education", "climate", "entertainment"
];

export const CARD_COLORS = [
  "bg-gradient-to-br from-[#e0e7ff] via-[#f1f5f9] to-[#bae6fd]",
  "bg-gradient-to-br from-[#fce7f3] via-[#f3e8ff] to-[#f1f5f9]",
  "bg-gradient-to-br from-[#fef9c3] via-[#f1f5f9] to-[#bbf7d0]",
  "bg-gradient-to-br from-[#f1f5f9] via-[#e0e7ff] to-[#f3e8ff]",
  "bg-gradient-to-br from-[#f1f5f9] via-[#fef9c3] to-[#f3e8ff]",
  "bg-gradient-to-br from-[#f1f5f9] via-[#bae6fd] to-[#fce7f3]",
  "bg-gradient-to-br from-[#f1f5f9] via-[#bbf7d0] to-[#e0e7ff]",
  "bg-gradient-to-br from-[#f3e8ff] via-[#f1f5f9] to-[#fef9c3]",
];

export const CARD_WIDTH = 240;
export const CARD_HEIGHT = 140;

/**
 * Fetches news articles from the API using random keywords
 * @param {number} keywordCount - Number of keywords to use for fetching
 * @param {number} maxArticles - Maximum number of articles to return
 * @returns {Promise<Array>} Array of news articles
 */
export const fetchPublicNews = async (keywordCount = 2, maxArticles = 16) => {
  let allArticles = [];
  
  for (let i = 0; i < keywordCount; i++) {
    const keyword = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];
    try {
      const res = await axios.get(`${NEWS_API_URL}?q=${keyword}`, { withCredentials: false });
      const articles = res.data.articles || res.data || [];
      allArticles = allArticles.concat(articles.slice(0, 10));
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }
  
  return allArticles.slice(0, maxArticles);
};

/**
 * Generates initial card positions avoiding the form area
 */
export const getInitialCardPositions = (count, formRect) => {
  const positions = [];
  const tries = 100;
  const padding = 16;
  const minDist = CARD_WIDTH * 0.85;

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let t = 0; t < tries && !placed; t++) {
      let left = Math.random() * (window.innerWidth - CARD_WIDTH - padding * 2) + padding;
      let top = Math.random() * (window.innerHeight - CARD_HEIGHT - padding * 2) + padding;
      if (formRect) {
        const overlapX =
          left + CARD_WIDTH > formRect.left - 24 &&
          left < formRect.right + 24;
        const overlapY =
          top + CARD_HEIGHT > formRect.top - 24 &&
          top < formRect.bottom + 24;
        if (overlapX && overlapY) continue;
      }
      let collision = false;
      for (let j = 0; j < positions.length; j++) {
        const dx = positions[j].left - left;
        const dy = positions[j].top - top;
        if (Math.sqrt(dx * dx + dy * dy) < minDist) {
          collision = true;
          break;
        }
      }
      if (!collision) {
        positions.push({
          left,
          top,
          rotate: (Math.random() - 0.5) * 20,
          vx: 0,
          vy: 0,
        });
        placed = true;
      }
    }
    if (!placed) {
      positions.push({
        left: Math.random() * (window.innerWidth - CARD_WIDTH - padding * 2) + padding,
        top: Math.random() * (window.innerHeight - CARD_HEIGHT - padding * 2) + padding,
        rotate: (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
      });
    }
  }
  return positions;
};