import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material'
import { UserProfileManager } from '../aggregates/session/components/UserProfileManager'
import { metricsService } from '../services/MetricsService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    metricsService.trackPageLoad('settings')
    metricsService.trackUserInteraction('page_visit', 'SettingsPage')
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    metricsService.trackUserInteraction('tab_change', 'SettingsPage', undefined, { tab: newValue })
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences.
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Profile" />
            <Tab label="Preferences" />
            <Tab label="Notifications" />
            <Tab label="Privacy" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UserProfileManager />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preferences settings will be implemented here.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Notification preferences will be implemented here.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Privacy controls will be implemented here.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  )
}
export default SettingsPage