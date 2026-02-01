import { api, type CommonDTO } from './api'

export interface AccountDTO {
    id: number
    userId: number
    accountTypeId: number
    accountName: string
    createdAt: Date
    IsActive: boolean
    accountBalance: number
}
export interface AddAccountDTO {
    userId: number
    accountTypeId: number
    accountName: string
    accountBalance: number
}
export interface UpdateAccountDTO {
    accountTypeId?: number
    accountName?: string
    accountBalance?: number
    userId?: number
    id ?: number
}
export const accountsService = {
    async getAllAccounts(userId: number) {
        const response = await api.get<AccountDTO[]>(`/accounts/${userId}`);
        return response.data as AccountDTO[];
    },
    async addAccount(payload: AddAccountDTO) {
        const response = await api.post<CommonDTO>('/accounts', payload);
        return response.data;
    },
    async getActiveAccounts() {
        const response = await api.get<AccountDTO[]>('/accounts/active');
        return response.data as AccountDTO[];
    },
    async updateAccount(payload: UpdateAccountDTO) {
        const response = await api.put('/accounts/', payload);
        return response.data;
    },
    async deleteAccount(userId:number,accountId :number) {
        const response = await api.delete(`/accounts/?userId=${userId}&accountId=${accountId}`);
        return response.data;
    }

}