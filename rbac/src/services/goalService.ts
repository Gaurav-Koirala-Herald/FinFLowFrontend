import { api } from "./api";
export interface Goal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: 'Savings' | 'Investment' | 'DebtRepayment';
  status: 'Active' | 'Completed' | 'Paused';
  createdAt: string;
  progressPercentage?: number;
  daysRemaining?: number;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  deadline: string;
  type: 'Savings' | 'Investment' | 'DebtRepayment';
}

export interface UpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  type?: 'Savings' | 'Investment' | 'DebtRepayment';
  status?: 'Active' | 'Completed' | 'Paused';
}

export interface GoalProgress {
  goalId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  status: 'Active' | 'Completed' | 'Paused';
  milestones: Milestone[];
}

export interface Milestone {
  percentage: number;
  isAchieved: boolean;
  achievedAt?: string;
}
export const goalService = {

    async getGoals (){
        const response = await api.get<Goal[]>('/goals');
        return response.data;
    },
    async getGoalsByUserId (userId: number){
        const response = await api.get<Goal[]>(`/goals/user/${userId}`);
        return response.data;
    },
    async getGoalsById (id: number){
        const response = await api.get<Goal>(`/goals/${id}`);
        return response.data;
    },
    async createGoal (goal: CreateGoalRequest){
        const response = await api.post<Goal>('/goals', goal);
        return response.data;
    },
    async updateGoal (id: number, goal: UpdateGoalRequest){
        const response = await api.put<Goal>(`/goals/${id}`, goal);
        return response.data;
    },
    async deleteGoal (id: number){
        const response = await api.delete(`/goals/${id}`);
        return response.data;
    },
    async getGoalProgress (id: number){
        const response = await api.get<GoalProgress>(`/goals/${id}/progress`);
        return response.data;
    },
    async updateGoalProgress (){
        const response = await api.post('/goals/update-progress');
        return response.data;
    },
    async getGoalsNearingDeadline (daysThreshold: number = 30){
        const response = await api.get<Goal[]>(`/goals/nearing-deadline?daysThreshold=${daysThreshold}`);
        return response.data;
    },
    async getGoalMilestones (id: number){
        const response = await api.get<Milestone[]>(`/goals/${id}/milestones`);
        return response.data;
    },
    async getRecentAchievements (daysBack: number = 7){
        const response = await api.get<Goal[]>(`/goals/recent-achievements?daysBack=${daysBack}`);
        return response.data;
    },
    async checkGoalMilestones (id: number){
        const response = await api.post(`/goals/${id}/check-milestones`);
        return response.data;
    },
    async addContribution (id: number, contribution: any){
        const response = await api.post(`/goals/${id}/contribute`, contribution);
        return response.data;
    },
    async completeGoal (id: number, completion: any){
        const response = await api.post(`/goals/${id}/complete`, completion);
        return response.data;
    },
    async getContributions (id: number){
        const response = await api.get(`/goals/${id}/contributions`);
        return response.data;
    },
    async addTransactionContribution (goalId: number, transactionId: number, amount: number){
        const response = await api.post(`/goals/${goalId}/contribute-from-transaction/${transactionId}`, amount);
        return response.data;
    },
};
