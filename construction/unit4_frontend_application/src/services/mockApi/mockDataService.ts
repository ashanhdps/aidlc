import { 
  Dashboard, 
  KPI, 
  Assessment, 
  FeedbackThread, 
  UserProfile,
  PerformanceData,
  InsightData,
  Template
} from '../../types/domain'
import { ApiResponse } from '../../types/common'

// Mock data generators
export class MockDataService {
  private static instance: MockDataService
  private mockDelay = 500 // Simulate network delay

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  private delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Mock KPI data
  async getKPIs(userId: string): Promise<ApiResponse<KPI[]>> {
    await this.delay()
    
    const mockKPIs: KPI[] = [
      {
        id: '1',
        name: 'Sales Performance',
        description: 'Monthly sales target achievement',
        current: 85,
        target: 100,
        unit: '%',
        status: 'yellow',
        trend: 'up',
        category: 'Sales',
        lastUpdated: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Customer Satisfaction',
        description: 'Average customer satisfaction score',
        current: 4.2,
        target: 4.5,
        unit: '/5',
        status: 'yellow',
        trend: 'stable',
        category: 'Customer Service',
        lastUpdated: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Project Completion',
        description: 'On-time project delivery rate',
        current: 92,
        target: 90,
        unit: '%',
        status: 'green',
        trend: 'up',
        category: 'Operations',
        lastUpdated: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ]

    return {
      data: mockKPIs,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Mock Dashboard data
  async getDashboard(userId: string): Promise<ApiResponse<Dashboard>> {
    await this.delay()
    
    const mockDashboard: Dashboard = {
      id: `dashboard-${userId}`,
      userId,
      name: 'Personal Dashboard',
      description: 'My performance dashboard',
      layout: {
        columns: 12,
        rows: 6,
        responsive: true
      },
      widgets: [
        {
          id: 'widget-1',
          type: 'kpi',
          title: 'Sales Performance',
          configuration: {
            dataSource: 'kpi-1',
            refreshInterval: 300000
          },
          position: { x: 0, y: 0, width: 4, height: 2 }
        },
        {
          id: 'widget-2',
          type: 'chart',
          title: 'Monthly Trends',
          configuration: {
            chartType: 'line',
            dataSource: 'performance-trends',
            refreshInterval: 600000,
            showLegend: true
          },
          position: { x: 4, y: 0, width: 8, height: 4 }
        }
      ],
      filters: {
        timeRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly'
        }
      },
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }

    return {
      data: mockDashboard,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Mock Performance data
  async getPerformanceData(userId: string, kpiId: string): Promise<ApiResponse<PerformanceData[]>> {
    await this.delay()
    
    const mockData: PerformanceData[] = Array.from({ length: 12 }, (_, i) => ({
      id: `perf-${i}`,
      userId,
      kpiId,
      value: Math.floor(Math.random() * 40) + 60, // Random value between 60-100
      target: 85,
      period: `2024-${String(i + 1).padStart(2, '0')}`,
      timestamp: new Date(2024, i, 1).toISOString(),
      createdAt: new Date(2024, i, 1).toISOString(),
      updatedAt: new Date(2024, i, 1).toISOString()
    }))

    return {
      data: mockData,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Mock Assessment templates
  async getAssessmentTemplates(): Promise<ApiResponse<Template[]>> {
    await this.delay()
    
    const mockTemplates: Template[] = [
      {
        id: 'template-1',
        name: 'Quarterly Performance Review',
        description: 'Comprehensive quarterly performance assessment',
        version: 1,
        sections: [
          {
            id: 'section-1',
            title: 'Goal Achievement',
            description: 'Evaluate progress on quarterly goals',
            order: 1,
            fields: [
              {
                id: 'field-1',
                type: 'rating',
                label: 'Overall Goal Achievement',
                required: true,
                validation: [{ type: 'required', message: 'Rating is required' }],
                options: ['1', '2', '3', '4', '5'],
                order: 1
              },
              {
                id: 'field-2',
                type: 'textarea',
                label: 'Key Accomplishments',
                placeholder: 'Describe your key accomplishments this quarter...',
                required: true,
                validation: [
                  { type: 'required', message: 'This field is required' },
                  { type: 'minLength', value: 50, message: 'Please provide at least 50 characters' }
                ],
                order: 2
              }
            ]
          }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ]

    return {
      data: mockTemplates,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Mock Feedback threads
  async getFeedbackThreads(userId: string): Promise<ApiResponse<FeedbackThread[]>> {
    await this.delay()
    
    const mockThreads: FeedbackThread[] = [
      {
        id: 'thread-1',
        title: 'Q4 Performance Discussion',
        participants: [userId, 'manager-1'],
        status: 'active',
        kpiId: '1',
        messages: [
          {
            id: 'msg-1',
            threadId: 'thread-1',
            senderId: 'manager-1',
            content: 'Great improvement in sales performance this quarter!',
            type: 'feedback',
            sentiment: 'positive',
            readBy: [userId],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    return {
      data: mockThreads,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Mock Insights
  async getInsights(userId: string): Promise<ApiResponse<InsightData[]>> {
    await this.delay()
    
    const mockInsights: InsightData[] = [
      {
        id: 'insight-1',
        type: 'recommendation',
        title: 'Focus on Customer Retention',
        description: 'Your customer satisfaction scores suggest focusing on retention strategies could improve overall performance.',
        priority: 'medium',
        actionable: true,
        kpiIds: ['2'],
        userId,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'insight-2',
        type: 'achievement',
        title: 'Project Delivery Excellence',
        description: 'Congratulations! You\'ve exceeded your project completion target for 3 consecutive months.',
        priority: 'high',
        actionable: false,
        kpiIds: ['3'],
        userId,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]

    return {
      data: mockInsights,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Mock user profile
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    await this.delay()
    
    const mockProfile: UserProfile = {
      id: userId,
      email: 'john.doe@company.com',
      firstName: 'John',
      lastName: 'Doe',
      role: {
        id: 'role-1',
        name: 'employee',
        permissions: ['read:own_kpis', 'write:own_assessments', 'read:own_feedback']
      },
      department: 'Sales',
      managerId: 'manager-1',
      permissions: ['read:own_kpis', 'write:own_assessments', 'read:own_feedback'],
      avatar: undefined
    }

    return {
      data: mockProfile,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Error simulation
  async simulateError(): Promise<never> {
    await this.delay()
    throw new Error('Simulated API error for testing')
  }

  // Network timeout simulation
  async simulateTimeout(): Promise<never> {
    await this.delay(10000) // 10 second delay
    throw new Error('Request timeout')
  }
}

export const mockDataService = MockDataService.getInstance()