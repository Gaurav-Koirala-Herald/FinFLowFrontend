import React, { useState } from 'react';
import GoalList from '../components/goals/GoalList';
import GoalProgress from '../components/goals/GoalProgress';
import ManualProgressUpdate from '../components/goals/ManualProgressUpdate';
import CompleteGoalModal from '../components/goals/CompleteGoalModal';
import CheckMilestoneModal from '../components/goals/CheckMilestoneModal';
import AddMoneyModal from '../components/goals/AddMoneyModal';
import { goalService, type Goal,type GoalProgress as GoalProgressTypes } from '../services/goalService';
import { CreditCard, PiggyBank, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Goals: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgressTypes | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [showManualUpdate, setShowManualUpdate] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  const handleGoalSelect = async (goal: Goal) => {
    setSelectedGoal(goal);
    setLoadingProgress(true);
    
    try {
      const goalProgress = await goalService.getGoalProgress(goal.id);
      setGoalProgress(goalProgress);
    } catch (error) {
      console.error('Error loading goal progress:', error);
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
    if (selectedGoal) {
      try {
        const updatedProgress = await goalService.getGoalProgress(selectedGoal.id);
        setGoalProgress(updatedProgress);
        const updatedGoal = await goalService.getGoalsById(selectedGoal.id);
        setSelectedGoal(updatedGoal);
      } catch (error) {
        console.error('Error refreshing goal data:', error);
      }
    }
  };

  const handleCompleteGoal = async (accountType: string, accountId?: string) => {
    if (!selectedGoal) return;
    
    try {
      await goalService.updateGoal(selectedGoal.id, {
        currentAmount: selectedGoal.targetAmount,
        status: 'Completed'
      });

      await goalService.checkGoalMilestones(selectedGoal.id);

      const updatedProgress = await goalService.getGoalProgress(selectedGoal.id);
      setGoalProgress(updatedProgress);
      const updatedGoal = await goalService.getGoalsById(selectedGoal.id);
      setSelectedGoal(updatedGoal);

      toast.success('Goal completed successfully!');
    } catch (error) {
      console.error('Error completing goal:', error);
      toast.error('Failed to complete goal. Please try again.');
    }
  };

  const handleAddMoney = async (amount: number) => {
    if (!selectedGoal) return;
    
    try {
      const newCurrentAmount = selectedGoal.currentAmount + amount;
      const newStatus = newCurrentAmount >= selectedGoal.targetAmount ? 'Completed' : selectedGoal.status;
      
      await goalService.updateGoal(selectedGoal.id, {
        currentAmount: newCurrentAmount,
        status: newStatus
      });

      await goalService.checkGoalMilestones(selectedGoal.id);

      const updatedProgress = await goalService.getGoalProgress(selectedGoal.id);
      setGoalProgress(updatedProgress);
      const updatedGoal = await goalService.getGoalsById(selectedGoal.id);
      setSelectedGoal(updatedGoal);

      toast.success(`Successfully added ${new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 0,
      }).format(amount)} to your goal!`);
    } catch (error) {
      console.error('Error adding money to goal:', error);
      toast.error('Failed to add money to goal. Please try again.');
    }
  };

  if (selectedGoal) {
    if (showManualUpdate) {
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

    return (
      <div className="p-6">
        <div className="mb-8">
          <button
            onClick={handleBackToList}
            className="flex items-center text-white-600 mb-4"
          >
            Back to Goals
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-3xl">
              {selectedGoal.type === 'Savings' ? <PiggyBank /> : 
               selectedGoal.type === 'Investment' ? <TrendingUp /> : <CreditCard />}
            </span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedGoal.name}</h1>
              <p className="text-gray-600">
                {selectedGoal.type} Goal • Target: {new Intl.NumberFormat('en-NP', {
                  style: 'currency',
                  currency: 'NPR',
                  minimumFractionDigits: 0,
                }).format(selectedGoal.targetAmount)}
              </p>
            </div>
          </div>
        </div>

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
              <div className="text-2xl font-bold text-purple-600">
                {new Date(selectedGoal.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-sm text-gray-600">Deadline</div>
            </div>
          </div>

          {loadingProgress ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : goalProgress ? (
            <GoalProgress
              currentAmount={goalProgress.currentAmount}
              targetAmount={goalProgress.targetAmount}
              milestones={goalProgress.milestones}
              showMilestones={true}
            />
          ) : (
            <GoalProgress
              currentAmount={selectedGoal.currentAmount}
              targetAmount={selectedGoal.targetAmount}
              showMilestones={true}
            />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setShowCompleteModal(true)}
              disabled={selectedGoal.status === 'Completed'}
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
              onClick={() => setShowAddMoneyModal(true)}
              disabled={selectedGoal.status === 'Completed'}
              className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Money
            </button>
          </div>
        </div>

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