import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  Theme,
  CssBaseline,
  useMediaQuery,
} from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../../hooks/redux'
import { updatePreferences } from '../store/sessionSlice'

interface ThemeContextType {
  theme: Theme
  mode: 'light' | 'dark' | 'auto'
  toggleTheme: () => void
  setTheme: (mode: 'light' | 'dark' | 'auto') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface CustomThemeProviderProps {
  children: React.ReactNode
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { preferences } = useAppSelector((state) => state.session)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  
  const [currentMode, setCurrentMode] = useState<'light' | 'dark'>(() => {
    if (preferences.theme === 'auto') {
      return prefersDarkMode ? 'dark' : 'light'
    }
    return preferences.theme as 'light' | 'dark'
  })

  // Update theme when system preference changes (for auto mode)
  useEffect(() => {
    if (preferences.theme === 'auto') {
      setCurrentMode(prefersDarkMode ? 'dark' : 'light')
    }
  }, [prefersDarkMode, preferences.theme])

  // Update theme when preference changes
  useEffect(() => {
    if (preferences.theme !== 'auto') {
      setCurrentMode(preferences.theme as 'light' | 'dark')
    }
  }, [preferences.theme])

  const theme = createTheme({
    palette: {
      mode: currentMode,
      primary: {
        main: currentMode === 'light' ? '#1976d2' : '#90caf9',
        light: currentMode === 'light' ? '#42a5f5' : '#e3f2fd',
        dark: currentMode === 'light' ? '#1565c0' : '#42a5f5',
      },
      secondary: {
        main: currentMode === 'light' ? '#dc004e' : '#f48fb1',
      },
      background: {
        default: currentMode === 'light' ? '#fafafa' : '#121212',
        paper: currentMode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: currentMode === 'light' ? '#212121' : '#ffffff',
        secondary: currentMode === 'light' ? '#757575' : '#b3b3b3',
      },
      success: {
        main: currentMode === 'light' ? '#2e7d32' : '#66bb6a',
      },
      warning: {
        main: currentMode === 'light' ? '#ed6c02' : '#ffa726',
      },
      error: {
        main: currentMode === 'light' ? '#d32f2f' : '#f44336',
      },
      info: {
        main: currentMode === 'light' ? '#0288d1' : '#29b6f6',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 300,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 300,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 400,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.6,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: currentMode === 'light' 
              ? '0 2px 8px rgba(0,0,0,0.1)' 
              : '0 2px 8px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: currentMode === 'light' 
              ? '0 1px 3px rgba(0,0,0,0.12)' 
              : '0 1px 3px rgba(0,0,0,0.4)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: currentMode === 'light' 
              ? '0 2px 4px rgba(0,0,0,0.1)' 
              : '0 2px 4px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: currentMode === 'light' 
              ? '1px solid rgba(0,0,0,0.12)' 
              : '1px solid rgba(255,255,255,0.12)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&.Mui-selected': {
              backgroundColor: currentMode === 'light' 
                ? 'rgba(25, 118, 210, 0.08)' 
                : 'rgba(144, 202, 249, 0.16)',
              '&:hover': {
                backgroundColor: currentMode === 'light' 
                  ? 'rgba(25, 118, 210, 0.12)' 
                  : 'rgba(144, 202, 249, 0.20)',
              },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  })

  const toggleTheme = () => {
    const newMode = currentMode === 'light' ? 'dark' : 'light'
    dispatch(updatePreferences({ theme: newMode }))
  }

  const setTheme = (mode: 'light' | 'dark' | 'auto') => {
    dispatch(updatePreferences({ theme: mode }))
  }

  const contextValue: ThemeContextType = {
    theme,
    mode: preferences.theme,
    toggleTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

// Theme selector component
export const ThemeSelector: React.FC = () => {
  const { mode, setTheme } = useTheme()

  return (
    <div>
      <button onClick={() => setTheme('light')} disabled={mode === 'light'}>
        Light
      </button>
      <button onClick={() => setTheme('dark')} disabled={mode === 'dark'}>
        Dark
      </button>
      <button onClick={() => setTheme('auto')} disabled={mode === 'auto'}>
        Auto
      </button>
    </div>
  )
}