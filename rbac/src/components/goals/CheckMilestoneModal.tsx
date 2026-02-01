import React from 'react';
import { type Goal, type Milestone } from '../../services/goalService';
import { X, Check, Trophy, Target } from 'lucide-react';
import { Button } from '../ui/button';

interface CheckMilestoneModalProps {
  goal: Goal;
  milestones?: Milestone[];
  isOpen: boolean;
  onClose: () => void;
}

const CheckMilestoneModal: React.FC<CheckMilestoneModalProps> = ({
  goal,
  milestones = [],
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const defaultMilestones = [
    { percentage: 25, isAchieved: false, achievedAt: null },
    { percentage: 50, isAchieved: false, achievedAt: null },
    { percentage: 75, isAchieved: false, achievedAt: null },
    { percentage: 100, isAchieved: false, achievedAt: null }
  ];

  const milestonesToShow = milestones.length > 0 ? milestones : defaultMilestones;
  const currentProgress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  const calculateMilestoneAmount = (percentage: number) => {
    return (goal.targetAmount * percentage) / 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not achieved';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-700">Milestone Progress</h2>
              <p className="text-sm text-blue-500">Track your goal achievements</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full p-1 transition-colors"
          >
            <X />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="mb-6">
            <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              {goal.name}
            </h4>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Current Progress</span>
                <span className="text-lg font-bold text-blue-600">{currentProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(100, currentProgress)}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-gray-700 font-medium">
                  {formatCurrency(goal.currentAmount)}
                </span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-700 font-medium">
                  {formatCurrency(goal.targetAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900 mb-4">Milestones</h5>
            {milestonesToShow.map((milestone, index) => {
              const milestoneAmount = calculateMilestoneAmount(milestone.percentage);
              const isCurrentlyAchieved = currentProgress >= milestone.percentage;
              
              return (
                <div
                  key={milestone.percentage}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    isCurrentlyAchieved 
                      ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                        isCurrentlyAchieved 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCurrentlyAchieved ? (
                          <Check className="w-5 h-5" strokeWidth={3} />
                        ) : (
                          <span className="text-sm font-bold">{milestone.percentage}%</span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block">
                          {milestone.percentage}% Milestone
                        </span>
                        <span className="text-xs text-gray-500">
                          {isCurrentlyAchieved ? '🎉 Congratulations!' : '🎯 Keep going!'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isCurrentlyAchieved 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCurrentlyAchieved ? '✓ Achieved' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Target Amount</span>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(milestoneAmount)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Date Achieved</span>
                      <div className="font-semibold text-gray-900">
                        {milestone.achievedAt ? formatDate(milestone.achievedAt) : 
                         isCurrentlyAchieved ? 'Just now' : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckMilestoneModal;