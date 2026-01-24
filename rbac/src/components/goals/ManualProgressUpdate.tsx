import React, { useState } from 'react';
import {type Goal  } from '../../services/goalService';
import { goalService } from '../../services/goalService';

interface ManualProgressUpdateProps {
  goal: Goal;
  onUpdate: () => void;
  onCancel: () => void;
}

const ManualProgressUpdate: React.FC<ManualProgressUpdateProps> = ({ goal, onUpdate, onCancel }) => {
  const [currentAmount, setCurrentAmount] = useState(goal.currentAmount.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(currentAmount);
      
      if (isNaN(amount) || amount < 0) {
        throw new Error('Current amount must be a non-negative number');
      }

      // Update the goal with new current amount
      await goalService.updateGoal(goal.id, {
        currentAmount: amount
      });

      // Check milestones after update
      await goalService.checkGoalMilestones(goal.id);

      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to update progress');
      console.error('Error updating progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = goal.targetAmount > 0 
    ? Math.min(100, (parseFloat(currentAmount) || 0) / goal.targetAmount * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Update Progress Manually
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">{goal.name}</h4>
        <p className="text-sm text-gray-600">
          Target: {new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            minimumFractionDigits: 0,
          }).format(goal.targetAmount)}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Current Amount (NPR) *
          </label>
          <input
            type="number"
            id="currentAmount"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        {/* Progress Preview */}
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">Progress Preview</span>
            <span className="text-sm font-bold text-blue-900">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-blue-700">
            {parseFloat(currentAmount) >= goal.targetAmount && (
              <span className="font-medium">🎉 Goal will be marked as completed!</span>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Progress'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualProgressUpdate;