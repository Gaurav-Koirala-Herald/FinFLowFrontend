import React, { useState, useEffect } from 'react';
import {type Goal } from '../../services/goalService';
import { goalService } from '../../services/goalService';
import { accountsService } from '../../services/accountsService';
import { useAuth } from '../../contexts/AuthContext';

interface AddMoneyModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: (amount: number, accountType: string, accountId?: string) => void;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  goal,
  isOpen,
  onClose,
  onAddMoney
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const {user} = useAuth();
  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      const activeAccounts = await accountsService.getAllAccounts(user?.userId || 0);
      setAccounts(activeAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
      // Use fallback mock data if API fails
      setAccounts([
        { id: '1', name: 'Primary Checking Account', type: 'Bank', bankName: 'Nepal Bank' },
        { id: '2', name: 'Savings Account', type: 'Bank', bankName: 'Rastriya Banijya Bank' },
        { id: '3', name: 'eSewa Wallet', type: 'DigitalWallet' },
        { id: '4', name: 'Khalti Wallet', type: 'DigitalWallet' }
      ]);
    }
  };

  // Mock accounts - in real implementation, fetch from API
  const bankAccounts = accounts.filter(acc => acc.type === 'Bank');
  const otherAccounts = accounts.filter(acc => acc.type !== 'Bank');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!selectedAccountType) {
      setError('Please select an account type');
      return;
    }

    if (selectedAccountType !== 'cash' && !selectedAccountId) {
      setError('Please select an account');
      return;
    }

    setLoading(true);
    try {
      const contributionDto = {
        amount: amountValue,
        accountId: selectedAccountType !== 'cash' ? parseInt(selectedAccountId) : undefined,
        type: 'Manual',
        description: `Manual contribution using ${selectedAccountType}`
      };
      
      await goalService.addContribution(goal.id, contributionDto);
      await onAddMoney(amountValue, selectedAccountType, selectedAccountId);
      onClose();
      // Reset form
      setAmount('');
      setSelectedAccountType('');
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
    setSelectedAccountType('');
    setSelectedAccountId('');
    setError(null);
  };

  if (!isOpen) return null;

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const previewAmount = parseFloat(amount) || 0;
  const newTotal = goal.currentAmount + previewAmount;
  const newProgress = goal.targetAmount > 0 ? (newTotal / goal.targetAmount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Money to Goal</h3>
          <button
            onClick={handleClose}
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
            <div className="text-sm text-gray-600">Remaining Amount:</div>
            <div className="text-lg font-bold text-blue-600">
              {new Intl.NumberFormat('en-NP', {
                style: 'currency',
                currency: 'NPR',
                minimumFractionDigits: 0,
              }).format(remainingAmount)}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (NPR) *
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account Type *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="bank"
                  checked={selectedAccountType === 'bank'}
                  onChange={(e) => {
                    setSelectedAccountType(e.target.value);
                    setSelectedAccountId('');
                  }}
                  className="mr-2"
                />
                Bank Account
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="other"
                  checked={selectedAccountType === 'other'}
                  onChange={(e) => {
                    setSelectedAccountType(e.target.value);
                    setSelectedAccountId('');
                  }}
                  className="mr-2"
                />
                Other Account (Digital Wallet, etc.)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="cash"
                  checked={selectedAccountType === 'cash'}
                  onChange={(e) => {
                    setSelectedAccountType(e.target.value);
                    setSelectedAccountId('');
                  }}
                  className="mr-2"
                />
                Cash
              </label>
            </div>
          </div>

          {selectedAccountType === 'bank' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Bank Account *
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose an account...</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} {account.bankName ? `- ${account.bankName}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedAccountType === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Account *
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose an account...</option>
                {otherAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.typeDisplayName || account.type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Progress Preview */}
          {previewAmount > 0 && (
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-900">New Progress Preview</span>
                <span className="text-sm font-bold text-blue-900">{newProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, newProgress)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-blue-700">
                New Total: {new Intl.NumberFormat('en-NP', {
                  style: 'currency',
                  currency: 'NPR',
                  minimumFractionDigits: 0,
                }).format(newTotal)}
                {newTotal >= goal.targetAmount && (
                  <span className="font-medium ml-2">🎉 Goal will be completed!</span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedAccountType || (selectedAccountType !== 'cash' && !selectedAccountId)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoneyModal;