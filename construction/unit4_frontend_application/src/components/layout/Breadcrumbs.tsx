import React from 'react'
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material'
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'

export const Breadcrumbs: React.FC = () => {
  const location = useLocation()
  const { navigation } = useAppSelector((state) => state.session)

  if (!navigation.breadcrumbs || navigation.breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ fontSize: '0.875rem' }}
      >
        {navigation.breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === navigation.breadcrumbs.length - 1
          const isHome = breadcrumb.path === '/'

          if (isLast || breadcrumb.disabled) {
            return (
              <Typography
                key={breadcrumb.path}
                color="text.primary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: isLast ? 'medium' : 'normal',
                }}
              >
                {isHome && <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />}
                {breadcrumb.label}
              </Typography>
            )
          }

          return (
            <Link
              key={breadcrumb.path}
              component={RouterLink}
              to={breadcrumb.path}
              underline="hover"
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {isHome && <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />}
              {breadcrumb.label}
            </Link>
          )
        })}
      </MuiBreadcrumbs>
    </Box>
  )
}