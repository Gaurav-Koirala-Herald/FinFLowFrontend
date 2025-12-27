// src/services/nepseService.ts
import { api } from './api';

export interface IndexData {
  id: number;
  auditId: number | null;
  exchangeIndexId: number | null;
  generatedTime: string;
  index: string;
  close: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  perChange: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currentValue: number;
}

export interface NepseIndexResponse {
  "Sensitive Float Index": IndexData;
  "Float Index": IndexData;
  "Sensitive Index": IndexData;
  "NEPSE Index": IndexData;
}

export interface StockPrice {
  symbol: string;
  ltp: number;
  cp: number | null;
  pointChange: number;
  percentageChange: number;
  securityName: string;
  securityId: number;
}

export interface NepseStatus {
  isOpen: "OPEN" | "CLOSED";
  asOf: string;
  id: number;
}

export const nepseService = {
  async getNepseIndex(): Promise<NepseIndexResponse> {
    const response = await api.get<NepseIndexResponse>('NepseIndex');
    return response.data;
  },

  async getTopGainers(): Promise<StockPrice[]> {
    const response = await api.get<StockPrice[]>('TopGainers');
    return response.data;
  },

  async getTopLosers(): Promise<StockPrice[]> {
    const response = await api.get<StockPrice[]>('TopLosers');
    return response.data;
  },

  async isNepseOpen(): Promise<NepseStatus> {
    const response = await api.get<NepseStatus>('IsNepseOpen');
    return response.data;
  }
};