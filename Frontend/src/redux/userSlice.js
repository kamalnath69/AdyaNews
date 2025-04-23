import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../utils/apiClient";
import axios from "axios";

// Async Thunks
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data.user;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data?.message || "Error fetching profile");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/user/profile', updatedData);
      return response.data.user; // Assuming the backend returns the updated user object
    } catch (error) {
      console.error("Profile update error:", error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || "Error updating profile");
    }
  }
);

// Add this thunk to update user language
export const updateUserLanguage = createAsyncThunk(
  "user/updateUserLanguage",
  async (language, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/user/language', { language });
      return response.data.user; // Assuming backend returns updated user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error updating language");
    }
  }
);

// Add this thunk to update user interests
export const updateUserInterests = createAsyncThunk(
  "user/updateUserInterests",
  async (interests, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/user/interests', { interests });
      return response.data.user; // Assuming backend returns updated user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error updating interests");
    }
  }
);

// Update the deleteAccount thunk to handle navigation more reliably
export const deleteAccount = createAsyncThunk(
  "user/deleteAccount",
  async ({ password }, { rejectWithValue, dispatch }) => {
    try {
      console.log("Making delete account request with password data");
      
      const response = await apiClient.delete('/user/delete-account', {
        data: { password }
      });
      
      console.log("Account deletion successful");
      
      // Clear any auth state in other slices
      // You might need to import and call actions from authSlice here
      // dispatch(logout());
      
      return response.data;
    } catch (error) {
      console.error("Delete account API error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to delete account");
    }
  }
);

// Slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload; // Update the user object
        state.isLoading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.error = action.payload; // Set the error message
        state.isLoading = false;
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload; // Update the user object with new profile data
        state.isLoading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload; // Set the error message
        state.isLoading = false;
      })
      // Update User Language
      .addCase(updateUserLanguage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserLanguage.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUserLanguage.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Update User Interests
      .addCase(updateUserInterests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserInterests.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUserInterests.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        // Clear user data on successful deletion
        state.user = null;
        state.isLoading = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export default userSlice.reducer;