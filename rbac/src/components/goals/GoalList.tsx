import React, { useState, useEffect } from 'react';
import { type Goal } from '../../services/goalService';
import { goalService } from '../../services/goalService';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';

interface GoalListProps {
  onGoalSelect?: (goal: Goal) => void;
}

const GoalList: React.FC<GoalListProps> = ({ onGoalSelect }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goals = await goalService.getGoals();
      setGoals(goals);
      setError(null);
    } catch (err) {
      setError('Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await goalService.deleteGoal(goalId);
      await loadGoals(); // Refresh the list
    } catch (err) {
      setError('Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingGoal(null);
    await loadGoals(); // Refresh the list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadGoals}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
        <button
          onClick={handleCreateGoal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create New Goal
        </button>
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <GoalForm
              goal={editingGoal}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No goals yet</div>
          <p className="text-gray-400 mb-6">
            Create your first financial goal to start tracking your progress
          </p>
          <button
            onClick={handleCreateGoal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onClick={onGoalSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalList;