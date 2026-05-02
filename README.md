# Team Task Manager

A full-stack web application for managing projects and tasks with role-based access control.

## Live Demo
- Frontend: https://charismatic-curiosity-production-39af.up.railway.app
- Backend API: https://team-task-manager-production-9535.up.railway.app

## GitHub Repository
https://github.com/sainithya05/team-task-manager

## Features
- User Authentication (Signup/Login with JWT)
- Project Management (Create, View projects)
- Task Management (Create, Assign, Track tasks)
- Role-based Access Control (Admin/Member)
- Dashboard with stats (Total tasks, Completed, Overdue)

## Tech Stack
### Frontend
- React.js
- React Router DOM
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- bcryptjs

## Deployment
- Deployed on Railway
- Database: MongoDB Atlas

## Setup Instructions

### Backend
1. cd backend
2. npm install
3. Create .env file with MONGO_URI, JWT_SECRET, PORT
4. npm start

### Frontend
1. cd frontend
2. npm install
3. Create .env file with REACT_APP_API_URL
4. npm start

## API Endpoints
- POST /api/auth/signup - Register user
- POST /api/auth/login - Login user
- GET /api/projects - Get all projects
- POST /api/projects - Create project
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
