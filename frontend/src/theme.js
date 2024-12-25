import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4B6BFB', // Softer blue
      light: '#7B90FF',
      dark: '#3451DB',
      contrastText: '#fff',
    },
    secondary: {
      main: '#8B5CF6', // Purple
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#fff',
    },
    success: {
      main: '#10B981', // Green for confirmed status
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#F8FAFC',
      paper: '#ffffff',
      gradient: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #FDF4FF 100%)',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },

  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '8px 24px',
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #4B6BFB, #7B90FF)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#fff',
            '& fieldset': {
              borderColor: 'rgba(226, 232, 240, 0.8)',
            },
            '&:hover fieldset': {
              borderColor: '#4B6BFB',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 28,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
