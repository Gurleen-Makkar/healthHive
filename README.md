# HealthHive - Medical Appointment Booking System

A full-stack application for booking medical appointments, built with React and Node.js.

## Features

- User Authentication (Register/Login)
- View and filter doctors by specialty
- Book, view, edit, and cancel appointments
- User dashboard with appointment history
- Protected routes with JWT authentication
- State management with Redux Toolkit

## Project Structure

```
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   └── theme.js       # MUI theme configuration
│   └── vercel.json        # Vercel deployment config
└── backend/               # Node.js backend
    ├── src/
    │   ├── middleware/    # Auth middleware
    │   ├── models/       # MongoDB models
    │   ├── routes/       # API routes
    │   └── scripts/      # Utility scripts
    └── index.js          # Server entry point
```

## Deployment Instructions

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and create a new project
3. Import your GitHub repository
4. Configure environment variables in Vercel:
   - `REACT_APP_API_URL`: Your deployed backend API URL
   - `REACT_APP_NAME`: HealthHive
   - `REACT_APP_DESCRIPTION`: Medical Appointment Booking System
   - `GENERATE_SOURCEMAP`: false
5. Deploy the project

### Backend Deployment

1. Choose a hosting service (e.g., Render, Railway, Heroku)
2. Set up environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: Port number (if required by hosting service)
3. Deploy the backend
4. Update the frontend's REACT_APP_API_URL to point to your deployed backend

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` in frontend directory
   - Create `.env` in backend directory

4. Run the development servers:
   ```bash
   # Run frontend (in frontend directory)
   npm start

   # Run backend (in backend directory)
   npm run dev
   ```

## Tech Stack

- Frontend:
  - React
  - Material-UI
  - Redux Toolkit
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication

## Additional Features

- JWT Authentication middleware
- Redux Toolkit for state management
- Material-UI components and theming
- Bcrypt password hashing
- Doctor seeding script
