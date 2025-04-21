# AdyaNews - Personalized News Aggregation Platform

![AdyaNews Logo](https://placeholder-for-logo-image.com/logo.png)

## 📱 Project Overview

AdyaNews is a modern, feature-rich news aggregation platform designed to deliver personalized news content based on user interests. The application combines sleek UI design with powerful functionality to provide a seamless news reading experience.

Built with React, Redux, and a Node.js backend, AdyaNews offers personalized content delivery, article saving and categorization, comprehensive admin controls, and robust user management.

## ✨ Key Features

### User Features
- **Personalized News Feed**: Content tailored to user interests and preferences
- **Interest-Based Categorization**: News sorted by topics like Technology, Health, Business, etc.
- **Article Management**: Save, categorize, and tag articles for later reading
- **Read/Unread Tracking**: Keep track of what you've already read
- **Article Search**: Find specific content across your saved articles
- **Multiple Filtering Options**: Filter by category, tags, and read status
- **Article Summarization**: AI-powered summaries for quick content overview
- **Responsive Design**: Seamless experience across devices
- **Dark/Light Mode**: Choose your preferred visual theme

### Admin Features
- **Comprehensive Dashboard**: Overview of platform activity and metrics
- **User Management**: View, edit roles, and manage user accounts
- **Content Analytics**: Track article popularity, category distribution, and more
- **Visual Reports**: Charts and graphs for key performance metrics
- **Role-Based Access Control**: Secure admin functionality

### Authentication & Security
- **Email Verification**: Secure account creation process
- **Password Reset**: Secure password recovery workflow
- **Role-Based Permissions**: Different access levels for users and admins
- **JWT Authentication**: Secure API access

## 🛠️ Technologies Used

### Frontend
- **React**: UI components and state management
- **Redux**: Global state management with Redux Toolkit
- **Framer Motion**: Advanced animations
- **TailwindCSS**: Utility-first styling
- **Lucide React**: Icon library
- **Recharts**: Data visualization
- **React Router**: Navigation and routing
- **Axios**: API communication

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JSON Web Tokens (JWT)**: Authentication
- **Bcrypt**: Password hashing

## 📡 External APIs

### News Data
The application fetches news content from a dedicated news API that provides articles across multiple categories.

```javascript
const NEWS_API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/public/news"
    : "/api/public/news";
