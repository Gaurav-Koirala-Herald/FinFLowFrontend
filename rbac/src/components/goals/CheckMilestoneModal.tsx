import React from 'react';
import { type Goal,type Milestone } from '../../services/goalService';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Milestone Progress</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">{goal.name}</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Current Progress</span>
              <span className="text-sm font-bold text-blue-900">{currentProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, currentProgress)}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-medium text-gray-900">Milestones</h5>
          {milestonesToShow.map((milestone) => {
            const milestoneAmount = calculateMilestoneAmount(milestone.percentage);
            const isCurrentlyAchieved = currentProgress >= milestone.percentage;
            
            return (
              <div
                key={milestone.percentage}
                className={`p-4 rounded-lg border-2 ${
                  isCurrentlyAchieved 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCurrentlyAchieved 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCurrentlyAchieved ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{milestone.percentage}</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {milestone.percentage}% Milestone
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    isCurrentlyAchieved ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isCurrentlyAchieved ? 'Achieved' : 'Pending'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Target Amount:</span>
                    <div className="font-medium text-gray-900">
                      {formatCurrency(milestoneAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Achieved:</span>
                    <div className="font-medium text-gray-900">
                      {milestone.achievedAt ? formatDate(milestone.achievedAt) : 
                       isCurrentlyAchieved ? 'Just now' : 'Not achieved'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckMilestoneModal;