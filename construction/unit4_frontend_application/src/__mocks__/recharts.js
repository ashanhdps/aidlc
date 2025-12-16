// Mock Recharts components for testing
import React from 'react'

const MockChart = ({ children, ...props }) => (
  <div data-testid="mock-chart" {...props}>
    {children}
  </div>
)

const MockComponent = (props) => <div {...props} />

export const LineChart = MockChart
export const BarChart = MockChart
export const PieChart = MockChart
export const ResponsiveContainer = ({ children, ...props }) => (
  <div data-testid="responsive-container" {...props}>
    {children}
  </div>
)
export const XAxis = MockComponent
export const YAxis = MockComponent
export const CartesianGrid = MockComponent
export const Tooltip = MockComponent
export const Legend = MockComponent
export const Line = MockComponent
export const Bar = MockComponent
export const Cell = MockComponent
export const Pie = MockComponent