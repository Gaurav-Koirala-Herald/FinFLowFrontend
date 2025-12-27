import React, { useEffect, useState } from 'react';
import { nepseService, type NepseIndexResponse,type  StockPrice,type NepseStatus } from '../services/nepseService';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1 text-sm font-semibold">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${change && change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
          <Activity className={change && change >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
        </div>
      </div>
    </div>
  );

  const StockTable = ({ stocks, title }: { stocks: StockPrice[]; title: string }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Symbol</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">LTP</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Change</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">%</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-blue-600">{stock.symbol}</td>
                <td className="py-3 px-4 text-gray-900">{stock.securityName}</td>
                <td className="py-3 px-4 text-right">{stock.ltp.toFixed(2)}</td>
                <td className={`py-3 px-4 text-right ${stock.pointChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.pointChange >= 0 ? '+' : ''}{stock.pointChange.toFixed(2)}
                </td>
                <td className={`py-3 px-4 text-right ${stock.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">NEPSE Dashboard</h1>
            <p className="text-blue-100 mt-1">Nepal Stock Exchange - Real-time Market Data</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full ${marketStatus?.isOpen === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`}>
              {marketStatus?.isOpen === 'OPEN' ? 'Market Open' : 'Market Closed'}
            </div>
            <button onClick={() => window.location.reload()} className="p-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* NEPSE Index Cards */}
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

            {/* Top Gainers and Top Losers */}
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
