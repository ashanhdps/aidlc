import { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'
import { 
  useGetKPIAssignmentsQuery, 
  useGetKPIDefinitionsQuery,
  useCreateKPIAssignmentMutation,
  type KPIDefinition, 
  type KPIAssignment 
} from '../store/api/kpiManagementApi'


const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'PENDING_APPROVAL': return 'warning'
    case 'DRAFT': return 'info'
    case 'SUSPENDED': return 'error'
    case 'EXPIRED': return 'default'
    default: return 'default'
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'SALES': return 'success'
    case 'PRODUCTIVITY': return 'primary'
    case 'QUALITY': return 'secondary'
    case 'CUSTOMER_SERVICE': return 'info'
    case 'MARKETING': return 'warning'
    default: return 'default'
  }
}

// Mock employee data - in a real app this would come from an employee API
const mockEmployees = [
  { id: 'emp1', name: 'John Doe', department: 'Sales' },
  { id: 'emp2', name: 'Jane Smith', department: 'Marketing' },
  { id: 'emp3', name: 'Mike Johnson', department: 'Operations' },
  { id: 'emp4', name: 'Sarah Wilson', department: 'Quality' },
]

const TeamKPIsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const { data: kpiDefinitions, isLoading: loadingDefinitions } = useGetKPIDefinitionsQuery({ activeOnly: true })
  const { data: assignments, isLoading: loadingAssignments, refetch } = useGetKPIAssignmentsQuery({})
  const [createAssignment] = useCreateKPIAssignmentMutation()
  
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedKPI, setSelectedKPI] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [targetUnit, setTargetUnit] = useState('')
  
  useEffect(() => {
    metricsService.trackPageLoad('team-kpis')
    metricsService.trackUserInteraction('page_visit', 'TeamKPIsPage')
  }, [])

  const handleAssignClick = () => {
    setAssignDialogOpen(true)
  }

  const handleAssignKPI = async () => {
    if (selectedEmployee && selectedKPI && targetValue) {
      try {
        await createAssignment({
          employeeId: selectedEmployee,
          kpiDefinitionId: selectedKPI,
          customTargetValue: parseFloat(targetValue),
          customTargetUnit: targetUnit,
          customTargetComparisonType: 'GREATER_THAN_OR_EQUAL'
        }).unwrap()
        
        setAssignDialogOpen(false)
        setSelectedEmployee('')
        setSelectedKPI('')
        setTargetValue('')
        setTargetUnit('')
        refetch()
      } catch (error) {
        console.error('Failed to assign KPI:', error)
      }
    }
  }

  // Group assignments by employee ID
  const groupedAssignments = assignments?.reduce((groups, assignment) => {
    const employeeId = assignment.employeeId
    if (!groups[employeeId]) {
      groups[employeeId] = []
    }
    groups[employeeId].push(assignment)
    return groups
  }, {} as Record<string, KPIAssignment[]>) || {}

  // Get employee stats
  const getEmployeeStats = (employeeAssignments: KPIAssignment[]) => {
    const total = employeeAssignments.length
    const active = employeeAssignments.filter(a => a.status === 'ACTIVE').length
    const pending = employeeAssignments.filter(a => a.status === 'PENDING_APPROVAL').length
    return { total, active, pending }
  }

  // Get employee name by ID
  const getEmployeeName = (employeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === employeeId)
    return employee ? employee.name : employeeId
  }

  // Get employee department by ID
  const getEmployeeDepartment = (employeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === employeeId)
    return employee ? employee.department : 'Unknown'
  }

  // Get KPI name by ID
  const getKPIName = (kpiId: string) => {
    const kpi = kpiDefinitions?.find(k => k.id === kpiId)
    return kpi ? kpi.name : kpiId
  }

  // Get KPI definition by ID
  const getKPIDefinition = (kpiId: string) => {
    return kpiDefinitions?.find(k => k.id === kpiId)
  }

  if (loadingDefinitions || loadingAssignments) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <PermissionGate
      roles={['supervisor']}
      fallback={
        <Alert severity="warning">
          You need supervisor privileges to manage team KPIs.
        </Alert>
      }
    >
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Team KPI Assignments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage KPI assignments for your team members. View current assignments and create new ones.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAssignClick}>
            Assign KPI
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Showing {assignments?.length || 0} KPI assignments across {Object.keys(groupedAssignments).length} employees. 
          As a supervisor, you can assign KPIs to your team members.
        </Alert>

        {Object.keys(groupedAssignments).length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No KPI assignments found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by assigning KPIs to your team members
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAssignClick}>
              Assign First KPI
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(groupedAssignments).map(([employeeId, employeeAssignments]) => {
              const stats = getEmployeeStats(employeeAssignments)
              return (
                <Accordion key={employeeId} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {getEmployeeName(employeeId)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getEmployeeDepartment(employeeId)} • Employee ID: {employeeId}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Badge badgeContent={stats.total} color="primary">
                          <Chip label="Total KPIs" size="small" />
                        </Badge>
                        <Badge badgeContent={stats.active} color="success">
                          <Chip label="Active" size="small" color="success" />
                        </Badge>
                        {stats.pending > 0 && (
                          <Badge badgeContent={stats.pending} color="warning">
                            <Chip label="Pending" size="small" color="warning" />
                          </Badge>
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>KPI Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Target Value</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell>Assigned Date</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {employeeAssignments.map((assignment) => {
                            const kpiDef = getKPIDefinition(assignment.kpiDefinitionId)
                            return (
                              <TableRow key={assignment.id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {getKPIName(assignment.kpiDefinitionId)}
                                  </Typography>
                                  {kpiDef?.description && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {kpiDef.description}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {kpiDef && (
                                    <Chip 
                                      label={kpiDef.category} 
                                      color={getCategoryColor(kpiDef.category) as any}
                                      size="small"
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium">
                                    {assignment.customTargetValue ? 
                                      `${assignment.customTargetValue} ${assignment.customTargetUnit || ''}` : 
                                      (kpiDef?.defaultTargetValue ? `${kpiDef.defaultTargetValue} ${kpiDef.defaultTargetUnit || ''}` : 'Not set')
                                    }
                                  </Typography>
                                  {kpiDef && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {kpiDef.measurementType}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={assignment.status} 
                                    color={getStatusColor(assignment.status) as any}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {new Date(assignment.createdAt).toLocaleDateString()}
                                  </Typography>
                                  {assignment.effectiveDate && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Effective: {new Date(assignment.effectiveDate).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton size="small">
                                    <EditIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Box>
        )}

        {/* Assign KPI Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign KPI to Employee</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Employee"
                >
                  {mockEmployees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>KPI</InputLabel>
                <Select
                  value={selectedKPI}
                  onChange={(e) => {
                    setSelectedKPI(e.target.value)
                    const kpi = kpiDefinitions?.find(k => k.id === e.target.value)
                    if (kpi) {
                      setTargetValue(kpi.defaultTargetValue?.toString() || '')
                      setTargetUnit(kpi.defaultTargetUnit || '')
                    }
                  }}
                  label="KPI"
                >
                  {kpiDefinitions?.map((kpi) => (
                    <MenuItem key={kpi.id} value={kpi.id}>
                      {kpi.name} ({kpi.category})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Target Value"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />

              <TextField
                fullWidth
                label="Target Unit"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                helperText="e.g., %, USD, tasks, etc."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAssignKPI} 
              variant="contained"
              disabled={!selectedEmployee || !selectedKPI || !targetValue}
            >
              Assign KPI
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGate>
  )
}

export default TeamKPIsPage
