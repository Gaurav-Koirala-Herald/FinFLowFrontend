import React, { useState, useEffect } from 'react';
import { type Goal } from '../../services/goalService';
import { goalService } from '../../services/goalService';
import { accountsService } from '../../services/accountsService';
import { useAuth } from '../../contexts/AuthContext';
import { X, DollarSign, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { z } from 'zod';

interface AddMoneyModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: (amount: number, accountId?: string) => void;
}

const buildAddMoneySchema = (remainingAmount: number) =>
  z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((val) => !isNaN(parseFloat(val)), {
        message: 'Amount must be a valid number',
      })
      .refine((val) => parseFloat(val) > 0, {
        message: 'Amount must be greater than 0',
      })
      .refine((val) => parseFloat(val) >= 1, {
        message: 'Minimum contribution is NPR 1',
      })
      .refine((val) => parseFloat(val) <= 10_000_000, {
        message: 'Amount cannot exceed NPR 1,00,00,000',
      })
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.trim()), {
        message: 'Amount can have at most 2 decimal places',
      }),
  });

type FormErrors = { amount?: string };

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  goal,
  isOpen,
  onClose,
  onAddMoney,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);
  const { user } = useAuth();

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const schema = buildAddMoneySchema(remainingAmount);

  useEffect(() => {
    if (isOpen) loadAccounts();
  }, [isOpen]);

  // Live validation whenever amount changes (only after first blur/submit)
  useEffect(() => {
    if (!touched) return;
    const result = schema.safeParse({ amount });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({ amount: errors.amount?.[0] });
    } else {
      setFieldErrors({});
    }
  }, [amount, touched]);

  const loadAccounts = async () => {
    try {
      await accountsService.getAllAccounts(user?.userId || 0);
    } catch (err) {
      console.error('Error loading accounts:', err);
    }
  };

  const validate = (): boolean => {
    const result = schema.safeParse({ amount });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({ amount: errors.amount?.[0] });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleBlur = () => {
    setTouched(true);
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setTouched(true);

    if (!validate()) return;

    const amountValue = parseFloat(amount);
    setLoading(true);
    try {
      const contributionDto = { amount: amountValue, type: 'Manual' };
      await goalService.addContribution(goal.id, contributionDto);
      await onAddMoney(amountValue);
      handleClose();
    } catch (err) {
      setSubmitError('Failed to add money to goal. Please try again.');
      console.error('Error adding money:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setAmount('');
    setFieldErrors({});
    setSubmitError(null);
    setTouched(false);
  };

  if (!isOpen) return null;

  const currentProgress =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const previewAmount = parseFloat(amount) || 0;
  const newTotal = goal.currentAmount + previewAmount;
  const newProgress =
    goal.targetAmount > 0 ? (newTotal / goal.targetAmount) * 100 : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(value);

  const hasAmountError = Boolean(fieldErrors.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">

        {/* Header */}
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

          {/* Goal card */}
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              {goal.name}
            </h4>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Current Progress</span>
                <span className="text-lg font-bold text-blue-600">
                  {currentProgress.toFixed(1)}%
                </span>
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

          {/* Remaining amount */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Remaining to reach goal</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          {/* Submit error banner */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="text-sm text-red-700">{submitError}</div>
            </div>
          )}

          {/* Amount input */}
          <div
            className={`p-4 rounded-xl border-2 transition-colors ${
              hasAmountError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <label
              htmlFor="amount"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Amount (NPR)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={handleBlur}
              min="1"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 text-lg font-semibold text-gray-900 placeholder-gray-400 shadow-inner transition-colors ${
                hasAmountError
                  ? 'border-red-400 focus:ring-red-400 focus:border-transparent'
                  : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="0.00"
              aria-invalid={hasAmountError}
              aria-describedby={hasAmountError ? 'amount-error' : undefined}
            />
            {hasAmountError && (
              <p
                id="amount-error"
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                role="alert"
              >
                <span>⚠</span>
                {fieldErrors.amount}
              </p>
            )}
            {!hasAmountError && amount && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <span>✓</span> Valid amount
              </p>
            )}
          </div>

          {/* Progress preview */}
          {previewAmount > 0 && !hasAmountError && (
            <div
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                newTotal >= goal.targetAmount
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  {newTotal >= goal.targetAmount
                    ? '🎉 Goal Completion Preview'
                    : 'Progress Preview'}
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
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(previewAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">New Total</span>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(newTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <Button
            onClick={handleClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit as any}
            disabled={loading || hasAmountError}
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