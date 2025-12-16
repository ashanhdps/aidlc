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
  Alert
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'

interface TeamMemberKPI {
  id: string
  employeeId: string
  employeeName: string
  kpiName: string
  current: number
  target: number
  unit: string
  status: 'pending_approval' | 'approved' | 'modified'
}

// Mock data for team KPIs
const mockTeamKPIs: TeamMemberKPI[] = [
  { id: '1', employeeId: 'emp1', employeeName: 'John Doe', kpiName: 'Project Completion', current: 85, target: 90, unit: '%', status: 'approved' },
  { id: '2', employeeId: 'emp1', employeeName: 'John Doe', kpiName: 'Code Quality', current: 4.2, target: 4.5, unit: '/5', status: 'approved' },
  { id: '3', employeeId: 'emp2', employeeName: 'Jane Smith', kpiName: 'Sales Target', current: 120000, target: 150000, unit: '$', status: 'modified' },
  { id: '4', employeeId: 'emp2', employeeName: 'Jane Smith', kpiName: 'Client Retention', current: 92, target: 95, unit: '%', status: 'pending_approval' },
  { id: '5', employeeId: 'emp3', employeeName: 'Mike Johnson', kpiName: 'Support Tickets', current: 45, target: 50, unit: 'tickets', status: 'approved' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'pending_approval': return 'warning'
    case 'modified': return 'info'
    default: return 'default'
  }
}

const TeamKPIsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const [teamKPIs, setTeamKPIs] = useState<TeamMemberKPI[]>(mockTeamKPIs)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedKPI, setSelectedKPI] = useState<TeamMemberKPI | null>(null)
  const [newTarget, setNewTarget] = useState('')
  
  useEffect(() => {
    metricsService.trackPageLoad('team-kpis')
    metricsService.trackUserInteraction('page_visit', 'TeamKPIsPage')
  }, [])

  const handleEditClick = (kpi: TeamMemberKPI) => {
    setSelectedKPI(kpi)
    setNewTarget(kpi.target.toString())
    setEditDialogOpen(true)
  }

  const handleSaveKPI = () => {
    if (selectedKPI && newTarget) {
      setTeamKPIs(prev => prev.map(kpi => 
        kpi.id === selectedKPI.id 
          ? { ...kpi, target: parseFloat(newTarget), status: 'pending_approval' as const }
          : kpi
      ))
      setEditDialogOpen(false)
      setSelectedKPI(null)
    }
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
              Team KPI Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set and modify KPIs for your team members. Changes require HR approval.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />}>
            Assign New KPI
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          As a supervisor, you can modify KPIs for your team members. All changes will be sent to HR for approval.
        </Alert>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>KPI Name</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Target</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamKPIs.map((kpi) => (
                <TableRow key={kpi.id}>
                  <TableCell>{kpi.employeeName}</TableCell>
                  <TableCell>{kpi.kpiName}</TableCell>
                  <TableCell align="right">{kpi.current}{kpi.unit}</TableCell>
                  <TableCell align="right">{kpi.target}{kpi.unit}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={kpi.status.replace('_', ' ')} 
                      color={getStatusColor(kpi.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditClick(kpi)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit KPI Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Modify KPI Target</DialogTitle>
          <DialogContent>
            {selectedKPI && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Employee: {selectedKPI.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  KPI: {selectedKPI.kpiName}
                </Typography>
                <TextField
                  fullWidth
                  label="New Target"
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  sx={{ mt: 2 }}
                  helperText="This change will be sent to HR for approval"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveKPI} variant="contained">Submit for Approval</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGate>
  )
}

export default TeamKPIsPage
