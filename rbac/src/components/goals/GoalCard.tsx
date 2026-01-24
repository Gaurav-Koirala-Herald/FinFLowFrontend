import React from 'react';
import {type Goal } from '../../services/goalService';
import GoalProgress from './GoalProgress';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onClick?: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Savings':
        return '💰';
      case 'Investment':
        return '📈';
      case 'DebtRepayment':
        return '💳';
      default:
        return '🎯';
    }
  };

  const isOverdue = new Date(goal.deadline) < new Date() && goal.status === 'Active';
  const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${
        isOverdue ? 'border-l-4 border-red-500' : ''
      }`}
      onClick={() => onClick?.(goal)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getTypeIcon(goal.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {goal.name}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
              {goal.status}
            </span>
          </div>
        </div>
        
        {/* Actions */}
       {/*hide edit/delete buttons if goal is completed*/}

        {goal.status === 'Completed' ? null : (
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit goal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(goal.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete goal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <GoalProgress 
          currentAmount={goal.currentAmount}
          targetAmount={goal.targetAmount}
          showMilestones={false}
        />
      </div>

      {/* Amount Info */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
        <span>Progress</span>
        <span className="font-medium">
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </span>
      </div>

      {/* Deadline Info */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Deadline</span>
        <div className="text-right">
          <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
            {formatDate(goal.deadline)}
          </div>
          {goal.status === 'Active' && (
            <div className={`text-xs ${isOverdue ? 'text-red-500' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
              {isOverdue 
                ? `${Math.abs(daysRemaining)} days overdue`
                : daysRemaining === 0 
                  ? 'Due today'
                  : `${daysRemaining} days left`
              }
            </div>
          )}
        </div>
      </div>

      {/* Completion indicator */}
      {goal.status === 'Completed' && (
        <div className="mt-3 flex items-center justify-center text-green-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Goal Completed!
        </div>
      )}
    </div>
  );
};

export default GoalCard;