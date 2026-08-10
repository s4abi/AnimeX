# AnimeX – Anime Streaming Platform 🎬

AnimeX is a full-stack anime streaming platform developed as an academic project. It provides users with a platform to browse anime content, manage watchlists, track watching progress, and interact with content through ratings and reviews.

The project follows a modern client-server architecture with a React.js frontend and Node.js/Express.js backend.

---

## 🚀 Features

### 👤 User Features
- User Registration and Login
- JWT-based Authentication
- Browse Anime and Movies
- View Anime Details
- Watch Episodes
- Add/Remove content from Watchlist
- User Profile Management
- Continue Watching / Watch Progress Tracking
- Reviews and Ratings

### 🛠️ Admin Features
- Admin Authentication
- Admin Dashboard
- Add and Manage Content
- Manage Anime Episodes
- Manage Categories
- Content Management

### 🎥 Streaming Features
- Episode-based video playback
- Auto-play / next episode functionality
- Watch-progress tracking
- Continue watching functionality

---

## 🏗️ Project Architecture

AnimeX
│
├── backend
│   ├── database
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   └── utils
│   ├── package.json
│   └── .gitignore
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   ├── package.json
│   └── vite.config.js
│
└── README.md

💻 Technology Stack
Frontend
React.js
JavaScript
HTML5
CSS3
Tailwind CSS
React Router
Axios
Vite
Backend
Node.js
Express.js
REST APIs
JWT Authentication
Database
MySQL
MySQL Workbench
Development & Tools
VS Code
Git
GitHub
Postman
Vercel
🔐 Authentication

AnimeX uses JWT-based authentication to secure user-specific functionality.

The authentication system provides:

User registration
User login
Protected routes
Authentication middleware
Admin authorization
Secure access to user-specific resources

Sensitive configuration such as database credentials and JWT secrets is stored in environment variables and is not included in the repository.

📂 Backend Structure

The backend follows a modular structure:

backend/src
│
├── config
├── controllers
├── middleware
├── models
├── routes
└── utils

This structure separates application logic into different layers, making the backend easier to maintain and extend.

🌐 API

The backend provides REST APIs for functionalities including:

Authentication
Users
Categories
Content
Episodes
Watch History
Watchlist

The APIs can be tested using Postman during development.

🖥️ Running the Project Locally
1. Clone the repository
git clone https://github.com/s4abi/AnimeX.git
cd AnimeX
2. Setup Backend
cd backend

Install dependencies:

npm install

Create a .env file and add the required environment variables for your database and authentication configuration.

Then start the backend:

npm start
3. Setup Frontend

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will then be available through the local Vite development URL shown in the terminal.

🔒 Environment Variables

For security reasons, environment variables are not included in this repository.

Example:

PORT=5000
DATABASE_URL=your_database_configuration
JWT_SECRET=your_secret_key

Use the actual variable names required by the backend configuration when setting up the project locally.

Never commit passwords, API keys, JWT secrets, or other sensitive credentials to GitHub.

📸 Project Highlights

AnimeX includes:

Modern responsive interface
Anime browsing
Content details
Video player
Watchlist
User profile
Authentication
Admin dashboard
Episode management
Watch history
Backend REST APIs
Database integration
👨‍💻 Developer

Sahib Thakur

B.Tech – Computer Science & Engineering

Project developed as an academic/full-stack web development project.

📌 Project Status

The project is actively developed and includes both frontend and backend components.

The frontend is deployed using Vercel for demonstration purposes.

📄 License

This project was developed for educational and academic purposes.


### One important thing

I intentionally **didn't put a fake live demo URL** in the README since your backend isn't deployed yet. Your GitHub repository itself is already enough to use for **TCS Question 16**:

**`https://github.com/s4abi/AnimeX`**
