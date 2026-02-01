"use client";

import { useState, useEffect, useRef } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

import { transactionService, type Transaction } from "../services/transactionService";
import { useAuth } from "../contexts/AuthContext";
import { type ChartOptions } from "chart.js";
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart as PieChartIcon } from "lucide-react";
import { commonService } from "../services/commonService";
import { DynamicAreaChart } from "../components/DynamicAreaChart";
import  DashboardGoals  from "../components/DashboardGoalsf";

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);

  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [incomeData, setIncomeData] = useState<{ labels: string[]; datasets: { data: number[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number; }[] }>({ labels: [], datasets: [] });
  const [expenseData, setExpenseData] = useState<{ labels: string[]; datasets: { data: number[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number; }[] }>({ labels: [], datasets: [] });

  const headerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const pieChartsRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setLoaded(false);
        if (!user?.userId) return;

        const response = await transactionService.getAllTransactions(user.userId);
        setTransactions(response);
        calculateMetrics(response);

        const income = await getIncomeByCategory(response);
        const expense = await getExpenseByCategory(response);
        setIncomeData(income);
        setExpenseData(expense);

        setTimeout(() => {
          setLoading(false);

          setTimeout(() => {
            setLoaded(true);
          }, 10);
        }, 10);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setLoading(false);
        setTimeout(() => {
          setLoaded(true);
        }, 100);
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


  const getIncomeByCategory = async (data: Transaction[]) => {
    const categoryMap: { [key: string]: number } = {};
    const transactionCategories = await commonService.getTransactionCategories();
    data
      .filter((t) => t.transactionTypeId === 1)
      .forEach((t) => {
        const categoryName = transactionCategories.find((cat: { id: any; }) => cat.id === t.categoryId)?.name || "Uncategorized";
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (t.amount ?? 0);
      });


    return {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(99, 255, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 255, 132, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const getExpenseByCategory = async (data: Transaction[]) => {
    const categoryMap: { [key: string]: number } = {};
    const transactionCategories = await commonService.getTransactionCategories();
    data
      .filter((t) => t.transactionTypeId === 2)
      .forEach((t) => {
        const categoryName = transactionCategories.find((cat: { id: any; }) => cat.id === t.categoryId)?.name || "Uncategorized";
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (t.amount ?? 0);
      });

    return {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(201, 203, 207, 0.8)',
          'rgba(255, 99, 255, 0.8)',
          'rgba(255, 206, 132, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(255, 99, 255, 1)',
          'rgba(255, 206, 132, 1)',
        ],
        borderWidth: 2,
      }]
    };
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

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, ticks: { maxTicksLimit: 100 } },
    },
  };

  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: Rs.${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold text-lg">Loading Financial Dashboard...</p>
        </div>
      </div>
    );
  }

  const headerParallax = scrollY * 0.5;
  const metricsParallax = scrollY * 0.3;
  const chartParallax = scrollY * 0.2;
  const pieChartsParallax = scrollY * 0.18;
  const transactionsParallax = scrollY * 0.15;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 relative overflow-hidden min-h-screen">

      <div
        className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pointer-events-none transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'
          }`}
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />

      <div
        className={`fixed inset-0 bg-gradient-to-tr from-transparent via-blue-100/30 to-transparent pointer-events-none transition-opacity duration-1000 delay-300 ${loaded ? 'opacity-100' : 'opacity-0'
          }`}
        style={{ transform: `translateY(${scrollY * -0.3}px)` }}
      />

      <div className="flex-1 space-y-6 relative z-10">

        <div
          ref={headerRef}
          className={`bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg transition-all duration-700 ${loaded ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
            }`}
          style={{ transform: `translateY(${loaded ? -headerParallax * 0.1 : -48}px)` }}
        >
          <h2 className="text-lg font-semibold text-blue-700">Welcome to FinFlow</h2>
          <p className="text-sm text-blue-600">
            Explore your personalized financial dashboard to gain actionable insights into your
            financial health.
          </p>
        </div>

        <div
          ref={metricsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{ transform: `translateY(${-metricsParallax * 0.15}px)` }}
        >
          {[
            { label: "Total Balance", value: `$${totalBalance.toFixed(2)}`, color: "text-green-600", icon: DollarSign, delay: "delay-100" },
            { label: "Monthly Income", value: `$${monthlyIncome.toFixed(2)}`, color: "text-blue-600", icon: TrendingUp, delay: "delay-200" },
            { label: "Monthly Expenses", value: `$${monthlyExpenses.toFixed(2)}`, color: "text-red-600", icon: TrendingDown, delay: "delay-300" },
          ].map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className={`bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg transition-all duration-700 ${metric.delay}  hover:shadow-2xl hover:-translate-y-1 ${loaded ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-500">{metric.label}</p>
                  <Icon className={`${metric.color} w-5 h-5`} />
                </div>
                <p className={`text-3xl font-bold ${metric.color} transition-all duration-500`}>
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>

        <   div
          ref={chartRef}
          className={`bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg transition-all duration-700 delay-500 hover:shadow-2xl ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          style={{ transform: `translateY(${loaded ? -chartParallax * 0.2 : 48}px)` }}
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial Overview</h3>
          <div className="h-full min-h-[300px]">
            <DynamicAreaChart transactions={transactions} />
          </div>
        </div>

        <div
          ref={pieChartsRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 delay-[600ms] ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          style={{ transform: `translateY(${loaded ? -pieChartsParallax * 0.2 : 48}px)` }}
        >
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Income by Category
            </h3>
            <div className="h-64">
              {(incomeData).labels.length > 0 ? (
                <Pie data={incomeData} options={pieChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No income data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Expenses by Category
            </h3>
            <div className="h-64">
              {expenseData.labels.length > 0 ? (
                <Pie data={expenseData} options={pieChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
          <DashboardGoals loaded={loaded} scrollY={scrollY} />
      </div>



      <div
        ref={transactionsRef}
        className={`flex-none w-full lg:w-80 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg transition-all duration-700 delay-[700ms] hover:shadow-2xl max-h-[600px] overflow-y-auto relative z-10 ${loaded ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
          }`}
        style={{ transform: `translateY(${-transactionsParallax * 0.25}px)` }}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Recent Transactions
        </h3>
        <ul className="space-y-3">
          {paginatedTransactions.map((transaction, idx) => (
            <li
              key={transaction.id}
              className={`flex justify-between items-center rounded-lg bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 shadow-sm transition-all duration-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50  hover:shadow-md ${loaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
              style={{
                transitionDelay: `${800 + idx * 100}ms`
              }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{transaction.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(transaction.transactionDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {transaction.transactionTypeId === 1 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-bold ${transaction.transactionTypeId === 1 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  ${transaction.amount?.toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-sm text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-200  active:scale-95 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium"
          >
            Previous
          </button>
          <p className="text-sm text-gray-500 flex items-center font-medium">
            Page {currentPage} of {totalPages}
          </p>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="text-sm text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-200  active:scale-95 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
