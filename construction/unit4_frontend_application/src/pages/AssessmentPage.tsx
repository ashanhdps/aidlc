import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tabs,
  Tab,
  Alert,
} from '@mui/material'
import { 
  Assessment as AssessmentIcon, 
  RateReview as RateReviewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'
import { AssessmentContainer } from '../aggregates/assessment/components/AssessmentContainer'
import { metricsService } from '../services/MetricsService'
import { Assessment, Template } from '../types/domain'

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
      id={`assessment-tabpanel-${index}`}
      aria-labelledby={`assessment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const AssessmentPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.session)
  const [tabValue, setTabValue] = useState(0)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // Check if user can see review queue (supervisors, managers, HR - not employees)
  const canReviewAssessments = user?.role?.name !== 'employee'

  // Mock data - in real app, would come from API
  const [assessments] = useState<Assessment[]>([
    {
      id: 'assessment-1',
      templateId: 'template-1',
      userId: user?.id || 'user-1',
      status: 'draft',
      responses: {},
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'assessment-2',
      templateId: 'template-2',
      userId: user?.id || 'user-1',
      status: 'completed',
      responses: { field1: 'response1' },
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      completedAt: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ])

  const [templates] = useState<Template[]>([
    {
      id: 'template-1',
      name: 'Q4 Self Assessment',
      description: 'Quarterly self-assessment for performance review',
      sections: [
        {
          id: 'section-1',
          title: 'Goals and Achievements',
          fields: [
            {
              id: 'goals',
              type: 'textarea',
              label: 'What were your main goals this quarter?',
              required: true,
              order: 1,
            },
            {
              id: 'achievements',
              type: 'textarea',
              label: 'What were your key achievements?',
              required: true,
              order: 2,
            },
          ],
          order: 1,
        },
      ],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])

  useEffect(() => {
    metricsService.trackPageLoad('assessments')
    metricsService.trackUserInteraction('page_visit', 'AssessmentPage')
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    metricsService.trackUserInteraction('tab_change', 'AssessmentPage', undefined, { tab: newValue })
  }

  const handleStartAssessment = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      const newAssessment: Assessment = {
        id: `assessment-${Date.now()}`,
        templateId,
        userId: user?.id || 'user-1',
        status: 'draft',
        responses: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      setSelectedAssessment(newAssessment)
      setSelectedTemplate(template)
      metricsService.trackUserInteraction('start_assessment', 'AssessmentPage', undefined, { templateId })
    }
  }

  const handleContinueAssessment = (assessment: Assessment) => {
    const template = templates.find(t => t.id === assessment.templateId)
    if (template) {
      setSelectedAssessment(assessment)
      setSelectedTemplate(template)
      metricsService.trackUserInteraction('continue_assessment', 'AssessmentPage', undefined, { assessmentId: assessment.id })
    }
  }

  const handleAssessmentSubmit = (assessment: Assessment) => {
    console.log('Assessment submitted:', assessment)
    setSelectedAssessment(null)
    setSelectedTemplate(null)
    // In real app, would update the assessments list
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'submitted':
        return 'info'
      case 'in_review':
        return 'warning'
      case 'draft':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />
      case 'submitted':
      case 'in_review':
        return <PendingIcon />
      case 'draft':
        return <ScheduleIcon />
      default:
        return <ScheduleIcon />
    }
  }

  if (selectedAssessment && selectedTemplate) {
    return (
      <AssessmentContainer
        assessment={selectedAssessment}
        template={selectedTemplate}
        onSubmit={handleAssessmentSubmit}
        onSave={(assessment) => console.log('Assessment saved:', assessment)}
      />
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Assessments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete your assessments and track your performance progress.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Available Assessments" />
          <Tab label="My Assessments" />
          {canReviewAssessments && <Tab label="Review Queue" />}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {template.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {template.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    {template.sections.length} section{template.sections.length > 1 ? 's' : ''} • Version {template.version}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => handleStartAssessment(template.id)}
                    sx={{ mt: 1 }}
                  >
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {assessments.length === 0 ? (
          <Alert severity="info">
            You haven't started any assessments yet. Check the "Available Assessments" tab to get started.
          </Alert>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Assessments
              </Typography>
              <List>
                {assessments.map((assessment, index) => {
                  const template = templates.find(t => t.id === assessment.templateId)
                  return (
                    <ListItem 
                      key={assessment.id}
                      divider={index < assessments.length - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(assessment.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={template?.name || 'Unknown Template'}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Created: {new Date(assessment.createdAt).toLocaleDateString()}
                            </Typography>
                            {assessment.submittedAt && (
                              <Typography variant="body2" color="text.secondary">
                                Submitted: {new Date(assessment.submittedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={assessment.status}
                          color={getStatusColor(assessment.status) as any}
                          size="small"
                        />
                        {assessment.status === 'draft' && (
                          <Button
                            size="small"
                            onClick={() => handleContinueAssessment(assessment)}
                          >
                            Continue
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                  )
                })}
              </List>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {canReviewAssessments && (
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <RateReviewIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">
                  Review Queue
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Review and score your team members' performance assessments.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                No assessments pending your review at this time.
              </Alert>
            </CardContent>
          </Card>
        </TabPanel>
      )}
    </Box>
  )
}
export default AssessmentPage