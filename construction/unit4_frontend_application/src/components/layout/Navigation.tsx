import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Assignment as MyKPIsIcon,
  Group as TeamIcon,
  AdminPanelSettings as AdminIcon,
  Approval as ApprovalIcon,
  Assessment as AssessmentIcon,
  Feedback as FeedbackIcon,
  BugReport as TestIcon,
  Settings as SettingsIcon,
  People as UsersIcon
} from '@mui/icons-material'
import { useAppSelector } from '../../hooks/redux'

export const Navigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.session)

  // Get role-specific tabs
  const getVisibleTabs = () => {
    const roleName = user?.role?.name || 'employee'
    const tabs = []

    // Dashboard - available to all
    tabs.push({
      icon: <DashboardIcon />,
      label: "Dashboard",
      value: 0
    })

    // Role-specific tabs
    if (roleName === 'employee') {
      tabs.push({
        icon: <MyKPIsIcon />,
        label: "My KPIs",
        value: 1
      })
    }

    if (roleName === 'supervisor') {
      tabs.push({
        icon: <TeamIcon />,
        label: "Team KPIs",
        value: 2
      })
      tabs.push({
        icon: <DashboardIcon />,
        label: "Team Dashboard",
        value: 3
      })
      tabs.push({
        icon: <SettingsIcon />,
        label: "KPI Definitions",
        value: 4
      })
    }

    if (roleName === 'manager' || roleName === 'admin') {
      tabs.push({
        icon: <SettingsIcon />,
        label: "KPI Definitions",
        value: 4
      })
      tabs.push({
        icon: <AdminIcon />,
        label: "KPI Admin",
        value: 5
      })
      tabs.push({
        icon: <ApprovalIcon />,
        label: "Approvals",
        value: 6
      })
      tabs.push({
        icon: <DashboardIcon />,
        label: "Team Dashboard",
        value: 3
      })
    }

    // User Management - Admin only
    if (roleName === 'admin') {
      tabs.push({
        icon: <UsersIcon />,
        label: "User Management",
        value: 10
      })
    }

    // Assessments and Feedback - available to all
    tabs.push({
      icon: <AssessmentIcon />,
      label: "Assessments",
      value: 7
    })
    tabs.push({
      icon: <FeedbackIcon />,
      label: "Feedback",
      value: 8
    })

    // Connection test - available to all
    tabs.push({
      icon: <TestIcon />,
      label: "Connection Test",
      value: 9
    })

    return tabs
  }

  const getCurrentTab = () => {
    const visibleTabs = getVisibleTabs()
    
    // Find the tab that matches the current path
    const routeToValue: Record<string, number> = {
      '/dashboard': 0,
      '/my-kpis': 1,
      '/team-kpis': 2,
      '/team': 3,
      '/kpi-definitions': 4,
      '/kpi-admin': 5,
      '/kpi-approval': 6,
      '/assessments': 7,
      '/feedback': 8,
      '/connection-test': 9,
      '/user-management': 10
    }
    
    const currentValue = routeToValue[location.pathname]
    
    // Find the index of this tab in the visible tabs array
    const tabIndex = visibleTabs.findIndex(tab => tab.value === currentValue)
    
    return tabIndex >= 0 ? tabIndex : 0
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    // Get the actual tab from the visible tabs array using the index
    const visibleTabs = getVisibleTabs()
    const selectedTab = visibleTabs[newValue]
    
    if (selectedTab) {
      // Direct mapping based on the tab value
      const routeMap: Record<number, string> = {
        0: '/dashboard',
        1: '/my-kpis',
        2: '/team-kpis', 
        3: '/team',
        4: '/kpi-definitions',
        5: '/kpi-admin',
        6: '/kpi-approval',
        7: '/assessments',
        8: '/feedback',
        9: '/connection-test',
        10: '/user-management'
      }
      
      const route = routeMap[selectedTab.value]
      if (route) {
        navigate(route)
      }
    }
  }

  const visibleTabs = getVisibleTabs()

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={getCurrentTab()} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.map((tab) => (
            <Tab
              key={tab.value}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  )
}