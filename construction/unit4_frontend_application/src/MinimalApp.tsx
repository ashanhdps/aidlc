import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
})

const MinimalApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom>
          KPI Management System
        </Typography>
        
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              ✅ Frontend is Working!
            </Typography>
            <Typography variant="body1">
              The basic React setup is functioning correctly.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              If you can see this message, the frontend application is running successfully.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  )
}

export default MinimalApp