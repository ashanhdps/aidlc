import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../../hooks/redux'
import { updateProfile } from '../store/sessionSlice'
import { AuthenticationManager } from '../services/AuthenticationManager'
import { UserProfile } from '../../../types/domain'

interface UserProfileManagerProps {
  onProfileUpdate?: (profile: UserProfile) => void
}

export const UserProfileManager: React.FC<UserProfileManagerProps> = ({
  onProfileUpdate,
}) => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.session)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>(user || {})
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const authManager = new AuthenticationManager()

  if (!user) {
    return (
      <Alert severity="error">
        No user profile found. Please log in again.
      </Alert>
    )
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile(user)
    setError(null)
    setSuccess(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(user)
    setError(null)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate required fields
      if (!editedProfile.firstName?.trim() || !editedProfile.lastName?.trim()) {
        throw new Error('First name and last name are required')
      }

      if (!editedProfile.email?.trim()) {
        throw new Error('Email is required')
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editedProfile.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Update profile
      const updatedProfile = await authManager.updateProfile(editedProfile)
      dispatch(updateProfile(updatedProfile))
      
      setIsEditing(false)
      setSuccess('Profile updated successfully')
      onProfileUpdate?.(updatedProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate passwords
      if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
        throw new Error('All password fields are required')
      }

      if (passwordData.new !== passwordData.confirm) {
        throw new Error('New passwords do not match')
      }

      if (passwordData.new.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      await authManager.changePassword(passwordData.current, passwordData.new)
      
      setPasswordDialog(false)
      setPasswordData({
        current: '',
        new: '',
        confirm: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
      })
      setSuccess('Password changed successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In real app, would upload to server and get URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditedProfile({
          ...editedProfile,
          avatar: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'error'
      case 'executive':
        return 'secondary'
      case 'manager':
      case 'supervisor':
        return 'primary'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Profile Information</Typography>
          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEdit}
              variant="outlined"
            >
              Edit Profile
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Avatar Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={isEditing ? editedProfile.avatar : user.avatar}
                  sx={{ width: 120, height: 120, fontSize: '2rem' }}
                >
                  {getInitials(
                    (isEditing ? editedProfile.firstName : user.firstName) || '',
                    (isEditing ? editedProfile.lastName : user.lastName) || ''
                  )}
                </Avatar>
                {isEditing && (
                  <Tooltip title="Change avatar">
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                      size="small"
                    >
                      <PhotoCameraIcon fontSize="small" />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              
              <Chip
                label={user.role.name}
                color={getRoleColor(user.role.name) as any}
                variant="outlined"
                sx={{ mb: 1 }}
              />
              
              {user.department && (
                <Typography variant="body2" color="text.secondary">
                  {user.department}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Profile Fields */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={isEditing ? editedProfile.firstName || '' : user.firstName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={isEditing ? editedProfile.lastName || '' : user.lastName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={isEditing ? editedProfile.email || '' : user.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={isEditing ? editedProfile.department || '' : user.department || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, department: e.target.value })}
                    label="Department"
                  >
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Sales">Sales</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="HR">Human Resources</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Operations">Operations</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={user.role.name}
                  disabled
                  helperText="Role cannot be changed. Contact your administrator."
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Security Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Security
          </Typography>
          <Button
            startIcon={<LockIcon />}
            onClick={() => setPasswordDialog(true)}
            variant="outlined"
          >
            Change Password
          </Button>
        </Box>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={passwordData.showCurrent ? 'text' : 'password'}
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setPasswordData({ 
                      ...passwordData, 
                      showCurrent: !passwordData.showCurrent 
                    })}
                    edge="end"
                  >
                    {passwordData.showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type={passwordData.showNew ? 'text' : 'password'}
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              margin="normal"
              helperText="Password must be at least 8 characters long"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setPasswordData({ 
                      ...passwordData, 
                      showNew: !passwordData.showNew 
                    })}
                    edge="end"
                  >
                    {passwordData.showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type={passwordData.showConfirm ? 'text' : 'password'}
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              margin="normal"
              error={passwordData.new !== passwordData.confirm && passwordData.confirm !== ''}
              helperText={
                passwordData.new !== passwordData.confirm && passwordData.confirm !== ''
                  ? 'Passwords do not match'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setPasswordData({ 
                      ...passwordData, 
                      showConfirm: !passwordData.showConfirm 
                    })}
                    edge="end"
                  >
                    {passwordData.showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={
              loading ||
              !passwordData.current ||
              !passwordData.new ||
              !passwordData.confirm ||
              passwordData.new !== passwordData.confirm
            }
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}