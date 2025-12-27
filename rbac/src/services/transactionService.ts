import {api} from './api'

export interface Transaction {
  id: number
  userId: number
  name: string
  description: string
  categoryId: number
  transactionTypeId: number
  amount: number
  transactionDate: string
}

export interface TransactionDto {
  id?: number
  userId: number
  name: string
  description: string
  categoryId: number
  transactionTypeId: number
  amount: number
  transactionDate: string
}

export const transactionService = {
  getAllTransactions: async (userId: number) => {
    const response = await api.get<Transaction[]>(`transactions/${userId}`)
    return response.data
  },

  createTransaction: async (dto: TransactionDto) => {
    const response = await api.post<Transaction>('transactions', dto)
    return response.data
  },

  updateTransaction: async (id: number, dto: TransactionDto) => {
    const response = await api.put<Transaction>(`transactions/${id}`, dto)
    return response.data
  },

  deleteTransaction: async (id: number) => {
    const response = await api.delete(`transactions/${id}`)
    return response.data
  }
}