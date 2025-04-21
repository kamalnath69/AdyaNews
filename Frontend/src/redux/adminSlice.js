import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/admin" : "https://adyanewsbackend.onrender.com/api/admin";

axios.defaults.withCredentials = true;

// Thunks
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "admin/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/stats/users`);
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user statistics");
    }
  }
);

export const fetchContentStats = createAsyncThunk(
  "admin/fetchContentStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/stats/content`);
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch content statistics");
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/role`, { role });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user role");
    }
  }
);

export const deleteUserById = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    userStats: null,
    contentStats: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Content Stats
      .addCase(fetchContentStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchContentStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.contentStats = action.payload;
      })
      .addCase(fetchContentStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      });
  },
});

export default adminSlice.reducer;