import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Add this helper function at the top of your file
const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5Ij5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

// Update the fetchArticles thunk
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async ({ query = '', topic = '', page = 1 } = {}, { rejectWithValue, signal }) => {
    try {
      // Create a controller for timeout management
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      console.log(`Fetching articles: query=${query}, topic=${topic}, page=${page}`);
      
      const response = await axios.get(`${API_URL}/news`, {
        params: {
          q: query,
          topic,
          page,
          pageSize: 9, // Explicit page size to match grid layout (3x3)
        },
        withCredentials: true,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.data || response.data.length === 0) {
        console.warn('API returned empty articles array');
      }
      
      return {
        articles: response.data || [],
        query,
        topic,
        page,
        isFirstPage: page === 1
      };
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        // Return a special value instead of rejecting for cancellations
        return { 
          articles: [],
          query,
          topic,
          page,
          isFirstPage: page === 1,
          canceled: true
        };
      }
      
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch articles');
    }
  }
);

// Fetch saved articles
export const fetchSavedArticles = createAsyncThunk(
  'articles/fetchSavedArticles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/article/saved`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch saved articles');
    }
  }
);

// Save an article
export const saveArticle = createAsyncThunk(
  'articles/saveArticle',
  async (article, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/article/save`, article, {
        withCredentials: true,
      });
      return { article, savedArticle: response.data };
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to save article');
    }
  }
);

// Unsave an article
export const unsaveArticle = createAsyncThunk(
  'articles/unsaveArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/article/unsave/${articleId}`, {
        withCredentials: true,
      });
      return articleId;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to unsave article');
    }
  }
);

// Toggle read status thunk with improved logging
export const toggleReadStatus = createAsyncThunk(
  'articles/toggleReadStatus',
  async (articleId, { rejectWithValue }) => {
    try {
      console.log(`Attempting to toggle read status for article ${articleId}`);
      
      const response = await axios.put(`${API_URL}/article/read/${articleId}`, {}, {
        withCredentials: true,
      });
      
      console.log(`Success! Article ${articleId} toggled to read status: ${response.data.isRead}`);
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update read status');
    }
  }
);

// Update article category
export const updateArticleCategory = createAsyncThunk(
  'articles/updateCategory',
  async ({ articleId, category }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/article/category/${articleId}`, 
        { category }, 
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Update article tags
export const updateArticleTags = createAsyncThunk(
  'articles/updateTags',
  async ({ articleId, tags }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/article/tags/${articleId}`, 
        { tags }, 
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update tags');
    }
  }
);

// Fetch article metadata (categories and tags)
export const fetchArticleMetadata = createAsyncThunk(
  'articles/fetchMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/article/metadata`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch article metadata');
    }
  }
);

const articleSlice = createSlice({
  name: 'articles',
  initialState: {
    items: [],
    filteredItems: [],
    savedArticles: [],
    categories: [],
    tags: [],
    searchTerm: '',
    activeTag: null,
    currentPage: 1,
    status: 'idle',
    savedStatus: 'idle',
    metadataStatus: 'idle',
    error: null,
    hasMore: true,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setActiveTag: (state, action) => {
      state.activeTag = action.payload;
    },
    toggleSaveArticle: (state, action) => {
      const id = action.payload;
      const article = state.items.find(article => article.id === id);
      if (article) {
        article.saved = !article.saved;
      }
      const filteredArticle = state.filteredItems.find(article => article.id === id);
      if (filteredArticle) {
        filteredArticle.saved = !filteredArticle.saved;
      }
    },
    incrementPage: (state) => {
      state.currentPage += 1;
    },
    // Update the resetArticles reducer to retain important state
    resetArticles: (state) => {
      state.items = [];
      state.filteredItems = [];
      state.currentPage = 1;
      state.hasMore = true;
      // Don't reset status here, let the pending action handle it
      // state.status = 'idle'; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        // Special handling for canceled requests
        if (action.payload.canceled) {
          // Don't change the state for canceled requests
          console.log('Request was canceled, keeping existing articles');
          state.status = 'succeeded'; // Reset status so UI isn't stuck in loading
          return;
        }

        state.status = 'succeeded';
        
        const { articles, isFirstPage, query, topic } = action.payload;
        
        // Process articles to ensure they have valid image URLs
        const processedArticles = articles.map(article => ({
          ...article,
          image: article.image && article.image !== "https://via.placeholder.com/640x360?text=No+Image+Available" 
            ? article.image 
            : DEFAULT_IMAGE
        }));
        
        // If it's the first page or if search/topic has changed, replace the items
        if (isFirstPage) {
          state.items = processedArticles;
          state.filteredItems = processedArticles;
        } else {
          // Otherwise, append new articles to existing ones
          const newArticleIds = new Set(processedArticles.map(a => a.id));
          // Filter out any duplicates before appending
          const uniqueNewArticles = processedArticles.filter(article => 
            !state.items.some(existingArticle => existingArticle.id === article.id)
          );
          
          state.items = [...state.items, ...uniqueNewArticles];
          state.filteredItems = [...state.filteredItems, ...uniqueNewArticles];
        }
        
        state.hasMore = processedArticles.length > 0;
        state.error = null;
        
        // Save current search parameters
        state.currentQuery = query;
        state.currentTopic = topic;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Something went wrong';
        
        // Important: Only clear items if this was the first page of a search/topic change
        // This keeps existing content visible during error states
        if (state.items.length === 0) {
          console.log('Error on initial fetch, showing error state');
        } else {
          console.log('Error on subsequent fetch, keeping existing articles');
          // We keep the existing articles, just update the status and error
        }
      })
      .addCase(fetchSavedArticles.pending, (state) => {
        state.savedStatus = 'loading';
      })
      .addCase(fetchSavedArticles.fulfilled, (state, action) => {
        state.savedStatus = 'succeeded';
        state.savedArticles = action.payload;

        // Mark articles as saved if they're in the saved list
        const savedIds = action.payload.map(article => article.articleId);

        state.items = state.items.map(article => ({
          ...article,
          saved: savedIds.includes(String(article.id))
        }));

        state.filteredItems = state.filteredItems.map(article => ({
          ...article,
          saved: savedIds.includes(String(article.id))
        }));
      })
      .addCase(fetchSavedArticles.rejected, (state, action) => {
        state.savedStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(saveArticle.fulfilled, (state, action) => {
        const { article, savedArticle } = action.payload;

        // Add to saved articles
        state.savedArticles.push(savedArticle);

        // Update saved status in items and filteredItems
        const itemArticle = state.items.find(a => a.id === article.id);
        if (itemArticle) {
          itemArticle.saved = true;
        }

        const filteredArticle = state.filteredItems.find(a => a.id === article.id);
        if (filteredArticle) {
          filteredArticle.saved = true;
        }
      })
      .addCase(unsaveArticle.fulfilled, (state, action) => {
        const articleId = action.payload;

        // Remove from saved articles
        state.savedArticles = state.savedArticles.filter(
          a => a.articleId !== String(articleId)
        );

        // Update saved status in items and filteredItems
        const itemArticle = state.items.find(a => a.id === articleId);
        if (itemArticle) {
          itemArticle.saved = false;
        }

        const filteredArticle = state.filteredItems.find(a => a.id === articleId);
        if (filteredArticle) {
          filteredArticle.saved = false;
        }
      })
      .addCase(toggleReadStatus.fulfilled, (state, action) => {
        const { articleId, isRead } = action.payload;
        console.log(`Redux updating article ${articleId} to isRead: ${isRead}`);
        
        // Convert both to strings for comparison to ensure type matching
        const article = state.savedArticles.find(a => String(a.articleId) === String(articleId));
        
        if (article) {
          console.log(`Found article in state, updating from ${article.isRead} to ${isRead}`);
          article.isRead = isRead;
        } else {
          console.warn(`Article ${articleId} not found in state. Available IDs:`, 
            state.savedArticles.map(a => a.articleId).join(', '));
        }
      })
      .addCase(updateArticleCategory.fulfilled, (state, action) => {
        const { articleId, category } = action.payload;
        const article = state.savedArticles.find(a => a.articleId === articleId);
        if (article) {
          article.category = category;
        }
      })
      .addCase(updateArticleTags.fulfilled, (state, action) => {
        const { articleId, tags } = action.payload;
        const article = state.savedArticles.find(a => a.articleId === articleId);
        if (article) {
          article.tags = tags;
        }
      })
      .addCase(fetchArticleMetadata.pending, (state) => {
        state.metadataStatus = 'loading';
      })
      .addCase(fetchArticleMetadata.fulfilled, (state, action) => {
        state.metadataStatus = 'succeeded';
        state.categories = action.payload.categories;
        state.tags = action.payload.tags;
      })
      .addCase(fetchArticleMetadata.rejected, (state) => {
        state.metadataStatus = 'failed';
      });
  },
});

export const { setSearchTerm, setActiveTag, toggleSaveArticle, incrementPage, resetArticles } = articleSlice.actions;

export default articleSlice.reducer;