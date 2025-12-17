import { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'

interface KPIChangeRequest {
  id: string
  employeeId: string
  employeeName: string
  kpiName: string
  currentTarget: number
  proposedTarget: number
  unit: string
  requestedBy: string
  requestedDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

// Mock pending approval requests
const mockApprovalRequests: KPIChangeRequest[] = [
  {
    id: 'req1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    kpiName: 'Project Completion Rate',
    currentTarget: 90,
    proposedTarget: 85,
    unit: '%',
    requestedBy: 'Emily Martinez (Supervisor)',
    requestedDate: '2024-01-15',
    reason: 'Employee taking on additional mentoring responsibilities',
    status: 'pending'
  },
  {
    id: 'req2',
    employeeId: 'emp2',
    employeeName: 'Jane Smith',
    kpiName: 'Sales Revenue',
    currentTarget: 150000,
    proposedTarget: 175000,
    unit: '$',
    requestedBy: 'Emily Martinez (Supervisor)',
    requestedDate: '2024-01-14',
    reason: 'Employee exceeded targets consistently, raising the bar',
    status: 'pending'
  },
  {
    id: 'req3',
    employeeId: 'emp3',
    employeeName: 'Mike Johnson',
    kpiName: 'Support Tickets',
    currentTarget: 50,
    proposedTarget: 45,
    unit: 'tickets/day',
    requestedBy: 'Emily Martinez (Supervisor)',
    requestedDate: '2024-01-13',
    reason: 'Focus on quality over quantity for complex tickets',
    status: 'pending'
  }
]

const KPIApprovalPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const [requests, setRequests] = useState<KPIChangeRequest[]>(mockApprovalRequests)
  const [selectedRequest, setSelectedRequest] = useState<KPIChangeRequest | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  
  useEffect(() => {
    metricsService.trackPageLoad('kpi-approval')
    metricsService.trackUserInteraction('page_visit', 'KPIApprovalPage')
  }, [])

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' as const } : req
    ))
  }

  const handleRejectClick = (request: KPIChangeRequest) => {
    setSelectedRequest(request)
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = () => {
    if (selectedRequest) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id ? { ...req, status: 'rejected' as const } : req
      ))
      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectReason('')
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')

  return (
    <PermissionGate
      permissions={['kpi:approve']}
      fallback={
        <Alert severity="warning">
          You need KPI approval privileges to access this page.
        </Alert>
      }
    >
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            KPI Approval Queue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve KPI changes requested by supervisors.
          </Typography>
        </Box>

        {pendingRequests.length === 0 ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            No pending KPI change requests. All caught up!
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have {pendingRequests.length} pending KPI change request(s) to review.
          </Alert>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Pending Requests
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>KPI</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Proposed</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">No pending requests</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.employeeName}</TableCell>
                    <TableCell>{request.kpiName}</TableCell>
                    <TableCell align="right">{request.currentTarget}{request.unit}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {request.proposedTarget}{request.unit}
                        <Chip 
                          label={request.proposedTarget > request.currentTarget ? '↑' : '↓'} 
                          size="small"
                          color={request.proposedTarget > request.currentTarget ? 'success' : 'warning'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={request.reason}>
                        {request.reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        color="success" 
                        startIcon={<CheckIcon />}
                        onClick={() => handleApprove(request.id)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<CloseIcon />}
                        onClick={() => handleRejectClick(request)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {processedRequests.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Recently Processed
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>KPI</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.employeeName}</TableCell>
                      <TableCell>{request.kpiName}</TableCell>
                      <TableCell align="right">
                        {request.currentTarget} → {request.proposedTarget}{request.unit}
                      </TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={request.status} 
                          color={request.status === 'approved' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>Reject KPI Change Request</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please provide a reason for rejecting this request.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRejectConfirm} color="error" variant="contained">
              Reject Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGate>
  )
}

export default KPIApprovalPage
