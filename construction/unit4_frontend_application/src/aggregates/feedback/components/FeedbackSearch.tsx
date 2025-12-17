import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Paper,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface SearchFilters {
  status?: string[]
  dateRange?: { start: string; end: string }
  participants?: string[]
  sentiment?: string[]
  messageType?: string[]
}

interface FeedbackSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  initialQuery?: string
  initialFilters?: SearchFilters
}

export const FeedbackSearch: React.FC<FeedbackSearchProps> = ({
  onSearch,
  initialQuery = '',
  initialFilters = {},
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Available filter options
  const statusOptions = ['active', 'resolved', 'archived']
  const participantOptions = ['manager-1', 'peer-1', 'peer-2', 'hr-1', 'executive-1']
  const sentimentOptions = ['positive', 'neutral', 'constructive']
  const messageTypeOptions = ['feedback', 'response', 'system']

  useEffect(() => {
    // Auto-search when query changes (with debounce)
    const timeoutId = setTimeout(() => {
      if (query !== initialQuery || JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
        handleSearch()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, filters])

  const handleSearch = () => {
    onSearch(query, filters)
  }

  const handleFilterChange = (filterKey: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }))
  }

  const handleClearFilters = () => {
    setQuery('')
    setFilters({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status?.length) count++
    if (filters.dateRange?.start || filters.dateRange?.end) count++
    if (filters.participants?.length) count++
    if (filters.sentiment?.length) count++
    if (filters.messageType?.length) count++
    return count
  }

  const renderMultiSelect = (
    label: string,
    value: string[] = [],
    options: string[],
    onChange: (value: string[]) => void
  ) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={(e) => onChange(e.target.value as string[])}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => (
              <Chip key={val} label={val} size="small" />
            ))}
          </Box>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.indexOf(option) > -1} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  return (
    <Box>
      {/* Basic Search */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search conversations, messages, participants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button
            variant="outlined"
            onClick={() => setShowAdvanced(!showAdvanced)}
            startIcon={<FilterIcon />}
            color={getActiveFilterCount() > 0 ? 'primary' : 'inherit'}
          >
            Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
            disabled={!query && getActiveFilterCount() === 0}
          >
            Clear
          </Button>
        </Box>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.status?.map(status => (
              <Chip
                key={status}
                label={`Status: ${status}`}
                onDelete={() => handleFilterChange('status', filters.status?.filter(s => s !== status))}
                size="small"
                variant="outlined"
              />
            ))}
            {filters.participants?.map(participant => (
              <Chip
                key={participant}
                label={`Participant: ${participant}`}
                onDelete={() => handleFilterChange('participants', filters.participants?.filter(p => p !== participant))}
                size="small"
                variant="outlined"
              />
            ))}
            {filters.sentiment?.map(sentiment => (
              <Chip
                key={sentiment}
                label={`Sentiment: ${sentiment}`}
                onDelete={() => handleFilterChange('sentiment', filters.sentiment?.filter(s => s !== sentiment))}
                size="small"
                variant="outlined"
              />
            ))}
            {filters.messageType?.map(type => (
              <Chip
                key={type}
                label={`Type: ${type}`}
                onDelete={() => handleFilterChange('messageType', filters.messageType?.filter(t => t !== type))}
                size="small"
                variant="outlined"
              />
            ))}
            {(filters.dateRange?.start || filters.dateRange?.end) && (
              <Chip
                label="Date range applied"
                onDelete={() => handleFilterChange('dateRange', undefined)}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Advanced Filters */}
      <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Advanced Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Status Filter */}
            <Grid item xs={12} sm={6}>
              {renderMultiSelect(
                'Status',
                filters.status,
                statusOptions,
                (value) => handleFilterChange('status', value)
              )}
            </Grid>

            {/* Participants Filter */}
            <Grid item xs={12} sm={6}>
              {renderMultiSelect(
                'Participants',
                filters.participants,
                participantOptions,
                (value) => handleFilterChange('participants', value)
              )}
            </Grid>

            {/* Sentiment Filter */}
            <Grid item xs={12} sm={6}>
              {renderMultiSelect(
                'Sentiment',
                filters.sentiment,
                sentimentOptions,
                (value) => handleFilterChange('sentiment', value)
              )}
            </Grid>

            {/* Message Type Filter */}
            <Grid item xs={12} sm={6}>
              {renderMultiSelect(
                'Message Type',
                filters.messageType,
                messageTypeOptions,
                (value) => handleFilterChange('messageType', value)
              )}
            </Grid>

            {/* Date Range Filter */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Date Range
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="From"
                    value={filters.dateRange?.start ? new Date(filters.dateRange.start) : null}
                    onChange={(date) => {
                      const dateRange = filters.dateRange || {}
                      handleFilterChange('dateRange', {
                        ...dateRange,
                        start: date?.toISOString() || '',
                      })
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="To"
                    value={filters.dateRange?.end ? new Date(filters.dateRange.end) : null}
                    onChange={(date) => {
                      const dateRange = filters.dateRange || {}
                      handleFilterChange('dateRange', {
                        ...dateRange,
                        end: date?.toISOString() || '',
                      })
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Box>
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Search Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleClearFilters} color="inherit">
              Clear All Filters
            </Button>
            <Button onClick={handleSearch} variant="contained">
              Apply Filters
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Search Tips */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Search Tips:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Use quotes for exact phrases: "performance review"
          <br />
          • Search by participant names, message content, or thread titles
          <br />
          • Combine filters to narrow down results
          <br />
          • Date filters help find conversations from specific time periods
        </Typography>
      </Paper>
    </Box>
  )
}