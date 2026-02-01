import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, DollarSign, PiggyBank, CreditCard } from 'lucide-react';
import { goalService, type Goal } from '../services/goalService';
import { useAuth } from '../contexts/AuthContext';

interface DashboardGoalsSectionProps {
  loaded: boolean;
  scrollY: number;
}

export default function DashboardGoals({ loaded, scrollY }: DashboardGoalsSectionProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        if (!user?.userId) return;
        const response = await goalService.getGoals();
        console.log('Fetched goals:', response);
        const activeGoals = response.filter((g: Goal) => g.status === 'Active').slice(0,3);
        setGoals(activeGoals);
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user?.userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'Savings':
        return <PiggyBank />;
      case 'Investment':
        return <TrendingUp />;
      case 'DebtRepayment':
        return <CreditCard />;
      default:
        return <Target />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-indigo-600';
    if (progress >= 25) return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  const goalsParallax = scrollY * 0.16;

  if (loading) {
    return (
      <div
        className={`bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg transition-all duration-700 delay-[650ms] ${
          loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
        style={{ transform: `translateY(${loaded ? -goalsParallax * 0.2 : 48}px)` }}
      >
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-700 delay-[650ms] ${
        loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      style={{ transform: `translateY(${loaded ? -goalsParallax * 0.2 : 48}px)` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Active Goals
        </h3>
        {goals.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {goals.length} goal{goals.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-500 text-sm mb-2">No active goals yet</p>
          <p className="text-gray-400 text-xs">Set your first financial goal to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all duration-500 ${
                  loaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
                style={{
                  transitionDelay: `${700 + idx * 100}ms`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{getGoalIcon(goal.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">
                        {goal.name}
                      </h4>
                      <p className="text-xs text-gray-500">{goal.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-purple-600">
                      {progress.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-500 shadow-sm`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Progress</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {formatCurrency(goal.currentAmount)}
                      <span className="text-gray-400 font-normal"> / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Deadline</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {daysLeft > 0 ? (
                        <span>
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </span>
                      ) : (
                        <span className="text-red-600">Overdue</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300"
            onClick={() => (window.location.href = '/goals')}
          >
            View All Goals →
          </button>
        </div>
      )}
    </div>
  );
}