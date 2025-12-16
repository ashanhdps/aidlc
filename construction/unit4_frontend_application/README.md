# Unit 4: Frontend Application

A comprehensive React application for performance management built with Domain-Driven Design principles.

## Overview

This application provides a complete performance management solution with real-time dashboards, assessment tools, feedback systems, and data visualization capabilities. Built using modern React patterns with TypeScript, Redux Toolkit, and Material-UI.

## Features

### 🎯 Dashboard Management
- **Personal Dashboards**: Customizable KPI dashboards with real-time updates
- **Widget System**: Drag-and-drop widgets (KPI, Charts, Insights, Custom)
- **Filtering & Time Ranges**: Advanced filtering with multiple time period support
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📊 Data Visualization
- **Interactive Charts**: Line, Bar, Pie, and Heat Map charts with Recharts
- **Export Capabilities**: Export data as CSV, Excel, PDF, or PNG
- **Real-time Updates**: Live data updates via WebSocket simulation
- **Configuration Options**: Customizable chart appearance and behavior

### 📝 Assessment System
- **Dynamic Forms**: Template-based assessment forms with validation
- **Auto-save**: Automatic draft saving with progress tracking
- **Multi-section Support**: Complex assessments with multiple sections
- **Validation Engine**: Comprehensive form validation with error handling

### 💬 Feedback Management
- **Threaded Conversations**: Organized feedback threads with participants
- **Real-time Notifications**: Instant notifications for new feedback
- **Search & Filtering**: Advanced search and filtering capabilities
- **Sentiment Analysis**: Basic sentiment tracking for feedback

### 👤 User Session Management
- **Authentication**: Role-based access control with JWT tokens
- **User Preferences**: Theme, language, and notification preferences
- **Permission System**: Granular permissions for different user roles
- **Navigation**: Breadcrumb navigation with sidebar menu

## Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Library**: Material-UI (MUI) v5
- **Data Visualization**: Recharts
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library + jest-axe
- **Code Quality**: ESLint + Prettier

## Architecture

### Domain-Driven Design
The application follows DDD principles with clear aggregate boundaries:

```
src/
├── aggregates/
│   ├── dashboard/          # Dashboard domain logic
│   ├── visualization/      # Data visualization domain
│   ├── assessment/         # Assessment forms domain
│   ├── feedback/          # Feedback system domain
│   └── session/           # User session domain
├── components/            # Shared UI components
├── services/             # Application services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── store/               # Redux store configuration
```

### Key Design Patterns
- **Aggregate Pattern**: Domain logic organized in aggregates
- **Repository Pattern**: In-memory repositories with localStorage persistence
- **Event-Driven Architecture**: Cross-aggregate communication via events
- **CQRS**: Separate read/write models for complex operations
- **Observer Pattern**: Real-time updates and notifications

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd construction/unit4_frontend_application

# Install dependencies
npm install

# Start development server
npm run dev
```

**Note**: If you encounter JSX runtime errors, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for solutions.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## User Stories Implementation

### ✅ Story 1: Personal KPI Dashboard
- View personal KPIs with current values, targets, and trends
- Real-time updates and customizable widgets
- Time range filtering and export capabilities

### ✅ Story 2: Assessment Completion
- Complete performance assessments with auto-save
- Progress tracking and validation
- Draft management and submission workflow

### ✅ Story 3: Feedback Management
- View and respond to feedback threads
- Real-time notifications and search capabilities
- Thread management and archiving

### ✅ Story 4: Data Visualization
- Interactive charts with multiple visualization types
- Export functionality and configuration options
- Responsive design for all devices

### ✅ Story 5: Team Dashboard (Supervisors)
- Team performance overview with aggregated metrics
- Role-based access control
- Team member performance tracking

### ✅ Story 6: Executive Dashboard
- High-level organizational metrics
- Strategic KPI monitoring
- Executive reporting capabilities

### ✅ Story 7: Assessment Creation (Managers)
- Create and manage assessment templates
- Form builder with validation rules
- Template versioning and deployment

### ✅ Story 8: Performance Analytics
- Advanced analytics and insights
- Trend analysis and recommendations
- Performance correlation analysis

### ✅ Story 9: System Administration
- User management and role assignment
- System configuration and monitoring
- Health checks and performance metrics

## Performance Features

### Code Splitting
- Lazy loading of route components
- Dynamic imports for heavy components
- Bundle size optimization

### Caching Strategy
- Multi-level caching (memory, session, long-term)
- Intelligent cache invalidation
- Offline support with cache fallback

### Real-time Updates
- WebSocket simulation for live data
- Optimistic updates for better UX
- Automatic reconnection handling

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Redux state testing
- Service layer testing
- Utility function testing

### Integration Tests
- User workflow testing
- Cross-aggregate communication testing
- API integration testing

### Accessibility Tests
- Automated accessibility testing with jest-axe
- Keyboard navigation testing
- Screen reader compatibility testing

### Performance Tests
- Bundle size monitoring
- Runtime performance testing
- Memory leak detection

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```env
VITE_API_BASE_URL=https://api.example.com
VITE_WEBSOCKET_URL=wss://ws.example.com
VITE_ENVIRONMENT=production
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- User interaction metrics
- Error tracking and reporting
- Performance bottleneck identification

### Health Checks
- Application health monitoring
- Service availability checks
- Real-time status dashboard
- Automated alerting

### User Analytics
- User behavior tracking
- Feature usage analytics
- Performance impact analysis
- A/B testing support

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Permission-based UI rendering
- Secure token storage

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure HTTP headers

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

### Code Style
- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write comprehensive tests for new features
- Follow conventional commit messages

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Run linting and tests
4. Submit PR with detailed description
5. Address review feedback

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ using React, TypeScript, and Material-UI**