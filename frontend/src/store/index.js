import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import doctorsReducer from './slices/doctorsSlice';
import appointmentsReducer from './slices/appointmentsSlice';

// Custom middleware to handle API errors
const errorMiddleware = (store) => (next) => (action) => {
  // Check if the action is a rejected action from an async thunk
  if (action.type.endsWith('/rejected')) {
    // You could dispatch additional actions here, like showing a snackbar
    console.error('API Error:', action.payload);
  }
  return next(action);
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    appointments: appointmentsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['register/fulfilled', 'login/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.headers', 'payload.config', 'error'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'doctors.currentDoctor']
      }
    }).concat(errorMiddleware),
  devTools: process.env.NODE_ENV !== 'production'
});

// Optional: Hot reloading setup
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./slices/authSlice', () => {
    store.replaceReducer(authReducer);
  });
  module.hot.accept('./slices/doctorsSlice', () => {
    store.replaceReducer(doctorsReducer);
  });
  module.hot.accept('./slices/appointmentsSlice', () => {
    store.replaceReducer(appointmentsReducer);
  });
}

export default store;
