import React, { useState, useEffect } from 'react';
import { type Goal, type CreateGoalRequest, type UpdateGoalRequest } from '../../services/goalService';
import { goalService } from '../../services/goalService';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface GoalFormProps {
  isOpen: boolean;
  goal?: Goal | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ isOpen, goal, onSubmit, onCancel }) => {
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
    if (!isOpen) return;

    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        deadline: goal.deadline.split('T')[0],
        type: goal.type,
        status: goal.status
      });
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        deadline: '',
        type: 'Savings',
        status: 'Active'
      });
    }
    setError(null);
  }, [isOpen, goal]);

  const handleSubmit = async () => {
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
        const updateData: UpdateGoalRequest = {
          name: formData.name,
          targetAmount: targetAmount,
          deadline: deadlineDate.toISOString(),
          type: formData.type,
          status: formData.status
        };
        await goalService.updateGoal(goal.id, updateData);
      } else {
        const createData: CreateGoalRequest = {
          name: formData.name,
          targetAmount: targetAmount,
          deadline: deadlineDate.toISOString(),
          type: formData.type
        };
        await goalService.createGoal(createData);
      }

      onSubmit();
      onCancel();
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

  if (!isOpen) return null;

  return (
    <div className="fixed h-full inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-blue-700">
              {goal ? "Edit Goal" : "Create New Goal"}
            </h2>
            <p className="text-sm text-blue-500">
              {goal
                ? "Update your financial goal details"
                : "Set a new financial target"}
            </p>
          </div>
          <button 
            onClick={onCancel} 
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full p-1 transition-colors"
          >
            <X />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="p-6 space-y-4">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Emergency Fund, New Car, Vacation"
            />
          </div>

          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount (NPR)
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="100000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="Savings">Savings</option>
                <option value="Investment">Investment</option>
                <option value="DebtRepayment">Debt Repayment</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={getMinDate()}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalForm;