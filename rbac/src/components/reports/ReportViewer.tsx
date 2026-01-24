import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from './../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock
} from 'lucide-react';

interface ReportViewerProps {
  reportData: any;
  reportType: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportData, reportType }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [reportData]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'increasing':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderMonthlyReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Income', value: reportData.totalIncome, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'Total Expenses', value: reportData.totalExpenses, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
            { label: 'Net Amount', value: reportData.netAmount, icon: DollarSign, color: reportData.netAmount >= 0 ? 'text-blue-600' : 'text-red-600', bg: reportData.netAmount >= 0 ? 'bg-blue-50' : 'bg-red-50', border: reportData.netAmount >= 0 ? 'border-blue-200' : 'border-red-200' }
          ].map((stat, idx) => (
            <Card 
              key={idx} 
              className={`border ${stat.border} ${stat.bg} shadow-lg hover:shadow-xl transition-all duration-500 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {formatCurrency(stat.value)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg} border ${stat.border}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 delay-300 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Transaction Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.transactionCount}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Average Transaction</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.averageTransactionAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {reportData.expensesByCategory && reportData.expensesByCategory.length > 0 && (
          <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 delay-400 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Expenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {reportData.expensesByCategory.map((category: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-500 ${
                      isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${500 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: category.categoryColor || '#6B7280' }}
                      />
                      <span className="font-semibold text-gray-900">{category.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(category.totalAmount)}</p>
                      <p className="text-sm text-gray-500">{category.transactionCount} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {reportData.goalProgress && reportData.goalProgress.length > 0 && (
          <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 delay-500 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reportData.goalProgress.map((goal: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-5 border border-gray-200 rounded-lg bg-white hover:shadow-md hover:border-blue-300 transition-all duration-500 ${
                      isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                      <Badge className={goal.status === 'Active' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700'}>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress: {formatPercentage(goal.progressPercentage)}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {goal.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {goal.daysRemaining} days remaining
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderYearlyReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {reportData.year} Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(reportData.totalIncome)}</p>
                <p className="text-xs text-gray-500">Avg: {formatCurrency(reportData.averageMonthlyIncome)}/month</p>
              </div>
              <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mb-2">{formatCurrency(reportData.totalExpenses)}</p>
                <p className="text-xs text-gray-500">Avg: {formatCurrency(reportData.averageMonthlyExpenses)}/month</p>
              </div>
              <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Net Amount</p>
                <p className={`text-3xl font-bold mb-2 ${reportData.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.netAmount)}
                </p>
                <p className="text-xs text-gray-500">{reportData.totalTransactions} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {reportData.monthlyBreakdown && reportData.monthlyBreakdown.length > 0 && (
          <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 delay-300 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {reportData.monthlyBreakdown.map((month: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-500 ${
                      isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${400 + index * 50}ms` }}
                  >
                    <div className="font-semibold text-gray-900">{month.monthName}</div>
                    <div className="flex gap-6 text-sm">
                      <span className="text-green-600 font-medium">+{formatCurrency(month.income)}</span>
                      <span className="text-red-600 font-medium">-{formatCurrency(month.expenses)}</span>
                      <span className={`font-bold ${month.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(month.netAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {reportData.goalAchievements && reportData.goalAchievements.length > 0 && (
          <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 delay-500 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Goal Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {reportData.goalAchievements.map((goal: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-all duration-500 ${
                      isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${600 + index * 50}ms` }}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{goal.name}</p>
                      <p className="text-sm text-gray-600">{goal.type} • {goal.daysToComplete} days to complete</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(goal.targetAmount)}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderComparativeAnalysis = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle>Comparative Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Income', data: reportData.incomeComparison },
                { title: 'Expenses', data: reportData.expenseComparison },
                { title: 'Net Amount', data: reportData.netAmountComparison }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 border border-gray-200 rounded-lg bg-white hover:shadow-md hover:border-blue-300 transition-all duration-500 ${
                    isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${200 + idx * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    {item.data && getTrendIcon(item.data.trend)}
                  </div>
                  {item.data && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Period 1: {formatCurrency(item.data.period1Amount || 0)}</p>
                      <p className="text-sm text-gray-600">Period 2: {formatCurrency(item.data.period2Amount || 0)}</p>
                      <p className={`text-sm font-semibold ${getTrendColor(item.data.trend)}`}>
                        Change: {formatPercentage(item.data.percentageChange || 0)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {reportData.categoryComparisons && reportData.categoryComparisons.length > 0 && (
          <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 delay-500 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Category Comparisons</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {reportData.categoryComparisons.map((category: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-500 ${
                      isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${600 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{category.categoryName}</span>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">{category.type}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-700">{formatCurrency(category.comparison?.period1Amount || 0)} → {formatCurrency(category.comparison?.period2Amount || 0)}</p>
                        <p className={`font-semibold ${getTrendColor(category.comparison?.trend)}`}>
                          {formatPercentage(category.comparison?.percentageChange || 0)}
                        </p>
                      </div>
                      {getTrendIcon(category.comparison?.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderInvestmentPerformance = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Investment Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(reportData.totalInvestmentAmount)}</p>
              </div>
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Portfolio Value</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(reportData.currentPortfolioValue)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Goals</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.activeInvestmentGoals}</p>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed Goals</p>
                <p className="text-2xl font-bold text-green-600">{reportData.completedInvestmentGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {reportData.investmentGoals && reportData.investmentGoals.length > 0 && (
          <Card className={`border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 delay-400 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Investment Goals</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reportData.investmentGoals.map((goal: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-5 border border-gray-200 rounded-lg bg-white hover:shadow-md hover:border-blue-300 transition-all duration-500 ${
                      isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${500 + index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                      <Badge className={goal.status === 'Active' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700'}>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress: {formatPercentage(goal.progressPercentage)}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderReport = () => {
    switch (reportType) {
      case 'monthly':
        return renderMonthlyReport();
      case 'yearly':
        return renderYearlyReport();
      case 'comparative':
        return renderComparativeAnalysis();
      case 'investment':
        return renderInvestmentPerformance();
      default:
        return <div className="text-center text-gray-500">Unsupported report type</div>;
    }
  };

  if (!reportData) {
    return (
      <Card className="border-gray-200 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No report data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {renderReport()}
    </div>
  );
};

export default ReportViewer;