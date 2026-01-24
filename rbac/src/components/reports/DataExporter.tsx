import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Download, Database, Filter } from 'lucide-react';

interface DataExporterProps {
  onExportData: (exportConfig: ExportConfig) => void;
  isLoading?: boolean;
}

export interface ExportConfig {
  type: 'transactions' | 'complete';
  format: 'excel' | 'csv' | 'json';
  startDate?: string;
  endDate?: string;
  categoryIds?: number[];
  transactionTypes?: string[];
  goalTypes?: string[];
  includeGoals: boolean;
  includeCategories: boolean;
}

const DataExporter: React.FC<DataExporterProps> = ({ onExportData, isLoading = false }) => {
  const [exportType, setExportType] = useState<string>('transactions');
  const [format, setFormat] = useState<string>('excel');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeGoals, setIncludeGoals] = useState<boolean>(true);
  const [includeCategories, setIncludeCategories] = useState<boolean>(true);
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
  const [selectedGoalTypes, setSelectedGoalTypes] = useState<string[]>([]);

  const transactionTypes = [
    { value: 'Income', label: 'Income' },
    { value: 'Expense', label: 'Expense' }
  ];

  const goalTypes = [
    { value: 'Savings', label: 'Savings' },
    { value: 'Investment', label: 'Investment' },
    { value: 'DebtRepayment', label: 'Debt Repayment' }
  ];

  const handleExportData = () => {
    const config: ExportConfig = {
      type: exportType as ExportConfig['type'],
      format: format as ExportConfig['format'],
      includeGoals,
      includeCategories
    };

    if (startDate) config.startDate = startDate;
    if (endDate) config.endDate = endDate;
    if (selectedTransactionTypes.length > 0) config.transactionTypes = selectedTransactionTypes;
    if (selectedGoalTypes.length > 0) config.goalTypes = selectedGoalTypes;

    onExportData(config);
  };

  const handleTransactionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactionTypes([...selectedTransactionTypes, type]);
    } else {
      setSelectedTransactionTypes(selectedTransactionTypes.filter(t => t !== type));
    }
  };

  const handleGoalTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedGoalTypes([...selectedGoalTypes, type]);
    } else {
      setSelectedGoalTypes(selectedGoalTypes.filter(t => t !== type));
    }
  };

  const getExportDescription = () => {
    switch (exportType) {
      case 'transactions':
        return 'Export transaction data with optional filtering by date range, categories, and transaction types';
      case 'complete':
        return 'Export all financial data including transactions, goals, and summary information';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Export Financial Data
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="exportType" className="text-sm font-medium text-gray-700">Export Type</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                <SelectValue placeholder="Select export type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactions">Transactions Only</SelectItem>
                <SelectItem value="complete">Complete Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format" className="text-sm font-medium text-gray-700">File Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">{getExportDescription()}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Filter className="h-4 w-4 text-blue-600" />
            <Label className="text-sm font-semibold text-gray-900">Filters (Optional)</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm text-gray-700">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm text-gray-700">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Label className="text-sm font-semibold text-gray-900">Transaction Types</Label>
            <div className="flex gap-6">
              {transactionTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`transaction-${type.value}`}
                    checked={selectedTransactionTypes.includes(type.value)}
                    onCheckedChange={(checked) => 
                      handleTransactionTypeChange(type.value, checked as boolean)
                    }
                    className="border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                  <Label 
                    htmlFor={`transaction-${type.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {(exportType === 'complete' || includeGoals) && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Goal Types</Label>
              <div className="flex gap-4 flex-wrap">
                {goalTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${type.value}`}
                      checked={selectedGoalTypes.includes(type.value)}
                      onCheckedChange={(checked) => 
                        handleGoalTypeChange(type.value, checked as boolean)
                      }
                      className="border-blue-600 data-[state=checked]:bg-blue-600"
                    />
                    <Label 
                      htmlFor={`goal-${type.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {exportType === 'transactions' && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Include Additional Data</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeGoals"
                    checked={includeGoals}
                    onCheckedChange={(checked) => setIncludeGoals(checked as boolean)}
                    className="border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="includeGoals" className="text-sm font-normal cursor-pointer">
                    Include Goals
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCategories"
                    checked={includeCategories}
                    onCheckedChange={(checked) => setIncludeCategories(checked as boolean)}
                    className="border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="includeCategories" className="text-sm font-normal cursor-pointer">
                    Include Category Details
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button
            onClick={handleExportData}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Exporting Data...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export & Download
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-semibold mb-2 text-gray-900">Export Information:</p>
          <ul className="space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Excel format includes formatted sheets with charts and summaries</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>CSV format provides raw data suitable for analysis tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>JSON format includes complete data structure with metadata</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>All exports maintain data integrity and include NPR currency formatting</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExporter;