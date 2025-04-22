import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../utils/apiClient"; // Use the centralized API client

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "https://adyanewsbackend.onrender.com/api/auth";

// Async Thunks
export const signup = createAsyncThunk("auth/signup", async ({ email, password, name }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post('/auth/signup', { email, password, name });
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Error signing up");
    }
});

export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        
        // Store token in localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Error logging in");
    }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('token');
        return null;
    } catch (error) {
        localStorage.removeItem('token'); // Still remove token even if API fails
        return rejectWithValue("Error logging out");
    }
});

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/auth/check-auth');
        return response.data.user;
    } catch {
        return rejectWithValue(null);
    }
});

export const verifyEmail = createAsyncThunk("auth/verifyEmail", async (code, { rejectWithValue }) => {
    try {
        const response = await apiClient.post('/auth/verify-email', { code });
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Error verifying email");
    }
});

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email, { rejectWithValue }) => {
    try {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Error sending reset password email");
    }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post(`/auth/reset-password/${token}`, { password });
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Error resetting password");
    }
});

// Slice
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
        isCheckingAuth: true,
        message: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Signup
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
            })
            .addCase(signup.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.isCheckingAuth = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isCheckingAuth = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isAuthenticated = false;
                state.isCheckingAuth = false;
            })
            // Verify Email
            .addCase(verifyEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.message = action.payload;
                state.isLoading = false;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.message = action.payload;
                state.isLoading = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });  
    },
});

export default authSlice.reducer;
