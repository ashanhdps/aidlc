import { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'
import { 
  useGetKPIDefinitionsQuery,
  useCreateKPIDefinitionMutation,
  useUpdateKPIDefinitionMutation,
  useDeleteKPIDefinitionMutation,
  type KPIDefinition,
  type CreateKPIRequest
} from '../store/api/kpiManagementApi'

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'SALES': return 'success'
    case 'PRODUCTIVITY': return 'primary'
    case 'QUALITY': return 'secondary'
    case 'CUSTOMER_SERVICE': return 'info'
    case 'MARKETING': return 'warning'
    case 'OPERATIONS': return 'default'
    case 'FINANCE': return 'success'
    case 'HUMAN_RESOURCES': return 'info'
    case 'INNOVATION': return 'primary'
    case 'COMPLIANCE': return 'error'
    default: return 'default'
  }
}

const categories = [
  'SALES', 'PRODUCTIVITY', 'QUALITY', 'CUSTOMER_SERVICE', 'MARKETING', 
  'OPERATIONS', 'FINANCE', 'HUMAN_RESOURCES', 'INNOVATION', 'COMPLIANCE'
]

const measurementTypes = [
  'CURRENCY', 'PERCENTAGE', 'COUNT', 'RATIO', 'TIME', 'RATING'
]

const comparisonTypes = [
  'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'EQUAL', 'NOT_EQUAL'
]

const KPIDefinitionsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const { data: kpiDefinitions, isLoading, error, refetch } = useGetKPIDefinitionsQuery({ activeOnly: false })
  const [createKPI] = useCreateKPIDefinitionMutation()
  const [updateKPI] = useUpdateKPIDefinitionMutation()
  const [deleteKPI] = useDeleteKPIDefinitionMutation()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKPI, setEditingKPI] = useState<KPIDefinition | null>(null)
  const [formData, setFormData] = useState<CreateKPIRequest>({
    name: '',
    description: '',
    category: 'SALES',
    measurementType: 'COUNT',
    defaultTargetValue: 0,
    defaultTargetUnit: '',
    defaultTargetComparisonType: 'GREATER_THAN_OR_EQUAL',
    defaultWeightPercentage: 10,
    defaultWeightIsFlexible: true,
    measurementFrequencyType: 'MONTHLY',
    measurementFrequencyValue: 1,
    dataSource: ''
  })
  
  useEffect(() => {
    metricsService.trackPageLoad('kpi-definitions')
    metricsService.trackUserInteraction('page_visit', 'KPIDefinitionsPage')
    
    // Debug logging
    console.log('KPI Definitions Page - User:', user)
    console.log('KPI Definitions Page - User Role:', user?.role?.name)
    console.log('KPI Definitions Page - Loading:', isLoading)
    console.log('KPI Definitions Page - Error:', error)
    console.log('KPI Definitions Page - Data:', kpiDefinitions)
  }, [user, isLoading, error, kpiDefinitions])

  const handleCreateClick = () => {
    setEditingKPI(null)
    setFormData({
      name: '',
      description: '',
      category: 'SALES',
      measurementType: 'COUNT',
      defaultTargetValue: 0,
      defaultTargetUnit: '',
      defaultTargetComparisonType: 'GREATER_THAN_OR_EQUAL',
      defaultWeightPercentage: 10,
      defaultWeightIsFlexible: true,
      measurementFrequencyType: 'MONTHLY',
      measurementFrequencyValue: 1,
      dataSource: ''
    })
    setDialogOpen(true)
  }

  const handleEditClick = (kpi: KPIDefinition) => {
    setEditingKPI(kpi)
    setFormData({
      name: kpi.name,
      description: kpi.description || '',
      category: kpi.category,
      measurementType: kpi.measurementType,
      defaultTargetValue: kpi.defaultTargetValue || 0,
      defaultTargetUnit: kpi.defaultTargetUnit || '',
      defaultTargetComparisonType: kpi.defaultTargetComparisonType || 'GREATER_THAN_OR_EQUAL',
      defaultWeightPercentage: kpi.defaultWeightPercentage || 10,
      defaultWeightIsFlexible: kpi.defaultWeightIsFlexible || true,
      measurementFrequencyType: kpi.measurementFrequencyType || 'MONTHLY',
      measurementFrequencyValue: kpi.measurementFrequencyValue || 1,
      dataSource: kpi.dataSource || ''
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingKPI) {
        await updateKPI({
          id: editingKPI.id,
          data: formData
        }).unwrap()
      } else {
        await createKPI(formData).unwrap()
      }
      
      setDialogOpen(false)
      refetch()
    } catch (error) {
      console.error('Failed to save KPI:', error)
    }
  }

  const handleDelete = async (kpi: KPIDefinition) => {
    if (window.confirm(`Are you sure you want to delete "${kpi.name}"?`)) {
      try {
        await deleteKPI(kpi.id).unwrap()
        refetch()
      } catch (error) {
        console.error('Failed to delete KPI:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading KPI Definitions...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load KPI definitions. Error: {JSON.stringify(error)}
        </Alert>
        <Button onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <>
      {/* Debug info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Debug: User role = {user?.role?.name}, User = {user?.firstName} {user?.lastName}
      </Alert>
      
      <PermissionGate
        roles={['admin', 'manager', 'supervisor']}
        fallback={
          <Alert severity="warning">
            You need admin, manager, or supervisor privileges to manage KPI definitions.
            Current role: {user?.role?.name}
          </Alert>
        }
      >
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                KPI Definitions Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create, edit, and manage KPI definitions that can be assigned to employees.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
              Create KPI
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Showing {kpiDefinitions?.length || 0} KPI definitions. These are the templates that can be assigned to employees.
          </Alert>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>KPI Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Measurement Type</TableCell>
                  <TableCell align="right">Default Target</TableCell>
                  <TableCell align="center">Weight %</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kpiDefinitions?.map((kpi) => (
                  <TableRow key={kpi.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {kpi.name}
                      </Typography>
                      {kpi.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {kpi.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={kpi.category} 
                        color={getCategoryColor(kpi.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={kpi.measurementType} 
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {kpi.defaultTargetValue ? 
                        `${kpi.defaultTargetValue} ${kpi.defaultTargetUnit || ''}` : 
                        'Not set'
                      }
                    </TableCell>
                    <TableCell align="center">
                      {kpi.defaultWeightPercentage || 'Not set'}%
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={kpi.active ? 'Active' : 'Inactive'} 
                        color={kpi.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {kpi.createdBy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(kpi.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditClick(kpi)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(kpi)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Create/Edit KPI Dialog */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingKPI ? 'Edit KPI Definition' : 'Create New KPI Definition'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="KPI Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        label="Category"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Measurement Type</InputLabel>
                      <Select
                        value={formData.measurementType}
                        onChange={(e) => setFormData({ ...formData, measurementType: e.target.value as any })}
                        label="Measurement Type"
                      >
                        {measurementTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data Source"
                      value={formData.dataSource}
                      onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                      placeholder="e.g., salesforce-api, project-management-system"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Default Target Value"
                      type="number"
                      value={formData.defaultTargetValue}
                      onChange={(e) => setFormData({ ...formData, defaultTargetValue: parseFloat(e.target.value) || 0 })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Target Unit"
                      value={formData.defaultTargetUnit}
                      onChange={(e) => setFormData({ ...formData, defaultTargetUnit: e.target.value })}
                      placeholder="e.g., %, USD, tasks"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Comparison Type</InputLabel>
                      <Select
                        value={formData.defaultTargetComparisonType}
                        onChange={(e) => setFormData({ ...formData, defaultTargetComparisonType: e.target.value as any })}
                        label="Comparison Type"
                      >
                        {comparisonTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Default Weight Percentage"
                      type="number"
                      value={formData.defaultWeightPercentage}
                      onChange={(e) => setFormData({ ...formData, defaultWeightPercentage: parseFloat(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.defaultWeightIsFlexible}
                          onChange={(e) => setFormData({ ...formData, defaultWeightIsFlexible: e.target.checked })}
                        />
                      }
                      label="Weight is Flexible"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Measurement Frequency Type"
                      value={formData.measurementFrequencyType}
                      onChange={(e) => setFormData({ ...formData, measurementFrequencyType: e.target.value })}
                      placeholder="e.g., DAILY, WEEKLY, MONTHLY"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Measurement Frequency Value"
                      type="number"
                      value={formData.measurementFrequencyValue}
                      onChange={(e) => setFormData({ ...formData, measurementFrequencyValue: parseInt(e.target.value) || 1 })}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                variant="contained"
                disabled={!formData.name || !formData.category}
              >
                {editingKPI ? 'Update KPI' : 'Create KPI'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </PermissionGate>
    </>
  )
}

export default KPIDefinitionsPage