"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { transactionService, type Transaction } from "../services/transactionService";
import { useAuth } from "../contexts/AuthContext";

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Dashboard metrics
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        if (!user?.userId) return;

        const response: Transaction[] = await transactionService.getAllTransactions(user.userId);
        setTransactions(response); 
        calculateMetrics(response); 
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.userId]);

  const calculateMetrics = (data: Transaction[]) => {
    const incomeTransactions = data.filter((t) => t.transactionTypeId === 1);
    const expenseTransactions = data.filter((t) => t.transactionTypeId === 2);

    const incomeTotal = incomeTransactions.reduce((acc, t) => acc + (t.amount ?? 0), 0);
    const expenseTotal = expenseTransactions.reduce((acc, t) => acc + (t.amount ?? 0), 0);

    setTotalBalance(incomeTotal - expenseTotal);
    setMonthlyIncome(incomeTotal);
    setMonthlyExpenses(expenseTotal);

    const savingsRatePercentage =
      incomeTotal > 0 ? ((incomeTotal - expenseTotal) / incomeTotal) * 100 : 0;
    setSavingsRate(savingsRatePercentage);
  };

  const financialOverviewData = {
    labels: transactions.map((t) =>
      new Date(t.transactionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Income",
        data: transactions
          .filter((t) => t.transactionTypeId === 1)
          .map((t) => t.amount ?? 0),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Expenses",
        data: transactions
          .filter((t) => t.transactionTypeId === 2)
          .map((t) => t.amount ?? 0),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, ticks: { beginAtZero: true } },
    },
  };

  // Pagination Logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-primary animate-pulse font-semibold">Loading Financial Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="bg-blue-50 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-blue-700">Welcome to FinFlow</h2>
          <p className="text-sm text-blue-600">
            Explore your personalized financial dashboard to gain actionable insights into your
            financial health.
          </p>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold text-gray-500">Total Balance</p>
            <p className="text-2xl font-bold text-green-600">${totalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold text-gray-500">Monthly Income</p>
            <p className="text-2xl font-bold text-blue-600">${monthlyIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold text-gray-500">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-600">${monthlyExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold text-gray-500">Savings Rate</p>
            <p className="text-2xl font-bold text-purple-600">{savingsRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Financial Overview Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial Overview</h3>
          <div className="h-60">
            <Line data={financialOverviewData} options={{
              responsive: true,
              maintainAspectRatio: false, // Ensures the chart adapts to its container
              plugins: {
                legend: {
                  position: "top" as "top", // Fix for `plugins.legend.position`
                },
              },
              scales: {
                x: { grid: { display: false } },
                y: {
                  grid: { display: false },
                  ticks: { display: true },
                },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Recent Transactions with Pagination */}
      <div className="flex-none w-full lg:w-72 bg-white p-4 rounded-lg shadow-md max-h-[530px] overflow-y-hidden">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h3>
        <ul className="space-y-4 ">
          {paginatedTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex justify-between items-center rounded-lg bg-gray-50 p-3 shadow-sm"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{transaction.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(transaction.transactionDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span
                  className={`text-sm font-semibold ${transaction.transactionTypeId === 1 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  ${transaction.amount?.toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-xs text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="text-xs text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}