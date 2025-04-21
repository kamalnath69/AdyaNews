import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import articlesReducer from "./articleSlice"; // Ensure this is the correct path to your articlesSlice
import userReducer from "./userSlice"; // Ensure this is the correct path to your userSlice
import adminReducer from './adminSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        articles: articlesReducer,
        user: userReducer,
        admin: adminReducer, // Add this line
    },
});

export default store;