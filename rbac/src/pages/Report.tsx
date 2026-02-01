import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Download, CheckCircle2, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { transactionService, type Transaction } from '../services/transactionService';

interface ExportConfig {
  type: 'transactions' | 'comparative' | 'yearly';
  format: 'csv' | 'pdf';
  startDate: string;
  endDate: string;
  period2StartDate?: string;
  period2EndDate?: string;
}

interface CategoryMap {
  [key: number]: string;
}

interface TransactionTypeMap {
  [key: number]: string;
}

const DataExporter = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>('');
  const [userId] = useState(1);

  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    type: 'transactions',
    format: 'csv',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period2StartDate: '',
    period2EndDate: '',
  });

  const categoryMap: CategoryMap = {
    1: 'Groceries',
    2: 'Salary',
    3: 'Transportation',
    4: 'Entertainment',
    5: 'Utilities',
    6: 'Freelance',
    7: 'Healthcare',
    8: 'Shopping',
    9: 'Education',
    10: 'Other',
  };

  const transactionTypeMap: TransactionTypeMap = {
    1: 'income',
    2: 'expense',
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await transactionService.getAllTransactions(userId);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactionsByDate = (transactions: Transaction[], startDate: string, endDate: string) => {
    return transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  };

  const calculateSummary = (transactions: Transaction[]) => {
    const transactionOfTheYear = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getFullYear() === new Date().getFullYear();
    });
    const income = transactions
      .filter(t => transactionTypeMap[t.transactionTypeId] === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => transactionTypeMap[t.transactionTypeId] === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown: { [key: string]: number } = {};
    transactions.forEach(t => {
      const category = categoryMap[t.categoryId] || 'Unknown';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + t.amount;
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      categoryBreakdown,
      transactionOfTheYear,
      transactionCount: transactions.length,
    };
  };

  const exportTransactionsToCSV = (data: Transaction[], filename: string) => {
    const headers = ['Date', 'Name', 'Category', 'Type', 'Amount (NPR)', 'Description'];
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        `${row.transactionDate},${row.name},${categoryMap[row.categoryId] || 'Unknown'},${transactionTypeMap[row.transactionTypeId] || 'Unknown'},${row.amount},"${row.description}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const exportYearlyDataToCSV = (data: Transaction[], filename: string) => {
    const summary = calculateSummary(data);
    const sections = [
      '=== YEARLY SUMMARY ===',
      `Date Range,${exportConfig.startDate} to ${exportConfig.endDate}`,
      `Total Income,${summary.totalIncome}`,
      `Total Expenses,${summary.totalExpenses}`,
      `Net Balance,${summary.netBalance}`,
      `Transaction Count,${summary.transactionCount}`,
      '',
      '=== CATEGORY BREAKDOWN ===',
      ...Object.entries(summary.categoryBreakdown).map(([category, amount]) => `${category},${amount}`),
      '',
      '=== TRANSACTIONS ===',
      'Date,Name,Category,Type,Amount (NPR),Description',
      ...data.map((t: Transaction) =>
        `${t.transactionDate},${t.name},${categoryMap[t.categoryId]},${transactionTypeMap[t.transactionTypeId]},${t.amount},"${t.description}"`
      ),
    ];

    const csvContent = sections.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportComparativeToCSV = (period1: Transaction[], period2: Transaction[], filename: string) => {
    const summary1 = calculateSummary(period1);
    const summary2 = calculateSummary(period2);

    const sections = [
      '=== COMPARATIVE ANALYSIS ===',
      '',
      '=== PERIOD 1 SUMMARY ===',
      `Date Range,${exportConfig.startDate} to ${exportConfig.endDate}`,
      `Total Income,${summary1.totalIncome}`,
      `Total Expenses,${summary1.totalExpenses}`,
      `Net Balance,${summary1.netBalance}`,
      `Transaction Count,${summary1.transactionCount}`,
      '',
      '=== PERIOD 2 SUMMARY ===',
      `Date Range,${exportConfig.period2StartDate} to ${exportConfig.period2EndDate}`,
      `Total Income,${summary2.totalIncome}`,
      `Total Expenses,${summary2.totalExpenses}`,
      `Net Balance,${summary2.netBalance}`,
      `Transaction Count,${summary2.transactionCount}`,
      '',
      '=== COMPARISON ===',
      `Income Change,${summary2.totalIncome - summary1.totalIncome},${((summary2.totalIncome - summary1.totalIncome) / summary1.totalIncome * 100).toFixed(2)}%`,
      `Expense Change,${summary2.totalExpenses - summary1.totalExpenses},${((summary2.totalExpenses - summary1.totalExpenses) / summary1.totalExpenses * 100).toFixed(2)}%`,
      `Net Balance Change,${summary2.netBalance - summary1.netBalance},${summary1.netBalance !== 0 ? ((summary2.netBalance - summary1.netBalance) / summary1.netBalance * 100).toFixed(2) : 'N/A'}%`,
      '',
      '=== PERIOD 1 TRANSACTIONS ===',
      'Date,Name,Category,Type,Amount (NPR),Description',
      ...period1.map((t: Transaction) =>
        `${t.transactionDate},${t.name},${categoryMap[t.categoryId]},${transactionTypeMap[t.transactionTypeId]},${t.amount},"${t.description}"`
      ),
      '',
      '=== PERIOD 2 TRANSACTIONS ===',
      'Date,Name,Category,Type,Amount (NPR),Description',
      ...period2.map((t: Transaction) =>
        `${t.transactionDate},${t.name},${categoryMap[t.categoryId]},${transactionTypeMap[t.transactionTypeId]},${t.amount},"${t.description}"`
      ),
    ];

    const csvContent = sections.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportYearlyTransactionsToPDF = (data: Transaction[], filename: string) => {
    const summary = calculateSummary(data);
    const htmlContent = `
      <!DOCTYPE html> 
      <html>

        <head>  
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { color: #2563eb; margin-bottom: 20px; }
            .date-range { color: #666; margin-bottom: 30px; }
            .summary-box {
              background-color: #eff6ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            } 
            .summary-box h2 { color: #1e40af; margin-bottom: 15px; }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            .summary-item p:first-child { color: #666; font-size: 14px; margin: 0; }
            .summary-item p:last-child { font-size: 24px; font-weight: bold; margin: 5px 0 0 0; }
            .income { color: #16a34a; }
            .expense { color: #dc2626; }
            .balance { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            thead tr { background-color: #2563eb; color: white; }
            th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
            th { font-weight: 600; }
            tbody tr:nth-child(even) { background-color: #f9fafb; }
            .amount { text-align: right; font-weight: bold; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Yearly Transaction Report</h1>
          <p class="date-range">Period: ${exportConfig.startDate} to ${exportConfig.endDate}</p>
          <div class="summary-box">
            <h2>Financial Summary</h2>
            <div class="summary-grid">

              <div class="summary-item">
                <p>Total Income</p>
                <p class="income">NPR ${summary.totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Total Expenses</p>
                <p class="expense">NPR ${summary.totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Net Balance</p>
                <p class="balance">NPR ${summary.netBalance.toLocaleString()}</p> 
              </div>
            </div>
          </div>
          <h2 style="color: #1e40af; margin-bottom: 15px;">Transactions (${data.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th> 
                <th>Name</th> 
                <th>Category</th> 
                <th>Type</th> 
                <th class="amount">Amount (NPR)</th>  
              </tr> 
            </thead>  
            <tbody>

              ${data.map((t) => `
                <tr>  
                  <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
                  <td>${t.name}</td>  
                  <td>${categoryMap[t.categoryId] || 'Unknown'}</td>  
                  <td>  
                    <span style="color: ${transactionTypeMap[t.transactionTypeId] === 'income' ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                      ${(transactionTypeMap[t.transactionTypeId] || 'Unknown').toUpperCase()}
                    </span> 
                  </td> 
                  <td class="amount">${t.amount.toLocaleString()}</td> 
                </tr>
              `).join('')}  
            </tbody>  
          </table>  
        </body> 
      </html> 
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };


  const exportTransactionsToPDF = (data: Transaction[], filename: string) => {
    const summary = calculateSummary(data);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { color: #2563eb; margin-bottom: 20px; }
            .date-range { color: #666; margin-bottom: 30px; }
            .summary-box {
              background-color: #eff6ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .summary-box h2 { color: #1e40af; margin-bottom: 15px; }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            .summary-item p:first-child { color: #666; font-size: 14px; margin: 0; }
            .summary-item p:last-child { font-size: 24px; font-weight: bold; margin: 5px 0 0 0; }
            .income { color: #16a34a; }
            .expense { color: #dc2626; }
            .balance { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            thead tr { background-color: #2563eb; color: white; }
            th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
            th { font-weight: 600; }
            tbody tr:nth-child(even) { background-color: #f9fafb; }
            .amount { text-align: right; font-weight: bold; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Transaction Report</h1>
          <p class="date-range">Period: ${new Date(exportConfig.startDate).toLocaleDateString()} to ${new Date(exportConfig.endDate).toLocaleDateString()}</p>
          
          <div class="summary-box">
            <h2>Financial Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <p>Total Income</p>
                <p class="income">NPR ${summary.totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Total Expenses</p>
                <p class="expense">NPR ${summary.totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Net Balance</p>
                <p class="balance">NPR ${summary.netBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <h2 style="color: #1e40af; margin-bottom: 15px;">Transactions (${data.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th class="amount">Amount (NPR)</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((t) => `
                <tr>
                  <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
                  <td>${t.name}</td>
                  <td>${categoryMap[t.categoryId] || 'Unknown'}</td>
                  <td>
                    <span style="color: ${transactionTypeMap[t.transactionTypeId] === 'income' ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                      ${(transactionTypeMap[t.transactionTypeId] || 'Unknown').toUpperCase()}
                    </span>
                  </td>
                  <td class="amount">${t.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const exportComparativeToPDF = (period1: Transaction[], period2: Transaction[], filename: string) => {
    const summary1 = calculateSummary(period1);
    const summary2 = calculateSummary(period2);

    const incomeChange = summary2.totalIncome - summary1.totalIncome;
    const expenseChange = summary2.totalExpenses - summary1.totalExpenses;
    const balanceChange = summary2.netBalance - summary1.netBalance;

    const incomeChangePercent = summary1.totalIncome !== 0 ? ((incomeChange / summary1.totalIncome) * 100).toFixed(2) : 'N/A';
    const expenseChangePercent = summary1.totalExpenses !== 0 ? ((expenseChange / summary1.totalExpenses) * 100).toFixed(2) : 'N/A';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              max-width: 1000px;
              margin: 0 auto;
            }
            h1 { color: #2563eb; margin-bottom: 20px; }
            .date-range { color: #666; margin-bottom: 30px; }
            .period-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .period-box {
              padding: 20px;
              border-radius: 8px;
            }
            .period1 { background-color: #eff6ff; }
            .period2 { background-color: #f0fdf4; }
            .period-box h3 { margin: 0 0 10px 0; }
            .period1 h3 { color: #1e40af; }
            .period2 h3 { color: #16a34a; }
            .period-box .date { color: #666; font-size: 14px; margin-bottom: 15px; }
            .summary-item { margin-bottom: 10px; }
            .summary-item p:first-child { color: #666; font-size: 12px; margin: 0; }
            .summary-item p:last-child { font-size: 20px; font-weight: bold; margin: 5px 0 0 0; }
            .income { color: #16a34a; }
            .expense { color: #dc2626; }
            .balance { color: #2563eb; }
            .change-box {
              background-color: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .change-box h3 { color: #d97706; margin: 0 0 15px 0; }
            .change-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .change-item p:first-child { color: #666; font-size: 12px; margin: 0; }
            .change-item p:nth-child(2) { font-size: 18px; font-weight: bold; margin: 5px 0; }
            .change-item p:last-child { color: #666; font-size: 11px; margin: 0; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; page-break-inside: avoid; }
            thead tr { background-color: #2563eb; color: white; }
            thead.period2-header tr { background-color: #16a34a; }
            th, td { padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px; }
            th { font-weight: 600; }
            tbody tr:nth-child(even) { background-color: #f9fafb; }
            .amount { text-align: right; }
            h2 { color: #1e40af; margin: 30px 0 15px 0; }
            @media print {
              body { padding: 20px; }
              .period-grid, .change-grid { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Comparative Analysis Report</h1>
          <p class="date-range">Generated on ${new Date().toLocaleDateString()}</p>
          
          <div class="period-grid">
            <div class="period-box period1">
              <h3>Period 1</h3>
              <p class="date">${new Date(exportConfig.startDate).toLocaleDateString()} to ${new Date(exportConfig.endDate).toLocaleDateString()}</p>
              <div class="summary-item">
                <p>Income</p>
                <p class="income">NPR ${summary1.totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Expenses</p>
                <p class="expense">NPR ${summary1.totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Net Balance</p>
                <p class="balance">NPR ${summary1.netBalance.toLocaleString()}</p>
              </div>
            </div>

            <div class="period-box period2">
              <h3>Period 2</h3>
              <p class="date">${new Date(exportConfig.period2StartDate || '').toLocaleDateString()} to ${new Date(exportConfig.period2EndDate || '').toLocaleDateString()}</p>
              <div class="summary-item">
                <p>Income</p>
                <p class="income">NPR ${summary2.totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Expenses</p>
                <p class="expense">NPR ${summary2.totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <p>Net Balance</p>
                <p class="balance">NPR ${summary2.netBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div class="change-box">
            <h3>Change Analysis</h3>
            <div class="change-grid">
              <div class="change-item">
                <p>Income Change</p>
                <p class="${incomeChange >= 0 ? 'positive' : 'negative'}">
                  ${incomeChange >= 0 ? '+' : ''}${incomeChange.toLocaleString()}
                </p>
                <p>${incomeChangePercent}%</p>
              </div>
              <div class="change-item">
                <p>Expense Change</p>
                <p class="${expenseChange >= 0 ? 'negative' : 'positive'}">
                  ${expenseChange >= 0 ? '+' : ''}${expenseChange.toLocaleString()}
                </p>
                <p>${expenseChangePercent}%</p>
              </div>
              <div class="change-item">
                <p>Balance Change</p>
                <p class="${balanceChange >= 0 ? 'positive' : 'negative'}">
                  ${balanceChange >= 0 ? '+' : ''}${balanceChange.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <h2>Period 1 Transactions (${period1.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Category</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${period1.map((t, i) => `
                <tr>
                  <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
                  <td>${t.name}</td>
                  <td>${categoryMap[t.categoryId]}</td>
                  <td class="amount" style="color: ${transactionTypeMap[t.transactionTypeId] === 'income' ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                    ${transactionTypeMap[t.transactionTypeId] === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Period 2 Transactions (${period2.length})</h2>
          <table>
            <thead class="period2-header">
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Category</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${period2.map((t, i) => `
                <tr>
                  <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
                  <td>${t.name}</td>
                  <td>${categoryMap[t.categoryId]}</td>
                  <td class="amount" style="color: ${transactionTypeMap[t.transactionTypeId] === 'income' ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                    ${transactionTypeMap[t.transactionTypeId] === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (exportConfig.type === 'transactions') {
      const filteredData = filterTransactionsByDate(transactions, exportConfig.startDate, exportConfig.endDate);

      if (filteredData.length === 0) {
        setError('No transactions found for the selected date range');
        return;
      }

      const filename = `transactions_${timestamp}.${exportConfig.format}`;

      if (exportConfig.format === 'csv') {
        exportTransactionsToCSV(filteredData, filename);
      } else {
        exportTransactionsToPDF(filteredData, filename);
      }
    } else if (exportConfig.type === 'comparative') {
      if (!exportConfig.period2StartDate || !exportConfig.period2EndDate) {
        setError('Please select dates for both periods');
        return;
      }

      const period1Data = filterTransactionsByDate(transactions, exportConfig.startDate, exportConfig.endDate);
      const period2Data = filterTransactionsByDate(transactions, exportConfig.period2StartDate, exportConfig.period2EndDate);

      if (period1Data.length === 0 || period2Data.length === 0) {
        setError('No transactions found for one or both periods');
        return;
      }

      const filename = `comparative_analysis_${timestamp}.${exportConfig.format}`;

      if (exportConfig.format === 'csv') {
        exportComparativeToCSV(period1Data, period2Data, filename);
      } else {
        exportComparativeToPDF(period1Data, period2Data, filename);
      }
    }
    else {
      const yearlyData = filterTransactionsByDate(transactions, exportConfig.startDate, exportConfig.endDate);

      if (yearlyData.length === 0) {
        setError('No transactions found for the selected year');
        return;
      }
      const filename = `yearly_report_${timestamp}.${exportConfig.format}`;
      if (exportConfig.format === 'csv') {
        exportYearlyDataToCSV(yearlyData, filename);
      }
      else {
        exportYearlyTransactionsToPDF(yearlyData, filename);
      }
    }

    setError('');
  }
    ;

  const filteredTransactions = filterTransactionsByDate(transactions, exportConfig.startDate, exportConfig.endDate);
  const summary = calculateSummary(filteredTransactions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div
          className={`mb-8 transition-all duration-700 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <Download className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Data Export</h1>
          </div>
          <p className="text-gray-600 ml-14">
            Export your financial data in CSV or PDF format
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-3 text-gray-600">Loading transactions...</p>
          </div>
        ) : (
          <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Export Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Export Type
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={exportConfig.type}
                      onChange={(e) => setExportConfig({ ...exportConfig, type: e.target.value as 'transactions' | 'comparative' })}
                    >
                      <option value="transactions">Transactions Report</option>
                      <option value="comparative">Comparative Analysis</option>
                      <option value="yearly">Yearly Summary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setExportConfig({ ...exportConfig, format: 'csv' })}
                        className={`p-3 border-2 rounded-lg transition-all ${exportConfig.format === 'csv'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-400'
                          }`}
                      >
                        <FileText className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">CSV</span>
                      </button>
                      <button
                        onClick={() => setExportConfig({ ...exportConfig, format: 'pdf' })}
                        className={`p-3 border-2 rounded-lg transition-all ${exportConfig.format === 'pdf'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-400'
                          }`}
                      >
                        <FileText className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                    </div>
                  </div>
                  {exportConfig.type === 'yearly' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={exportConfig.startDate ? new Date(exportConfig.startDate).getFullYear() : new Date().getFullYear()}
                        onChange={(e) => {
                          const year = e.target.value;
                          setExportConfig({
                            ...exportConfig,
                            startDate: `${year}-01-01`,
                            endDate: `${year}-12-31`,
                          });
                        }}
                      />
                    </div>
                  )}

                  {exportConfig.type !== 'yearly' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {exportConfig.type === 'comparative' ? 'Period 1 - Start Date' : 'Start Date'}
                        </label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={exportConfig.startDate}
                          onChange={(e) => setExportConfig({ ...exportConfig, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {exportConfig.type === 'comparative' ? 'Period 1 - End Date' : 'End Date'}
                        </label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={exportConfig.endDate}
                          onChange={(e) => setExportConfig({ ...exportConfig, endDate: e.target.value })}
                        />
                      </div>

                      {exportConfig.type === 'comparative' && (
                        <>
                          <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Period 2</h4>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              value={exportConfig.period2StartDate}
                              onChange={(e) => setExportConfig({ ...exportConfig, period2StartDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              End Date
                            </label>
                            <input
                              type="date"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              value={exportConfig.period2EndDate}
                              onChange={(e) => setExportConfig({ ...exportConfig, period2EndDate: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleExport}
                    disabled={transactions.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Download className="h-5 w-5" />
                    Export Data
                  </button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Data Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className={`transition-all duration-500 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}>
                    <h4 className="font-semibold mb-3 text-gray-900">Current Selection</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Transactions:</span>
                        <span className="text-sm font-semibold text-gray-900">{filteredTransactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date Range:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {new Date(exportConfig.startDate).toLocaleDateString()} - {new Date(exportConfig.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {exportConfig.type === 'comparative' && exportConfig.period2StartDate && (
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-sm text-gray-600">Period 2:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(exportConfig.period2StartDate).toLocaleDateString()} - {new Date(exportConfig.period2EndDate || '').toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`pt-4 border-t transition-all duration-500 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}>
                    <h4 className="font-semibold mb-3 text-gray-900">Financial Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Total Income</span>
                        <span className="text-lg font-bold text-green-600">NPR {summary.totalIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm text-gray-700">Total Expenses</span>
                        <span className="text-lg font-bold text-red-600">NPR {summary.totalExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Net Balance</span>
                        <span className="text-lg font-bold text-blue-600">NPR {summary.netBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`pt-4 border-t transition-all duration-500 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}>
                    <h4 className="font-semibold mb-3 text-gray-900">Export Features</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {exportConfig.type === 'transactions' ? (
                        <>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                            Complete transaction details with categories
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                            Income and expense breakdown
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                            Date-based filtering
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                            Side-by-side period comparison
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                            Percentage change analysis
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                            Trend visualization
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExporter;