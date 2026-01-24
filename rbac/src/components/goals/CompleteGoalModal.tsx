import React, { useState, useEffect } from 'react';
import { type Goal } from '../../services/goalService';
import { goalService } from '../../services/goalService';
import { accountsService } from '../../services/accountsService';
import { useAuth } from '../../contexts/AuthContext';
import {toast} from "sonner";
interface CompleteGoalModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (accountType: string, accountId?: string) => void;
}

const CompleteGoalModal: React.FC<CompleteGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onComplete
}) => {
  const [selectedAccountType, setSelectedAccountType] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(false);
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
     toast.error("Failed to load accounts.");
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
  //I am getting accounts.filter is not a function
  const bankAccounts = Array.isArray(accounts) ? accounts.filter(acc => acc.type === 'Bank') : [];

  const otherAccounts = Array.isArray(accounts) ? accounts.filter(acc => acc.type !== 'Bank') : [];

  const handleComplete = async () => {
    if (!selectedAccountType) return;
    
    setLoading(true);
    try {
      const completeGoalDto = {
        accountType: selectedAccountType,
        accountId: selectedAccountType !== 'cash' ? parseInt(selectedAccountId) : undefined,
        description: `Goal completed using ${selectedAccountType}`
      };
      
      await goalService.completeGoal(goal.id, completeGoalDto);
      await onComplete(selectedAccountType, selectedAccountId);
      onClose();
    } catch (error) {
      toast.error("Failed to complete goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Complete Goal</h3>
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
            <div className="text-sm text-gray-600">Remaining Amount:</div>
            <div className="text-lg font-bold text-green-600">
              {new Intl.NumberFormat('en-NP', {
                style: 'currency',
                currency: 'NPR',
                minimumFractionDigits: 0,
              }).format(remainingAmount)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
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
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={loading || !selectedAccountType || (selectedAccountType !== 'cash' && !selectedAccountId)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Completing...' : 'Complete Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteGoalModal;