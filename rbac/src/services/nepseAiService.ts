import {api} from "./api"
// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommonResponseDTO {
  success: boolean
  message: string
  affectedRows?: number
}

export interface MarketSummaryDTO {
  nepseIndex: number
  nepseChangePercent: number
  totalTurnover: number
  advancingStocks: number
  decliningStocks: number
  unchangedStocks: number
  isMarketOpen: boolean
  lastUpdated: string
}

export interface UserProfileDTO {
  id: string
  name: string
  email: string
  riskLevel: "Low" | "Medium" | "High"
  preferredSectors: string[]
  investmentAmount: number
  ownedStocks: string[]
  createdAt: string
}

export interface UserPreferenceUpdateDTO {
  riskLevel: "Low" | "Medium" | "High"
  preferredSectors: string[]
  investmentAmount: number
  ownedStocks: string[]
}

export interface RecommendationRequestDTO {
  userId: string
  refreshExplanation: boolean
}

export interface RecommendationDTO {
  id: number
  userId: string
  symbol: string
  score: number
  trendScore: number
  fundamentalsScore: number
  sectorScore: number
  riskScore: number
  popularityScore: number
  aiExplanation: string
  generatedAt: string
  // Flattened stock fields from SP join
  securityName: string
  sector: string
  currentPrice: number
  ltp: number
  pointChange: number
  percentageChange: number
  priceChange30d: number
  peRatio: number
  marketCap: number
  volume: number
  high52week: number
  low52week: number
  eps: number
  bookValue: number
}

export interface WatchlistItemDTO {
  id: number
  userId: string
  symbol: string
  alertPrice?: number
  addedAt: string
  securityName: string
  sector: string
  currentPrice: number
  ltp: number
  pointChange: number
  percentageChange: number
  priceChange30d: number
  peRatio: number
  marketCap: number
  volume: number
  high52week: number
  low52week: number
  eps: number
  bookValue: number
}

export interface AddWatchlistDTO {
  symbol: string
  alertPrice?: number
}

export interface PortfolioItemDTO {
  id: number
  userId: string
  symbol: string
  quantity: number
  buyPrice: number
  boughtAt: string
  currentValue: number
  profitLoss: number
  profitLossPercent: number
  securityName: string
  sector: string
  currentPrice: number
  ltp: number
  pointChange: number
  percentageChange: number
}

export interface AddPortfolioDTO {
  symbol: string
  quantity: number
  buyPrice: number
}

// ─── Recommendation Service ───────────────────────────────────────────────────

export const recommendationService = {
  async getRecommendations(userId: string): Promise<RecommendationDTO[]> {
    const response = await api.get<RecommendationDTO[]>(`recommendations/${userId}`)
    return response.data
  },

  async generateRecommendations(dto: RecommendationRequestDTO): Promise<RecommendationDTO[]> {
    const response = await api.post<RecommendationDTO[]>(`recommendations`, dto)
    return response.data
  },

  async refreshRecommendations(userId: string): Promise<RecommendationDTO[]> {
    const response = await api.post<RecommendationDTO[]>(`recommendations`, {
      userId,
      refreshExplanation: true,
    })
    return response.data
  },
}

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  async getProfile(userId: string): Promise<UserProfileDTO> {
    const response = await api.get<UserProfileDTO>(`users/${userId}/profile`)
    return response.data
  },

  async updatePreferences(userId: string, dto: UserPreferenceUpdateDTO): Promise<CommonResponseDTO> {
    const response = await api.put<CommonResponseDTO>(`users/${userId}/preferences`, dto)
    return response.data
  },
}

// ─── Watchlist Service ────────────────────────────────────────────────────────

export const watchlistService = {
  async getWatchlist(userId: string): Promise<WatchlistItemDTO[]> {
    const response = await api.get<WatchlistItemDTO[]>(`users/${userId}/watchlist`)
    return response.data
  },

  async addToWatchlist(userId: string, dto: AddWatchlistDTO): Promise<CommonResponseDTO> {
    const response = await api.post<CommonResponseDTO>(`users/${userId}/watchlist`, dto)
    return response.data
  },

  async removeFromWatchlist(userId: string, symbol: string): Promise<CommonResponseDTO> {
    const response = await api.delete<CommonResponseDTO>(`users/${userId}/watchlist/${symbol}`)
    return response.data
  },
}

// ─── Portfolio Service ────────────────────────────────────────────────────────

export const portfolioService = {
  async getPortfolio(userId: string): Promise<PortfolioItemDTO[]> {
    const response = await api.get<PortfolioItemDTO[]>(`users/${userId}/portfolio`)
    return response.data
  },

  async addToPortfolio(userId: string, dto: AddPortfolioDTO): Promise<CommonResponseDTO> {
    const response = await api.post<CommonResponseDTO>(`users/${userId}/portfolio`, dto)
    return response.data
  },

  async removeFromPortfolio(userId: string, symbol: string): Promise<CommonResponseDTO> {
    const response = await api.delete<CommonResponseDTO>(`users/${userId}/portfolio/${symbol}`)
    return response.data
  },
}

// ─── Market Service ───────────────────────────────────────────────────────────

export const marketService = {
  async getMarketSummary(): Promise<MarketSummaryDTO> {
    const response = await api.get<MarketSummaryDTO>(`market/summary`)
    return response.data
  },

  async getTopGainers() {
    const response = await api.get(`market/gainers`)
    return response.data
  },

  async getTopLosers() {
    const response = await api.get(`market/losers`)
    return response.data
  },
}