import React, { useState, useCallback } from 'react';
import GoalList from '../components/goals/GoalList';
import GoalProgress from '../components/goals/GoalProgress';
import ManualProgressUpdate from '../components/goals/ManualProgressUpdate';
import CompleteGoalModal from '../components/goals/CompleteGoalModal';
import CheckMilestoneModal from '../components/goals/CheckMilestoneModal';
import AddMoneyModal from '../components/goals/AddMoneyModal';
import { goalService, type Goal, type GoalProgress as GoalProgressTypes } from '../services/goalService';
import { CreditCard, PiggyBank, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';


/** Returns a human-readable error string if the goal is invalid, otherwise null. */
const validateGoal = (goal: Goal | null): string | null => {
  if (!goal) return 'No goal selected.';
  if (!goal.id) return 'Goal is missing an ID.';
  if (!goal.name || goal.name.trim().length === 0) return 'Goal name is invalid.';
  if (goal.targetAmount == null || goal.targetAmount <= 0) return 'Goal target amount is invalid.';
  if (goal.currentAmount == null || goal.currentAmount < 0) return 'Goal current amount is invalid.';
  return null;
};

const validateAddMoneyAmount = (amount: number, goal: Goal): string | null => {
  if (isNaN(amount) || amount <= 0) return 'Amount must be a positive number.';
  if (amount < 1) return 'Minimum contribution is NPR 1.';
  if (amount > 10_000_000) return 'Amount cannot exceed NPR 1,00,00,000.';
  if (goal.status === 'Completed') return 'Cannot add money to a completed goal.';
  return null;
};

const validateCompleteGoal = (goal: Goal): string | null => {
  if (goal.status === 'Completed') return 'This goal is already completed.';
  if (!goal.targetAmount || goal.targetAmount <= 0) return 'Cannot complete a goal with an invalid target amount.';
  return null;
};

// ─── Component ─────────────────────────────────────────────────────────────────
const Goals: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgressTypes | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [showManualUpdate, setShowManualUpdate] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  // ── Refresh helper ───────────────────────────────────────────────────────────
  const refreshGoalData = useCallback(async (goalId: number) => {
    const [updatedProgress, updatedGoal] = await Promise.all([
      goalService.getGoalProgress(goalId),
      goalService.getGoalsById(goalId),
    ]);
    setGoalProgress(updatedProgress);
    setSelectedGoal(updatedGoal);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleGoalSelect = async (goal: Goal) => {
    const error = validateGoal(goal);
    if (error) {
      toast.error(error);
      return;
    }

    setSelectedGoal(goal);
    setLoadingProgress(true);
    try {
      const progress = await goalService.getGoalProgress(goal.id);
      setGoalProgress(progress);
    } catch (error) {
      console.error('Error loading goal progress:', error);
      toast.error('Failed to load goal progress. Some information may be unavailable.');
      setGoalProgress(null);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleBackToList = () => {
    setSelectedGoal(null);
    setGoalProgress(null);
    setShowManualUpdate(false);
    setShowCompleteModal(false);
    setShowMilestoneModal(false);
    setShowAddMoneyModal(false);
  };

  const handleManualUpdateComplete = async () => {
    setShowManualUpdate(false);

    const goalError = validateGoal(selectedGoal);
    if (goalError) {
      toast.error(goalError);
      return;
    }

    try {
      await refreshGoalData(selectedGoal!.id);
    } catch (error) {
      console.error('Error refreshing goal data:', error);
      toast.error('Progress updated, but failed to refresh data. Please reload the page.');
    }
  };

  const handleCompleteGoal = async (accountType: string, accountId?: string) => {
    const goalError = validateGoal(selectedGoal);
    if (goalError) {
      toast.error(goalError);
      return;
    }

    const completeError = validateCompleteGoal(selectedGoal!);
    if (completeError) {
      toast.error(completeError);
      return;
    }

    try {
      await goalService.updateGoal(selectedGoal!.id, {
        currentAmount: selectedGoal!.targetAmount,
        status: 'Completed',
      });

      await goalService.checkGoalMilestones(selectedGoal!.id);
      await refreshGoalData(selectedGoal!.id);

      toast.success('Goal completed successfully! 🎉');
    } catch (error) {
      console.error('Error completing goal:', error);
      toast.error('Failed to complete goal. Please try again.');
    }
  };

  const handleAddMoney = async (amount: number) => {
    const goalError = validateGoal(selectedGoal);
    if (goalError) {
      toast.error(goalError);
      return;
    }

    const amountError = validateAddMoneyAmount(amount, selectedGoal!);
    if (amountError) {
      toast.error(amountError);
      return;
    }

    try {
      const newCurrentAmount = selectedGoal!.currentAmount + amount;
      const newStatus =
        newCurrentAmount >= selectedGoal!.targetAmount ? 'Completed' : selectedGoal!.status;

      await goalService.updateGoal(selectedGoal!.id, {
        currentAmount: newCurrentAmount,
        status: newStatus,
      });

      await goalService.checkGoalMilestones(selectedGoal!.id);
      await refreshGoalData(selectedGoal!.id);

      const formatted = new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 0,
      }).format(amount);

      if (newStatus === 'Completed') {
        toast.success(`Added ${formatted} — your goal is now complete! 🎉`);
      } else {
        toast.success(`Successfully added ${formatted} to your goal!`);
      }
    } catch (error) {
      console.error('Error adding money to goal:', error);
      toast.error('Failed to add money to goal. Please try again.');
    }
  };

  // Guard: open Complete modal only if the goal can be completed
  const handleOpenCompleteModal = () => {
    const error = validateCompleteGoal(selectedGoal!);
    if (error) {
      toast.error(error);
      return;
    }
    setShowCompleteModal(true);
  };

  // Guard: open Add Money modal only if the goal is still active
  const handleOpenAddMoneyModal = () => {
    if (selectedGoal?.status === 'Completed') {
      toast.error('Cannot add money to a completed goal.');
      return;
    }
    setShowAddMoneyModal(true);
  };

  // ── Manual update view ───────────────────────────────────────────────────────
  if (selectedGoal && showManualUpdate) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <button
            onClick={() => setShowManualUpdate(false)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Goal Details
          </button>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <ManualProgressUpdate
            goal={selectedGoal}
            onUpdate={handleManualUpdateComplete}
            onCancel={() => setShowManualUpdate(false)}
          />
        </div>
      </div>
    );
  }

  // ── Goal detail view ─────────────────────────────────────────────────────────
  if (selectedGoal) {
    const isCompleted = selectedGoal.status === 'Completed';
    const deadlineDate = selectedGoal.deadline ? new Date(selectedGoal.deadline) : null;
    const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;

    return (
      <div className="p-6">
        <div className="mb-8">
          <button
            onClick={handleBackToList}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Goals
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-3xl">
              {selectedGoal.type === 'Savings' ? (
                <PiggyBank />
              ) : selectedGoal.type === 'Investment' ? (
                <TrendingUp />
              ) : (
                <CreditCard />
              )}
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{selectedGoal.name}</h1>
                {isCompleted && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                )}
                {!isCompleted && isPastDeadline && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Past Deadline
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                {selectedGoal.type} Goal • Target:{' '}
                {new Intl.NumberFormat('en-NP', {
                  style: 'currency',
                  currency: 'NPR',
                  minimumFractionDigits: 0,
                }).format(selectedGoal.targetAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('en-NP', {
                  style: 'currency',
                  currency: 'NPR',
                  minimumFractionDigits: 0,
                }).format(selectedGoal.currentAmount)}
              </div>
              <div className="text-sm text-gray-600">Current Amount</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('en-NP', {
                  style: 'currency',
                  currency: 'NPR',
                  minimumFractionDigits: 0,
                }).format(selectedGoal.targetAmount)}
              </div>
              <div className="text-sm text-gray-600">Target Amount</div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${isPastDeadline && !isCompleted ? 'text-red-600' : 'text-purple-600'}`}>
                {deadlineDate
                  ? deadlineDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No deadline'}
              </div>
              <div className="text-sm text-gray-600">
                {isPastDeadline && !isCompleted ? 'Deadline (overdue)' : 'Deadline'}
              </div>
            </div>
          </div>

          {loadingProgress ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : goalProgress ? (
            <GoalProgress
              currentAmount={goalProgress.currentAmount}
              targetAmount={goalProgress.targetAmount}
              milestones={goalProgress.milestones}
              showMilestones
            />
          ) : (
            <GoalProgress
              currentAmount={selectedGoal.currentAmount}
              targetAmount={selectedGoal.targetAmount}
              showMilestones
            />
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleOpenCompleteModal}
              disabled={isCompleted}
              title={isCompleted ? 'This goal is already completed' : 'Mark goal as complete'}
              className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Goal
            </button>

            <button
              onClick={() => setShowMilestoneModal(true)}
              className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Check Milestones
            </button>

            <button
              onClick={handleOpenAddMoneyModal}
              disabled={isCompleted}
              title={isCompleted ? 'Cannot add money to a completed goal' : 'Add money to this goal'}
              className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Money
            </button>
          </div>
        </div>

        {/* Modals */}
        <CompleteGoalModal
          goal={selectedGoal}
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          onComplete={handleCompleteGoal}
        />

        <CheckMilestoneModal
          goal={selectedGoal}
          milestones={goalProgress?.milestones}
          isOpen={showMilestoneModal}
          onClose={() => setShowMilestoneModal(false)}
        />

        <AddMoneyModal
          goal={selectedGoal}
          isOpen={showAddMoneyModal}
          onClose={() => setShowAddMoneyModal(false)}
          onAddMoney={handleAddMoney}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <GoalList onGoalSelect={handleGoalSelect} />
    </div>
  );
};

export default Goals;