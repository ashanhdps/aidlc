import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { DataSeries, DataPoint } from '../types/domain'

export interface ExportOptions {
  filename?: string
  includeMetadata?: boolean
  dateRange?: { start: string; end: string }
  format?: 'csv' | 'excel' | 'pdf' | 'json'
}

export interface ExportData {
  title: string
  data: any[]
  columns?: string[]
  metadata?: Record<string, any>
}

export class ExportGenerationService {
  /**
   * Export data to CSV format
   */
  async exportToCSV(exportData: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      const { title, data, columns } = exportData
      const filename = options.filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`

      // Generate CSV content
      let csvContent = ''

      // Add metadata if requested
      if (options.includeMetadata && exportData.metadata) {
        csvContent += '# Metadata\n'
        Object.entries(exportData.metadata).forEach(([key, value]) => {
          csvContent += `# ${key}: ${value}\n`
        })
        csvContent += '\n'
      }

      // Add headers
      if (columns && columns.length > 0) {
        csvContent += columns.join(',') + '\n'
      } else if (data.length > 0) {
        csvContent += Object.keys(data[0]).join(',') + '\n'
      }

      // Add data rows
      data.forEach(row => {
        const values = columns 
          ? columns.map(col => this.escapeCsvValue(row[col]))
          : Object.values(row).map(val => this.escapeCsvValue(val))
        csvContent += values.join(',') + '\n'
      })

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, filename)
    } catch (error) {
      console.error('Failed to export CSV:', error)
      throw new Error('CSV export failed')
    }
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(exportData: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      const { title, data, columns } = exportData
      const filename = options.filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`

      // Create workbook
      const workbook = XLSX.utils.book_new()

      // Create main data worksheet
      const worksheet = XLSX.utils.json_to_sheet(data, {
        header: columns || undefined,
      })

      // Add title row
      XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' })
      
      // Style the title row
      if (worksheet['A1']) {
        worksheet['A1'].s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: 'center' },
        }
      }

      // Adjust column widths
      const columnWidths = this.calculateColumnWidths(data, columns)
      worksheet['!cols'] = columnWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

      // Add metadata sheet if requested
      if (options.includeMetadata && exportData.metadata) {
        const metadataSheet = XLSX.utils.json_to_sheet(
          Object.entries(exportData.metadata).map(([key, value]) => ({
            Property: key,
            Value: value,
          }))
        )
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata')
      }

      // Generate and download file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      saveAs(blob, filename)
    } catch (error) {
      console.error('Failed to export Excel:', error)
      throw new Error('Excel export failed')
    }
  }

  /**
   * Export data to PDF format
   */
  async exportToPDF(exportData: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      const { title, data, columns } = exportData
      const filename = options.filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

      // Create PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 20, 20)

      // Add metadata if requested
      let yPosition = 40
      if (options.includeMetadata && exportData.metadata) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Metadata:', 20, yPosition)
        yPosition += 10

        Object.entries(exportData.metadata).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 25, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Prepare table data
      const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : [])
      const tableRows = data.map(row => 
        tableColumns.map(col => this.formatCellValue(row[col]))
      )

      // Add table
      ;(doc as any).autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: yPosition,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
      })

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
          20,
          doc.internal.pageSize.height - 10
        )
      }

      // Save PDF
      doc.save(filename)
    } catch (error) {
      console.error('Failed to export PDF:', error)
      throw new Error('PDF export failed')
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(exportData: ExportData, options: ExportOptions = {}): Promise<void> {
    try {
      const { title } = exportData
      const filename = options.filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`

      const jsonData = {
        title: exportData.title,
        exportedAt: new Date().toISOString(),
        ...(options.includeMetadata && exportData.metadata && { metadata: exportData.metadata }),
        data: exportData.data,
      }

      const jsonString = JSON.stringify(jsonData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      saveAs(blob, filename)
    } catch (error) {
      console.error('Failed to export JSON:', error)
      throw new Error('JSON export failed')
    }
  }

  /**
   * Export chart data with multiple series
   */
  async exportChartData(
    chartTitle: string,
    series: DataSeries[],
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      // Transform chart data to tabular format
      const allDataPoints: Record<string, any>[] = []
      const xValues = new Set<string | number>()

      // Collect all unique x values
      series.forEach(s => {
        s.data.forEach(point => xValues.add(point.x))
      })

      const sortedXValues = Array.from(xValues).sort()

      // Create rows with x value and all series values
      sortedXValues.forEach(xValue => {
        const row: Record<string, any> = { x: xValue }
        
        series.forEach(s => {
          const dataPoint = s.data.find(point => point.x === xValue)
          row[s.name] = dataPoint ? dataPoint.y : null
        })
        
        allDataPoints.push(row)
      })

      const exportData: ExportData = {
        title: chartTitle,
        data: allDataPoints,
        columns: ['x', ...series.map(s => s.name)],
        metadata: {
          seriesCount: series.length,
          dataPointsCount: allDataPoints.length,
          exportType: 'chart',
        },
      }

      // Export based on format
      switch (options.format) {
        case 'excel':
          await this.exportToExcel(exportData, options)
          break
        case 'pdf':
          await this.exportToPDF(exportData, options)
          break
        case 'json':
          await this.exportToJSON(exportData, options)
          break
        default:
          await this.exportToCSV(exportData, options)
      }
    } catch (error) {
      console.error('Failed to export chart data:', error)
      throw new Error('Chart data export failed')
    }
  }

  /**
   * Export dashboard data
   */
  async exportDashboardData(
    dashboardTitle: string,
    widgets: Array<{ title: string; data: any[]; type: string }>,
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      if (options.format === 'excel') {
        // Multi-sheet Excel export
        const workbook = XLSX.utils.book_new()

        // Add summary sheet
        const summaryData = widgets.map(widget => ({
          Widget: widget.title,
          Type: widget.type,
          'Data Points': widget.data.length,
        }))

        const summarySheet = XLSX.utils.json_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

        // Add sheet for each widget
        widgets.forEach((widget, index) => {
          if (widget.data.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(widget.data)
            const sheetName = widget.title.substring(0, 31) // Excel sheet name limit
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
          }
        })

        // Generate filename and save
        const filename = options.filename || `${dashboardTitle.replace(/\s+/g, '_')}_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        saveAs(blob, filename)
      } else {
        // Single file export with all widget data
        const allData = widgets.flatMap(widget => 
          widget.data.map(item => ({
            widget: widget.title,
            type: widget.type,
            ...item,
          }))
        )

        const exportData: ExportData = {
          title: dashboardTitle,
          data: allData,
          metadata: {
            widgetCount: widgets.length,
            totalDataPoints: allData.length,
            exportType: 'dashboard',
          },
        }

        switch (options.format) {
          case 'pdf':
            await this.exportToPDF(exportData, options)
            break
          case 'json':
            await this.exportToJSON(exportData, options)
            break
          default:
            await this.exportToCSV(exportData, options)
        }
      }
    } catch (error) {
      console.error('Failed to export dashboard data:', error)
      throw new Error('Dashboard export failed')
    }
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'csv',
        label: 'CSV',
        description: 'Comma-separated values, compatible with Excel and other tools',
      },
      {
        value: 'excel',
        label: 'Excel',
        description: 'Microsoft Excel format with multiple sheets and formatting',
      },
      {
        value: 'pdf',
        label: 'PDF',
        description: 'Portable Document Format for sharing and printing',
      },
      {
        value: 'json',
        label: 'JSON',
        description: 'JavaScript Object Notation for programmatic use',
      },
    ]
  }

  /**
   * Private helper methods
   */
  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value)
    
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    
    return stringValue
  }

  private formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return ''
    }

    if (typeof value === 'number') {
      return value.toLocaleString()
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    return String(value)
  }

  private calculateColumnWidths(data: any[], columns?: string[]): Array<{ width: number }> {
    const cols = columns || (data.length > 0 ? Object.keys(data[0]) : [])
    
    return cols.map(col => {
      const maxLength = Math.max(
        col.length,
        ...data.map(row => String(row[col] || '').length)
      )
      return { width: Math.min(Math.max(maxLength + 2, 10), 50) }
    })
  }
}