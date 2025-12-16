import React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
        }}
      >
        <LockIcon
          sx={{
            fontSize: 80,
            color: 'error.main',
            mb: 3,
          }}
        />
        
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          You don't have permission to access this page. Please contact your administrator 
          if you believe this is an error.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}