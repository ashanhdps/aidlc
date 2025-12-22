import * as React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const SimpleTest: React.FC = () => {
  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Frontend Test
          </Typography>
          <Typography variant="body1">
            If you can see this, the frontend is working correctly!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}