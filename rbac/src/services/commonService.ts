import {api} from './api';
export interface TransactionTypeDTO {
  id: number;
  name: string;
}

export interface TransactionCategoryDTO {
  id: number;
  name: string;
}
export const commonService = {
  async getTransactionTypes(): Promise<TransactionTypeDTO[]> {
    const response = await api.get<TransactionTypeDTO[]>('select-list/transaction-types');
    return response.data;
  },

  async getTransactionCategories(): Promise<TransactionCategoryDTO[]> {
    const response = await api.get<TransactionCategoryDTO[]>('select-list/transaction-category');
    return response.data;
  }
}
