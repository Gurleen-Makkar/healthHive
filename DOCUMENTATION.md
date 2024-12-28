# HealthHive Documentation

## Project Structure

The application follows a client-server architecture:

```
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route-specific components
│   │   │   ├── appointments/
│   │   │   ├── auth/
│   │   │   └── doctors/
│   │   └── store/          # Redux state management
│   └── public/             # Static assets
└── backend/                # Node.js server
    ├── src/
    │   ├── models/        # Database schemas
    │   ├── routes/        # API endpoints
    │   └── middleware/    # Custom middleware
```

## Design Decisions

### Architecture
- **Client-Server Split**: Separated frontend and backend for better scalability and maintainability
- **RESTful Architecture**: Clear API endpoints for each resource (doctors, appointments, users)
- **Modular Structure**: Components and features are organized into logical directories for better code organization

### Frontend
- **React**: Chosen for its component-based architecture and robust ecosystem
- **Material-UI**: Provides consistent design language and responsive components
- **Redux Toolkit**: Centralized state management for predictable data flow
  - Separate slices for doctors, appointments, and auth state
  - Async thunks for API calls
- **Layout System**: 
  - AuthLayout for login/register pages
  - MainLayout for authenticated user interface
  - Ensures consistent navigation and user experience

### Backend
- **MongoDB**: NoSQL database chosen for:
  - Flexible schema for evolving data models
  - Document-based structure matching the application's data
  - Easy scaling for future growth
- **JWT Authentication**: 
  - Stateless authentication for API security
  - Token-based approach for scalable user sessions
- **Middleware Architecture**:
  - Route protection for authenticated endpoints
  - Request validation and error handling

## Features

1. **Authentication**
   - User registration and login
   - Secure session management

2. **Doctor Management**
   - List of available doctors
   - Detailed doctor profiles
   - Doctor search and filtering

3. **Appointment System**
   - Book appointments with doctors
   - View appointment details
   - Manage existing appointments
   - Edit/Cancel appointments

4. **Dashboard**
   - Overview of user's appointments
   - Quick access to key features
