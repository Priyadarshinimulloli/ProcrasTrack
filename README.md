# Procrastination Tracker

A comprehensive full-stack web application designed to help users track their tasks, manage time effectively, and log the reasons and emotional states that lead to procrastination. The application also provides insightful analytics and weekly reports to improve productivity.

## 🚀 Features

- **User Authentication**: Secure Sign-up and Login functionality.
- **Task Management**: Create, view, update, and delete tasks. Categorize your tasks and track their planned and actual start/end times.
- **Procrastination Logging**: Log when and why you procrastinated on a task, including the duration, your emotional state, and the primary reason.
- **Analytics Dashboard**: View detailed statistics and trends on your procrastination habits, including average delay duration, category-wise delays, and emotional/reason breakdown.
- **Weekly Reports**: Generate detailed weekly productivity and procrastination reports based on your data.

## 🛠 Tech Stack

### Frontend
- **React.js** (via Vite)
- **Recharts** for visualizations and analytics
- **jsPDF** for report generation
- **@lottiefiles/dotlottie-react** for animations

### Backend
- **Node.js** & **Express.js** 
- **MySQL2** for database interactions
- **dotenv** for environment variable management
- **cors** for handling cross-origin requests

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MySQL database server running locally or remotely

### 1. Database Configuration
1. Create a MySQL database for the project (e.g., `procrastination_tracker`).
2. Run your init SQL scripts to set up the following tables:
   - `users`
   - `tasks`
   - `usertasks`
   - `procrastination_log`
   - `procrastination_details`
   - `reason`
   - `emotional_state`

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with your database configuration:
   ```ini
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=procrastination_tracker
   PORT=5000
   ```
4. Start the server (runs on `http://localhost:5000` by default):
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local host link (typically `http://localhost:5173`) in your browser.

---

## 📡 API Endpoints Overview

- **Auth:**
  - `POST /signup` - Register a new user
  - `POST /login` - Authenticate a user
- **Tasks:**
  - `GET /api/tasks` - Fetch user tasks
  - `POST /api/tasks` - Create a new task
  - `POST /api/tasks/:id/start` - Mark task as started
  - `POST /api/tasks/:id/complete` - Mark task as completed
  - `PUT /api/tasks/:id` - Update a task
  - `DELETE /api/tasks/:id` - Delete a task
- **Procrastination & Analytics:**
  - `GET /api/reasons` - Fetch procrastination reasons
  - `GET /api/emotional-states` - Fetch emotional states
  - `GET /api/procrastination-logs` - Fetch user logs
  - `POST /api/procrastination-logs` - Add a new log
  - `GET /api/analytics` - Fetch user analytics data
  - `GET /api/reports/weekly` - Fetch weekly insights

---
