import React, { useState, useEffect } from 'react';
import { type Goal } from '../../services/goalService';
import { goalService } from '../../services/goalService';
import { accountsService } from '../../services/accountsService';
import { useAuth } from '../../contexts/AuthContext';
import { X, DollarSign, Target } from 'lucide-react';
import { Button } from '../ui/button';

interface AddMoneyModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: (amount: number,  accountId?: string) => void;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  goal,
  isOpen,
  onClose,
  onAddMoney
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      await accountsService.getAllAccounts(user?.userId || 0);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const contributionDto = {
        amount: amountValue,
        type: 'Manual',
      };

      await goalService.addContribution(goal.id, contributionDto);
      await onAddMoney(amountValue)
      onClose();
      setAmount('');
      setSelectedAccountId('');
    } catch (error) {
      setError('Failed to add money to goal');
      console.error('Error adding money:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setAmount('');
    setError(null);
  };

  if (!isOpen) return null;

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const currentProgress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const previewAmount = parseFloat(amount) || 0;
  const newTotal = goal.currentAmount + previewAmount;
  const newProgress = goal.targetAmount > 0 ? (newTotal / goal.targetAmount) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">

        {/* Header — mirrors CheckMilestoneModal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-700">Add Money</h2>
              <p className="text-sm text-blue-500">Contribute towards your goal</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full p-1 transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Goal card — same style as milestone's goal summary */}
          <div>
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
                <span className="text-gray-700 font-medium">{formatCurrency(goal.currentAmount)}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-700 font-medium">{formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>
          </div>

          {/* Remaining amount highlight */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Remaining to reach goal</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Amount input card */}
          <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-2">
              Amount (NPR)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-gray-900 placeholder-gray-400 shadow-inner"
              placeholder="0.00"
            />
          </div>

          {/* Progress preview card — styled as a milestone-like card */}
          {previewAmount > 0 && (
            <div
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                newTotal >= goal.targetAmount
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  {newTotal >= goal.targetAmount ? '🎉 Goal Completion Preview' : 'Progress Preview'}
                </span>
                <span
                  className={`text-sm font-bold ${
                    newTotal >= goal.targetAmount ? 'text-green-700' : 'text-blue-600'
                  }`}
                >
                  {newProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-3 shadow-inner">
                <div
                  className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                    newTotal >= goal.targetAmount
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, newProgress)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Adding</span>
                  <div className="font-semibold text-gray-900">{formatCurrency(previewAmount)}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">New Total</span>
                  <div className="font-semibold text-gray-900">{formatCurrency(newTotal)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — mirrors CheckMilestoneModal footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <Button
            onClick={handleClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit as any}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Money'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyModal;