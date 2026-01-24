import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Download, FileText, BarChart3, Sparkles } from 'lucide-react';

interface ReportGeneratorProps {
  onGenerateReport: (reportConfig: ReportConfig) => void;
  isLoading?: boolean;
}

export interface ReportConfig {
  type: 'monthly' | 'yearly' | 'comparative' | 'investment';
  format: 'json' | 'excel' | 'csv' | 'pdf';
  startDate?: string;
  endDate?: string;
  year?: number;
  period1Start?: string;
  period1End?: string;
  period2Start?: string;
  period2End?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onGenerateReport, isLoading = false }) => {
  const [reportType, setReportType] = useState<string>('monthly');
  const [format, setFormat] = useState<string>('json');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [period1Start, setPeriod1Start] = useState<string>('');
  const [period1End, setPeriod1End] = useState<string>('');
  const [period2Start, setPeriod2Start] = useState<string>('');
  const [period2End, setPeriod2End] = useState<string>('');

  const handleGenerateReport = () => {
    const config: ReportConfig = {
      type: reportType as ReportConfig['type'],
      format: format as ReportConfig['format']
    };

    switch (reportType) {
      case 'monthly':
        config.startDate = startDate;
        config.endDate = endDate;
        break;
      case 'yearly':
        config.year = year;
        break;
      case 'comparative':
        config.period1Start = period1Start;
        config.period1End = period1End;
        config.period2Start = period2Start;
        config.period2End = period2End;
        break;
      case 'investment':
        config.startDate = startDate;
        config.endDate = endDate;
        break;
    }

    onGenerateReport(config);
  };

  const isFormValid = () => {
    switch (reportType) {
      case 'monthly':
        return startDate && endDate;
      case 'yearly':
        return year > 0;
      case 'comparative':
        return period1Start && period1End && period2Start && period2End;
      case 'investment':
        return startDate && endDate;
      default:
        return false;
    }
  };

  const getReportTypeLabel = (type: string) => {
  switch (type) {
    case 'monthly': return 'Monthly Report';
    case 'yearly': return 'Yearly Report';
    case 'comparative': return 'Comparative Analysis';
    case 'investment': return 'Investment Performance';
    default: return 'Select report type';
  }
};

  const renderDateInputs = () => {
    switch (reportType) {
      case 'monthly':
      case 'investment':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        );

      case 'yearly':
        return (
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium text-gray-700">Year</Label>
            <Input
              id="year"
              type="number"
              min="2020"
              max={new Date().getFullYear()}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        );

      case 'comparative':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-semibold text-blue-900 mb-3 block">Period 1</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Start Date</Label>
                  <Input
                    type="date"
                    value={period1Start}
                    onChange={(e) => setPeriod1Start(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">End Date</Label>
                  <Input
                    type="date"
                    value={period1End}
                    onChange={(e) => setPeriod1End(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-semibold text-blue-900 mb-3 block">Period 2</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Start Date</Label>
                  <Input
                    type="date"
                    value={period2Start}
                    onChange={(e) => setPeriod2Start(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">End Date</Label>
                  <Input
                    type="date"
                    value={period2End}
                    onChange={(e) => setPeriod2End(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getReportIcon = () => {
    switch (reportType) {
      case 'monthly':
        return <Calendar className="h-4 w-4" />;
      case 'yearly':
        return <BarChart3 className="h-4 w-4" />;
      case 'comparative':
        return <FileText className="h-4 w-4" />;
      case 'investment':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case 'monthly':
        return 'Detailed breakdown for a specific date range with category analysis';
      case 'yearly':
        return 'Complete year summary with monthly breakdown and trends';
      case 'comparative':
        return 'Side-by-side comparison of two time periods with variance analysis';
      case 'investment':
        return 'Portfolio performance tracking and investment goal analysis';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Generate Financial Report
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportType" className="text-sm font-medium text-gray-700">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                <SelectValue placeholder={getReportTypeLabel(reportType)} />
              </SelectTrigger>  
              <SelectContent>
                <SelectItem value="monthly">Monthly Report</SelectItem>
                <SelectItem value="yearly">Yearly Report</SelectItem>
                <SelectItem value="comparative">Comparative Analysis</SelectItem>
                <SelectItem value="investment">Investment Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format" className="text-sm font-medium text-gray-700">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                <SelectValue placeholder={(format)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            {getReportIcon()}
            <p className="text-sm text-blue-900">
              <strong className="font-semibold">{reportType.charAt(0).toUpperCase() + reportType.slice(1)}:</strong> {getReportDescription()}
            </p>
          </div>
        </div>

        {renderDateInputs()}

        <div className="pt-4">
          <Button
            onClick={handleGenerateReport}
            disabled={!isFormValid() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download Report
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-semibold mb-2 text-gray-900">Report Information:</p>
          <ul className="space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>All reports include comprehensive financial data and analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>JSON format allows interactive viewing in the browser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Other formats are automatically downloaded</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;