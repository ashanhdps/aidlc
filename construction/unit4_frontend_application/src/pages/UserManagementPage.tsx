import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Stack
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  type User,
  type CreateUserRequest,
  type UpdateUserRequest
} from '../store/api/userManagementApi'
import { UserOnboarding } from '../components/user/UserOnboarding'
import { AdminOnly } from '../components/auth/AdminOnly'

const UserManagementPage: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    role: '',
    activeOnly: false
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuUserId, setMenuUserId] = useState<string | null>(null)

  const { data: users = [], isLoading, error, refetch } = useGetUsersQuery(filters)
  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [activateUser] = useActivateUserMutation()
  const [deactivateUser] = useDeactivateUserMutation()

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget)
    setMenuUserId(userId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuUserId(null)
  }

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await createUser(userData).unwrap()
      setShowCreateModal(false)
      refetch()
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleUpdateUser = async (userId: string, userData: UpdateUserRequest) => {
    try {
      await updateUser({ userId, data: userData }).unwrap()
      setShowEditModal(false)
      setSelectedUser(null)
      refetch()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      await activateUser(userId).unwrap()
      refetch()
      handleMenuClose()
    } catch (error) {
      console.error('Failed to activate user:', error)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUser(userId).unwrap()
      refetch()
      handleMenuClose()
    } catch (error) {
      console.error('Failed to deactivate user:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'INACTIVE':
        return 'error'
      case 'PENDING':
        return 'warning'
      case 'SUSPENDED':
        return 'error'
      default:
        return 'default'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'secondary'
      case 'MANAGER':
        return 'primary'
      case 'ANALYST':
        return 'info'
      case 'EMPLOYEE':
        return 'default'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load user data. Please try again.
        </Alert>
      </Box>
    )
  }

  return (
    <AdminOnly>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.50',
          py: 4,
          px: 3
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    User Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage system users, roles, and permissions
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setShowOnboarding(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Onboard User
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateModal(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Quick Add
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Filters Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role Filter</InputLabel>
                    <Select
                      value={filters.role}
                      label="Role Filter"
                      onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="ANALYST">Analyst</MenuItem>
                      <MenuItem value="EMPLOYEE">Employee</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Page Size</InputLabel>
                    <Select
                      value={filters.size}
                      label="Page Size"
                      onChange={(e) => setFilters({ ...filters, size: Number(e.target.value) })}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => refetch()}
                    sx={{ textTransform: 'none' }}
                    fullWidth
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Users Table Card */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={getRoleColor(user.role) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.accountStatus}
                            color={getStatusColor(user.accountStatus) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.createdDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.lastLoginTime ? new Date(user.lastLoginTime).toLocaleDateString() : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, user.id)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {users.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography color="text.secondary">No users found</Typography>
                  </Box>
                )}
              </TableContainer>
            </CardContent>
          </Card>

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                const user = users.find(u => u.id === menuUserId)
                if (user) {
                  setSelectedUser(user)
                  setShowEditModal(true)
                }
                handleMenuClose()
              }}
            >
              <EditIcon sx={{ mr: 1 }} fontSize="small" />
              Edit
            </MenuItem>
            {menuUserId && users.find(u => u.id === menuUserId)?.accountStatus === 'ACTIVE' ? (
              <MenuItem onClick={() => menuUserId && handleDeactivateUser(menuUserId)}>
                <BlockIcon sx={{ mr: 1 }} fontSize="small" />
                Deactivate
              </MenuItem>
            ) : (
              <MenuItem onClick={() => menuUserId && handleActivateUser(menuUserId)}>
                <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
                Activate
              </MenuItem>
            )}
          </Menu>

          {/* User Onboarding Dialog */}
          <Dialog
            open={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            maxWidth="md"
            fullWidth
          >
            <UserOnboarding
              onComplete={(user) => {
                setShowOnboarding(false)
                refetch()
              }}
              onCancel={() => setShowOnboarding(false)}
            />
          </Dialog>

          {/* Create User Dialog */}
          {showCreateModal && (
            <CreateUserDialog
              open={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateUser}
            />
          )}

          {/* Edit User Dialog */}
          {showEditModal && selectedUser && (
            <EditUserDialog
              open={showEditModal}
              user={selectedUser}
              onClose={() => {
                setShowEditModal(false)
                setSelectedUser(null)
              }}
              onSubmit={(data) => handleUpdateUser(selectedUser.id, data)}
            />
          )}
        </Box>
      </Box>
    </AdminOnly>
  )
}

// Create User Dialog Component
const CreateUserDialog: React.FC<{
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateUserRequest) => void
}> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    username: '',
    password: '',
    role: 'EMPLOYEE'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Create New User
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              variant="outlined"
              helperText="Minimum 6 characters"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="ANALYST">Analyst</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

// Edit User Dialog Component
const EditUserDialog: React.FC<{
  open: boolean
  user: User
  onClose: () => void
  onSubmit: (data: UpdateUserRequest) => void
}> = ({ open, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    email: user.email,
    role: user.role
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Edit User: {user.username}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="ANALYST">Analyst</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            
            <Card sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  User Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Current Status:</strong> {user.accountStatus}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created:</strong> {new Date(user.createdDate).toLocaleDateString()}
                  </Typography>
                  {user.lastLoginTime && (
                    <Typography variant="body2">
                      <strong>Last Login:</strong> {new Date(user.lastLoginTime).toLocaleDateString()}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default UserManagementPage