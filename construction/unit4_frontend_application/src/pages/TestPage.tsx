import React from 'react'
import { Box, Typography, Alert } from '@mui/material'

const TestPage: React.FC = () => {
  console.log('TestPage is rendering!')
  
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="success" sx={{ mb: 2 }}>
        🎉 Test page is working! The routing is functional.
      </Alert>
      
      <Typography variant="h4" gutterBottom>
        Test Page
      </Typography>
      
      <Typography variant="body1">
        If you can see this, the routing and page loading is working correctly.
      </Typography>
      
      <Typography variant="body2" sx={{ mt: 2 }}>
        Check the browser console - you should see "TestPage is rendering!" logged.
      </Typography>
    </Box>
  )
}

export default TestPage