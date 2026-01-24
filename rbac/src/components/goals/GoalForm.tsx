import React, { useState, useEffect } from 'react';
import { type Goal,type  CreateGoalRequest, type UpdateGoalRequest } from '../../services/goalService';
import { goalService } from '../../services/goalService';

interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    type: 'Savings' as 'Savings' | 'Investment' | 'DebtRepayment',
    status: 'Active' as 'Active' | 'Completed' | 'Paused'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        deadline: goal.deadline.split('T')[0], // Format for date input
        type: goal.type,
        status: goal.status
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const targetAmount = parseFloat(formData.targetAmount);
      
      if (isNaN(targetAmount) || targetAmount <= 0) {
        throw new Error('Target amount must be a positive number');
      }

      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      if (goal) {
        // Update existing goal
        const updateData: UpdateGoalRequest = {
          name: formData.name,
          targetAmount: targetAmount,
          deadline: deadlineDate.toISOString(),
          type: formData.type,
          status: formData.status
        };
        await goalService.updateGoal(goal.id, updateData);
      } else {
        // Create new goal
        const createData: CreateGoalRequest = {
          name: formData.name,
          targetAmount: targetAmount,
          deadline: deadlineDate.toISOString(),
          type: formData.type
        };
        await goalService.createGoal(createData);
      }

      onSubmit();
    } catch (err: any) {
      setError(err.message || 'Failed to save goal');
      console.error('Error saving goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {goal ? 'Edit Goal' : 'Create New Goal'}
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Goal Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Emergency Fund, New Car, Vacation"
          />
        </div>

        {/* Target Amount */}
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount (NPR) *
          </label>
          <input
            type="number"
            id="targetAmount"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="100000"
          />
        </div>

        {/* Goal Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Goal Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Savings">💰 Savings</option>
            <option value="Investment">📈 Investment</option>
            <option value="DebtRepayment">💳 Debt Repayment</option>
          </select>
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline *
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            min={getMinDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status (only for editing) */}
        {goal && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}

        {/* Form Actions */}
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
            {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;