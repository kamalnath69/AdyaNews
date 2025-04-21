# AdyaNews - Personalized News Aggregation Platform

## 📱 Project Overview

AdyaNews is a modern, feature-rich news aggregation platform designed to deliver personalized news content based on user interests. The application combines sleek UI design with powerful functionality to provide a seamless news reading experience.

Built with React, Redux, and a Node.js backend, AdyaNews offers personalized content delivery, article saving and categorization, comprehensive admin controls, and robust user management.

## ✨ Key Features

### User Features
- **Personalized News Feed**: Content tailored to user interests and preferences
- **Interest-Based Categorization**: News sorted and fetched based on topics and preferred language.
- **Article Management**: Save, categorize, and tag articles for later reading
- **Read/Unread Tracking**: Keep track of what you've already read
- **Article Search**: Find specific content across your saved articles
- **Multiple Filtering Options**: Filter by category, tags, and read status
- **AI Powered**: AI-powered summaries, sentiment analysis for quick content overview
- **Responsive Design**: Seamless experience across devices

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

### Development Tools
GitHub Copilot: AI-powered coding assistant used throughout development

## 📡 External APIs

### News Data
The application fetches news content from a dedicated news API that provides articles across multiple categories. Ensure you have NewsApi key. Visit https://newsapi.ai

### AI Content Processing
AdyaNews uses the Groq API for AI-powered articles summarization:

```javascript
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const summarizeArticle = async (req, res) => {
  // Implementation details...
};
```

## 📋 Installation & Setup

### Prerequisites
- Node.js (v14.0.0 or higher)
- MongoDB
- npm or yarn

### Setup Instructions
1. Clone the repository:
```markdown
git clone https://github.com/yourusername/adya-news.git
cd adya-news
```

2. Install backend dependencies:
```markdown
cd Backend
npm install
```

3. Install frontend dependencies:
```markdown
cd ../Frontend
npm install
```

4. Start Frontend server:
```markdown
npm run dev
```

5. Start frontend server: Open new terminal
```markdown
cd Backend
node index.js
```

### Environment Variables
Create `.env` files in both frontend and backend directories:

Backend `.env:`, need groq api key

```markdown
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
GROQ_API_KEY=your_groq_api_key
```

### Project Structure

```markdown
AdyaNews/
│   ├── Backend/                # Backend code
│   │   ├── controllers/        # Route controllers
│   │   │   ├── admin.controller.js
│   │   │   ├── article.controller.js
│   │   │   ├── auth.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/         # Express middleware
│   │   │   ├── verifyAdmin.js
│   │   │   └── verifyToken.js
│   │   ├── models/             # MongoDB schemas
│   │   │   ├── savedArticle.model.js
│   │   │   └── user.model.js
│   │   └── routes/             # API routes
│   │       ├── admin.route.js
│   │       ├── article.route.js
│   │       ├── auth.route.js
│   │       └── user.route.js
│   └── index.js                # Entry point
│
├── Frontend/                    # Frontend code
│   ├── public/                 # Static assets
│   └── src/
│       ├── components/         # Reusable components
│       │   ├── admin/          # Admin components
│       │   ├── auth/           # Authentication components
│       │   └── user/           # User interface components
│       ├── pages/              # Page components
│       │   ├── admin/          # Admin pages
│       │   │   ├── Analytics/
│       │   │   ├── Content/
│       │   │   ├── Dashboard/
│       │   │   └── UserManagement/
│       │   └── user/           # User pages
│       │       ├── Article/
│       │       ├── Home/
│       │       ├── Login/
│       │       ├── Profile/
│       │       └── SavedArticles/
│       ├── redux/              # Redux state management
│       │   ├── adminSlice.js
│       │   ├── articleSlice.js
│       │   ├── authSlice.js
│       │   ├── store.js
│       │   └── userSlice.js
│       └── App.jsx             # Main App component
```


