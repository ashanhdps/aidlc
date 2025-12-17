import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  Grid,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ExpandMore, ExpandLess, FilterList, Clear } from '@mui/icons-material'
import { FilterContext, TimeRange } from '../../../types/common'
import { useAppDispatch } from '../../../hooks/redux'
import { applyFilters } from '../store/dashboardSlice'

interface DashboardFiltersProps {
  filters: FilterContext
  onFiltersChange: (filters: FilterContext) => void
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const dispatch = useAppDispatch()
  const [expanded, setExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterContext>(filters)

  const timeRangePeriods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ]

  const kpiCategories = [
    'Sales',
    'Customer Service',
    'Operations',
    'Finance',
    'HR',
    'Marketing',
    'Development',
  ]

  const statusOptions = [
    { value: 'green', label: 'On Track', color: 'success' },
    { value: 'yellow', label: 'At Risk', color: 'warning' },
    { value: 'red', label: 'Behind', color: 'error' },
  ]

  const handleTimeRangeChange = (field: keyof TimeRange, value: any) => {
    const newTimeRange = {
      ...localFilters.timeRange,
      [field]: value,
    }
    
    setLocalFilters({
      ...localFilters,
      timeRange: newTimeRange,
    })
  }

  const handleCategoryToggle = (category: string) => {
    const currentCategories = localFilters.categories || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]
    
    setLocalFilters({
      ...localFilters,
      categories: newCategories,
    })
  }

  const handleStatusToggle = (status: string) => {
    const currentStatus = localFilters.status || []
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status]
    
    setLocalFilters({
      ...localFilters,
      status: newStatus,
    })
  }

  const handleSearchChange = (search: string) => {
    setLocalFilters({
      ...localFilters,
      search,
    })
  }

  const applyLocalFilters = () => {
    dispatch(applyFilters(localFilters))
    onFiltersChange(localFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterContext = {
      timeRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        period: 'monthly',
      },
    }
    
    setLocalFilters(clearedFilters)
    dispatch(applyFilters(clearedFilters))
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.categories?.length) count += localFilters.categories.length
    if (localFilters.status?.length) count += localFilters.status.length
    if (localFilters.search) count += 1
    return count
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ pb: expanded ? 2 : 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">
              Filters
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Chip
                label={`${getActiveFilterCount()} active`}
                size="small"
                color="primary"
              />
            )}
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {getActiveFilterCount() > 0 && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            )}
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box mt={2}>
            <Grid container spacing={3}>
              {/* Time Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Time Range
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Period</InputLabel>
                      <Select
                        value={localFilters.timeRange.period || 'monthly'}
                        label="Period"
                        onChange={(e) => handleTimeRangeChange('period', e.target.value)}
                      >
                        {timeRangePeriods.map((period) => (
                          <MenuItem key={period.value} value={period.value}>
                            {period.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={new Date(localFilters.timeRange.startDate)}
                        onChange={(date) => 
                          handleTimeRangeChange('startDate', date?.toISOString())
                        }
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="End Date"
                        value={new Date(localFilters.timeRange.endDate)}
                        onChange={(date) => 
                          handleTimeRangeChange('endDate', date?.toISOString())
                        }
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Grid>

              {/* Search */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Search
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search KPIs, metrics..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </Grid>

              {/* Categories */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Categories
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {kpiCategories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      size="small"
                      clickable
                      color={localFilters.categories?.includes(category) ? 'primary' : 'default'}
                      onClick={() => handleCategoryToggle(category)}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {statusOptions.map((status) => (
                    <Chip
                      key={status.value}
                      label={status.label}
                      size="small"
                      clickable
                      color={localFilters.status?.includes(status.value) ? status.color as any : 'default'}
                      onClick={() => handleStatusToggle(status.value)}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>

            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => setLocalFilters(filters)}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={applyLocalFilters}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}