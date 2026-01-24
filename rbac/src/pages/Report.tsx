import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ReportGenerator, { type ReportConfig } from '../components/reports/ReportGeneraor';
import DataExporter, { type ExportConfig } from '../components/reports/DataExporter';
import ReportViewer from '../components/reports/ReportViewer';
import { FileText, Download, BarChart3, AlertCircle, Calendar, TrendingUp, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import {api}  from '../services/api';
import {toast} from "sonner";
const Reports: React.FC = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportType, setReportType] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateReport = async (config: ReportConfig) => {
    setIsGeneratingReport(true);
    setError('');
    
    try {
      let response;
      
      switch (config.type) {
        case 'monthly':
          response = await api.get('/reports/monthly', {
            params: {
              startDate: config.startDate,
              endDate: config.endDate
            }
          });
          break;
          
        case 'yearly':
          response = await api.get('/reports/yearly', {
            params: { year: config.year }
          });
          break;
          
        case 'comparative':
          response = await api.get('/reports/comparative', {
            params: {
              period1Start: config.period1Start,
              period1End: config.period1End,
              period2Start: config.period2Start,
              period2End: config.period2End
            }
          });
          break;
          
        case 'investment':
          response = await api.get('/reports/investment-performance', {
            params: {
              startDate: config.startDate,
              endDate: config.endDate
            }
          });
          break;
          
        default:
          throw new Error('Unsupported report type');
      }

      if (config.format === 'json') {
        setReportData(response.data);
        setReportType(config.type);
      } else {
        const pdfResponse = await api.post('/reports/generate-pdf', {
          type: config.type,
          startDate: config.startDate || new Date().toISOString(),
          endDate: config.endDate || new Date().toISOString(),
          format: config.format
        }, {
          responseType: 'blob'
        });

        const blob = new Blob([pdfResponse.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${config.type}_report_${new Date().toISOString().split('T')[0]}.${config.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportData = async (config: ExportConfig) => {
    setIsExportingData(true);
    setError('');
    
    try {
      const endpoint = config.type === 'complete' ? '/reports/export/complete' : '/reports/export/transactions';
      
      const response = await api.post(endpoint, config, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `financial_export_${new Date().toISOString().split('T')[0]}.${config.format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting data:', err);
      setError(err.response?.data?.message || 'Failed to export data. Please try again.');
    } finally {
      setIsExportingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div 
          className={`mb-8 transition-all duration-700 ${
            isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
          </div>
          <p className="text-gray-600 ml-14">
            Generate comprehensive financial reports and export your data for analysis
          </p>
        </div>

        {error && (
         toast.error(error)
        )}

        <div className={`transition-all duration-700 delay-200 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200 p-1">
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              Generate Reports
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger 
              value="view" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
            >
              <FileText className="h-4 w-4" />
              View Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <div 
              className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-300 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <ReportGenerator 
                onGenerateReport={handleGenerateReport}
                isLoading={isGeneratingReport}
              />
              
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Report Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    {[
                      { icon: Calendar, title: 'Monthly Reports', desc: 'Detailed breakdown of income, expenses, and goal progress for any date range', color: 'bg-blue-100 text-blue-600' },
                      { icon: BarChart3, title: 'Yearly Summaries', desc: 'Complete year overview with monthly breakdown and goal achievements', color: 'bg-blue-100 text-blue-600' },
                      { icon: TrendingUp, title: 'Comparative Analysis', desc: 'Side-by-side comparison of two time periods with trend analysis', color: 'bg-blue-100 text-blue-600' },
                      { icon: Target, title: 'Investment Performance', desc: 'Portfolio tracking and investment goal performance analysis', color: 'bg-blue-100 text-blue-600' }
                    ].map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-500 ${
                          isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                        }`}
                        style={{ transitionDelay: `${400 + idx * 100}ms` }}
                      >
                        <div className={`p-2 rounded-lg ${feature.color}`}>
                          <feature.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3 text-gray-900">Export Formats</h4>
                    <div className="flex gap-2 flex-wrap">
                      {['JSON', 'Excel', 'CSV', 'PDF'].map((fmt) => (
                        <span key={fmt} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div 
              className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-300 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <DataExporter 
                onExportData={handleExportData}
                isLoading={isExportingData}
              />
              
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Export Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    {[
                      { title: 'Transactions Export', desc: 'Export transaction data with optional filtering by date, category, and type' },
                      { title: 'Complete Data Export', desc: 'Export all financial data including transactions, goals, and summaries' }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg hover:bg-blue-50 transition-all duration-500 ${
                          isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                        }`}
                        style={{ transitionDelay: `${400 + idx * 100}ms` }}
                      >
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className={`pt-4 border-t transition-all duration-500 delay-500 ${
                    isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}>
                    <h4 className="font-semibold mb-3 text-gray-900">Data Integrity</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {['All exports maintain NPR currency formatting', 'Complete transaction history with categories', 'Goal progress and milestone tracking', 'Secure data handling and privacy protection'].map((item, idx) => (
                        <li 
                          key={idx} 
                          className={`flex items-center gap-2 transition-all duration-500 ${
                            isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                          }`}
                          style={{ transitionDelay: `${600 + idx * 50}ms` }}
                        >
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`pt-4 border-t transition-all duration-500 delay-700 ${
                    isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}>
                    <h4 className="font-semibold mb-3 text-gray-900">File Formats</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { format: 'Excel (.xlsx)', desc: 'Formatted sheets with charts' },
                        { format: 'CSV', desc: 'Raw data for analysis' },
                        { format: 'JSON', desc: 'Structured data with metadata' }
                      ].map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`flex justify-between p-2 rounded hover:bg-blue-50 transition-all duration-500 ${
                            isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                          }`}
                          style={{ transitionDelay: `${800 + idx * 50}ms` }}
                        >
                          <span className="font-medium text-gray-900">{item.format}</span>
                          <span className="text-gray-500">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            <div 
              className={`transition-all duration-700 delay-300 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {reportData ? (
                <ReportViewer reportData={reportData} reportType={reportType} />
              ) : (
                <Card className="border-gray-200 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="animate-bounce mb-4">
                      <FileText className="h-20 w-20 text-blue-200 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Generated</h3>
                    <p className="text-gray-600 mb-4">
                      Generate a report from the "Generate Reports" tab to view it here
                    </p>
                    <p className="text-sm text-gray-500">
                      Reports generated in JSON format will be displayed here for interactive viewing
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default Reports;