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

### Prerequisites
1. Create a [GitHub](https://github.com) account if you don't have one
2. Create a [Vercel](https://vercel.com) account (you can sign up with GitHub)
3. Have a MongoDB Atlas cluster ready with connection string

### Step 1: Prepare Repository
1. Create a new GitHub repository
2. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy Backend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Other
   - Root Directory: backend
   - Build Command: `npm install`
   - Output Directory: Leave empty
   - Install Command: `npm install`

5. Add Environment Variables:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   NODE_ENV=production
   ```

6. Click "Deploy"
7. Once deployed, copy your backend API URL (e.g., https://your-app-name.vercel.app)

### Step 3: Deploy Frontend on Vercel
1. Go back to Vercel Dashboard
2. Click "Add New Project"
3. Import the same GitHub repository
4. Configure project:
   - Root Directory: frontend
   - Framework Preset: Other
   - Build and Output Settings:
     - Build Command: `npm install && npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`

   Note: Make sure these settings match exactly as shown above, since we're using CRACO instead of default Create React App

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-app-name.vercel.app/api
   REACT_APP_NAME=HealthHive
   REACT_APP_DESCRIPTION=Medical Appointment Booking System
   GENERATE_SOURCEMAP=false
   ```
   Note: Replace the API URL with your backend URL from Step 2

6. Click "Deploy"

### Step 4: Verify Deployment
1. Test Backend API:
   - Visit your backend URL (e.g., https://your-backend.vercel.app/api/doctors)
   - Verify that you can see the API response

2. Test Frontend:
   - Visit your frontend URL
   - Try to register and login
   - Check if you can view doctors and book appointments

### Troubleshooting
1. If the backend API is not responding:
   - Check Vercel deployment logs
   - Verify MongoDB connection string
   - Ensure environment variables are set correctly

2. If the frontend can't connect to the backend:
   - Check if REACT_APP_API_URL is set correctly
   - Verify that the backend URL is accessible
   - Check browser console for CORS errors

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
