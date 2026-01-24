import React from 'react';
import {type Milestone } from '../../services/goalService';

interface GoalProgressProps {
  currentAmount: number;
  targetAmount: number;
  milestones?: Milestone[];
  showMilestones?: boolean;
  className?: string;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ 
  currentAmount, 
  targetAmount, 
  milestones = [],
  showMilestones = true,
  className = '' 
}) => {
  const progressPercentage = targetAmount > 0 
    ? Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100))
    : 0;

  const defaultMilestones = [
    { percentage: 25, isAchieved: progressPercentage >= 25, achievedAt: undefined },
    { percentage: 50, isAchieved: progressPercentage >= 50, achievedAt: undefined },
    { percentage: 75, isAchieved: progressPercentage >= 75, achievedAt: undefined },
    { percentage: 100, isAchieved: progressPercentage >= 100, achievedAt: undefined }
  ];

  const displayMilestones = milestones.length > 0 ? milestones : defaultMilestones;

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-500';
    if (progressPercentage >= 75) return 'bg-blue-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    if (progressPercentage >= 25) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Milestone markers */}
          {showMilestones && (
            <div className="absolute inset-0 flex justify-between items-center px-1">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className="w-0.5 h-full bg-white opacity-50"
                  style={{ marginLeft: `${milestone - 1}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Milestone Indicators */}
      {showMilestones && displayMilestones.length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-xs">
          {displayMilestones.map((milestone) => (
            <div
              key={milestone.percentage}
              className={`text-center p-2 rounded-md transition-colors ${
                milestone.isAchieved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {milestone.isAchieved ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div className="font-medium">{milestone.percentage}%</div>
              {milestone.isAchieved && milestone.achievedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(milestone.achievedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Achievement Message */}
      {progressPercentage >= 100 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium text-sm">
              🎉 Congratulations! Goal achieved!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalProgress;