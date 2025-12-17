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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'

interface KPITemplate {
  id: string
  name: string
  description: string
  category: string
  defaultTarget: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
}

interface EmployeeKPIAssignment {
  id: string
  employeeId: string
  employeeName: string
  department: string
  kpiName: string
  target: number
  unit: string
  assignedDate: string
}

// Mock KPI templates
const mockKPITemplates: KPITemplate[] = [
  { id: 't1', name: 'Sales Revenue', description: 'Monthly sales revenue target', category: 'Sales', defaultTarget: 100000, unit: '$', frequency: 'monthly' },
  { id: 't2', name: 'Customer Satisfaction', description: 'Average CSAT score', category: 'Customer', defaultTarget: 4.5, unit: '/5', frequency: 'monthly' },
  { id: 't3', name: 'Project Delivery', description: 'On-time project delivery rate', category: 'Productivity', defaultTarget: 95, unit: '%', frequency: 'quarterly' },
  { id: 't4', name: 'Training Completion', description: 'Required training hours completed', category: 'Development', defaultTarget: 40, unit: 'hrs', frequency: 'quarterly' },
]

// Mock employee assignments
const mockAssignments: EmployeeKPIAssignment[] = [
  { id: 'a1', employeeId: 'emp1', employeeName: 'John Doe', department: 'Engineering', kpiName: 'Project Delivery', target: 90, unit: '%', assignedDate: '2024-01-01' },
  { id: 'a2', employeeId: 'emp1', employeeName: 'John Doe', department: 'Engineering', kpiName: 'Training Completion', target: 20, unit: 'hrs', assignedDate: '2024-01-01' },
  { id: 'a3', employeeId: 'emp2', employeeName: 'Jane Smith', department: 'Sales', kpiName: 'Sales Revenue', target: 150000, unit: '$', assignedDate: '2024-01-01' },
  { id: 'a4', employeeId: 'emp3', employeeName: 'Mike Johnson', department: 'Support', kpiName: 'Customer Satisfaction', target: 4.8, unit: '/5', assignedDate: '2024-01-01' },
]

const KPIAdminPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const [tabValue, setTabValue] = useState(0)
  const [templates] = useState<KPITemplate[]>(mockKPITemplates)
  const [assignments, setAssignments] = useState<EmployeeKPIAssignment[]>(mockAssignments)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [customTarget, setCustomTarget] = useState('')
  
  useEffect(() => {
    metricsService.trackPageLoad('kpi-admin')
    metricsService.trackUserInteraction('page_visit', 'KPIAdminPage')
  }, [])

  const handleAssignKPI = () => {
    if (selectedTemplate && selectedEmployee && customTarget) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        const newAssignment: EmployeeKPIAssignment = {
          id: `a${Date.now()}`,
          employeeId: selectedEmployee,
          employeeName: selectedEmployee === 'emp1' ? 'John Doe' : selectedEmployee === 'emp2' ? 'Jane Smith' : 'Mike Johnson',
          department: 'Engineering',
          kpiName: template.name,
          target: parseFloat(customTarget),
          unit: template.unit,
          assignedDate: new Date().toISOString().split('T')[0]
        }
        setAssignments(prev => [...prev, newAssignment])
        setAssignDialogOpen(false)
        setSelectedTemplate('')
        setSelectedEmployee('')
        setCustomTarget('')
      }
    }
  }

  return (
    <PermissionGate
      roles={['manager']}
      fallback={
        <Alert severity="warning">
          You need HR Manager privileges to access KPI Administration.
        </Alert>
      }
    >
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            KPI Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage KPI templates and assign KPIs to employees across the organization.
          </Typography>
        </Box>

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="KPI Templates" />
          <Tab label="Employee Assignments" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<AddIcon />}>
                Create Template
              </Button>
            </Box>
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid item xs={12} md={6} key={template.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">{template.name}</Typography>
                        <Chip label={template.category} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {template.description}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          Default: {template.defaultTarget}{template.unit} ({template.frequency})
                        </Typography>
                        <Box>
                          <IconButton size="small"><EditIcon /></IconButton>
                          <IconButton size="small"><DeleteIcon /></IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAssignDialogOpen(true)}>
                Assign KPI to Employee
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>KPI</TableCell>
                    <TableCell align="right">Target</TableCell>
                    <TableCell>Assigned Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.employeeName}</TableCell>
                      <TableCell>{assignment.department}</TableCell>
                      <TableCell>{assignment.kpiName}</TableCell>
                      <TableCell align="right">{assignment.target}{assignment.unit}</TableCell>
                      <TableCell>{assignment.assignedDate}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small"><EditIcon /></IconButton>
                        <IconButton size="small"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Assign KPI Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign KPI to Employee</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} label="Employee">
                  <MenuItem value="emp1">John Doe - Engineering</MenuItem>
                  <MenuItem value="emp2">Jane Smith - Sales</MenuItem>
                  <MenuItem value="emp3">Mike Johnson - Support</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>KPI Template</InputLabel>
                <Select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} label="KPI Template">
                  {templates.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Custom Target"
                type="number"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                helperText="Set a custom target for this employee"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignKPI} variant="contained">Assign KPI</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGate>
  )
}

export default KPIAdminPage
