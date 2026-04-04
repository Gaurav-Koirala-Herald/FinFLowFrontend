import React, { useEffect, useState } from 'react';
import { nepseService, type NepseIndexResponse, type StockPrice, type NepseStatus } from '../services/nepseService';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Brain, Sparkles } from 'lucide-react';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const NepseDashboard = () => {
  const [nepseIndex, setNepseIndex] = useState<NepseIndexResponse | null>(null);
  const [topGainers, setTopGainers] = useState<StockPrice[]>([]);
  const [topLosers, setTopLosers] = useState<StockPrice[]>([]);
  const [marketStatus, setMarketStatus] = useState<NepseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [indexData, gainersData, losersData, statusData] = await Promise.all([
          nepseService.getNepseIndex(),
          nepseService.getTopGainers(),
          nepseService.getTopLosers(),
          nepseService.isNepseOpen()
        ]);

        setNepseIndex(indexData);
        setTopGainers(gainersData.slice(0, 10));
        setTopLosers(losersData.slice(0, 10));
        setMarketStatus(statusData);
      } catch (error) {
        console.error('Error fetching NEPSE data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, change }: { title: string; value: number | string; change?: number }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1 text-sm font-semibold">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${change && change >= 0 ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
          <Activity className={change && change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} size={24} />
        </div>
      </div>
    </div>
  );

  const StockTable = ({ stocks, title }: { stocks: StockPrice[]; title: string }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Symbol</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">LTP</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Change</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">%</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, idx) => (
              <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{stock.symbol}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-200">{stock.securityName}</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-200">{stock.ltp.toFixed(2)}</td>
                <td className={`py-3 px-4 text-right ${stock.pointChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stock.pointChange >= 0 ? '+' : ''}{stock.pointChange.toFixed(2)}
                </td>
                <td className={`py-3 px-4 text-right ${stock.percentageChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stock.percentageChange >= 0 ? '+' : ''}{stock.percentageChange.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">NEPSE Dashboard</h1>
            <p className="text-blue-100 dark:text-blue-300 mt-1">Nepal Stock Exchange - Real-time Market Data</p>
          </div>
          <div className="flex items-center space-x-4">
            
            <a  href="/ai-recommender"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 16px rgba(99,102,241,0.5)',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              <Brain size={16} />
              AI Recommender
              <Sparkles size={13} style={{ opacity: 0.85 }} />
            </a>

            <div className={`px-4 py-2 rounded-full text-white text-sm font-medium ${marketStatus?.isOpen === 'OPEN' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}`}>
              {marketStatus?.isOpen === 'OPEN' ? 'Market Open' : 'Market Closed'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-blue-700 dark:bg-blue-800 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {nepseIndex &&
                Object.keys(nepseIndex).map((key) => (
                  <StatCard
                    key={key}
                    title={key}
                    value={nepseIndex[key as keyof NepseIndexResponse].currentValue.toFixed(2)}
                    change={nepseIndex[key as keyof NepseIndexResponse].perChange}
                  />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockTable stocks={topGainers} title="Top Gainers" />
              <StockTable stocks={topLosers} title="Top Losers" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NepseDashboard;