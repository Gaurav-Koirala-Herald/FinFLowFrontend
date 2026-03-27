import React, { useEffect, useState, useCallback } from "react"
import {
  TrendingUp,
  TrendingDown,
  Brain,
  RefreshCw,
  Star,
  Activity,
  ChevronRight,
  Sparkles,
  PlusCircle,
  X,
  AlertCircle,
} from "lucide-react"
import {
  recommendationService,
  userService,
  watchlistService,
  portfolioService,
  marketService,
  type RecommendationDTO,
  type UserProfileDTO,
  type MarketSummaryDTO,
  type UserPreferenceUpdateDTO,
} from "../services/nepseAiService"
import { useAuth } from "../contexts/AuthContext";



const SECTORS = [
  "Banking", "Hydropower", "Insurance", "Finance",
  "Manufacturing", "Development Bank", "Microfinance",
]


const fmt = (n: number) => n.toLocaleString("en-NP")
const fmtM = (n: number) => n >= 1e9 ? `₨${(n / 1e9).toFixed(2)}B` : `₨${(n / 1e6).toFixed(1)}M`
const scoreColor = (s: number) => s >= 0.8 ? "#16a34a" : s >= 0.65 ? "#d97706" : "#dc2626"
const scoreBg = (s: number) => s >= 0.8 ? "#dcfce7" : s >= 0.65 ? "#fef3c7" : "#fee2e2"
const scoreLabel = (s: number) => s >= 0.8 ? "Strong Buy" : s >= 0.65 ? "Buy" : "Watch"


const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-bold" style={{ color }}>{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="h-1.5 bg-gray-200 rounded-full">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value * 100}%`, background: color }}
      />
    </div>
  </div>
)

const RiskBadge = ({ level }: { level: string }) => {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    Low: { bg: "bg-green-100", text: "text-green-700", label: "Low Risk" },
    Medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium Risk" },
    High: { bg: "bg-red-100", text: "text-red-700", label: "High Risk" },
  }
  const c = cfg[level] ?? cfg.Medium
  return (
    <span className={`${c.bg} ${c.text} text-xs font-bold px-3 py-1 rounded-full`}>
      {c.label}
    </span>
  )
}

const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700">
    <AlertCircle size={16} />
    <span className="text-sm flex-1">{message}</span>
    <button
      onClick={onRetry}
      className="text-xs font-semibold underline hover:no-underline"
    >
      Retry
    </button>
  </div>
)


interface PortfolioModalProps {
  symbol: string
  currentPrice: number
  onConfirm: (quantity: number, buyPrice: number) => void
  onClose: () => void
}

const PortfolioModal = ({ symbol, currentPrice, onConfirm, onClose }: PortfolioModalProps) => {
  const [quantity, setQuantity] = useState(1)
  const [buyPrice, setBuyPrice] = useState(currentPrice)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-base font-bold text-gray-900">Add {symbol} to Portfolio</h4>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Buy Price (₨)</label>
            <input
              type="number"
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            Total: <span className="font-bold text-gray-900">₨{fmt(quantity * buyPrice)}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(quantity, buyPrice)}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIRecommender() {
  const { user : currentUser } = useAuth();
  const CURRENT_USER_ID = currentUser?.userId || 0
  const userId = CURRENT_USER_ID

  // ── State ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<UserProfileDTO | null>(null)
  const [market, setMarket] = useState<MarketSummaryDTO | null>(null)
  const [recs, setRecs] = useState<RecommendationDTO[]>([])
  const [selected, setSelected] = useState<RecommendationDTO | null>(null)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"recommendations" | "profile">("recommendations")
  const [prefSectors, setPrefSectors] = useState<string[]>([])
  const [riskLevel, setRiskLevel] = useState<"Low" | "Medium" | "High">("Medium")
  const [portfolioModal, setPortfolioModal] = useState<RecommendationDTO | null>(null)

  // Loading states
  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [loadingRefresh, setLoadingRefresh] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [togglingWatch, setTogglingWatch] = useState<string | null>(null)
  const [addingPortfolio, setAddingPortfolio] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true)
      setError(null)
      try {
        const [profileData, marketData] = await Promise.all([
          userService.getProfile(userId.toString()),
          marketService.getMarketSummary(),
        ])
        setUser(profileData)
        setMarket(marketData)
        setPrefSectors(profileData.preferredSectors)
        setRiskLevel(profileData.riskLevel)

        const watchlistData = await watchlistService.getWatchlist(userId.toString())
        setWatchlist(watchlistData.map((w) => w.symbol))

        setLoadingRecs(true)
        const recsData = await recommendationService.getRecommendations(userId.toString())

        if (recsData && recsData.length > 0) {
          setRecs(recsData)
        } else {
          const fresh = await recommendationService.generateRecommendations({
            userId: userId.toString(),
            refreshExplanation: false,
          })
          setRecs(fresh ?? [])
        }
      } catch (err) {
        setError("Failed to load data. Please check your connection and try again.")
        console.error(err)
      } finally {
        setLoadingInit(false)
        setLoadingRecs(false)
      }
    }
    init()
  }, [userId])

  const handleRefresh = useCallback(async () => {
    setLoadingRefresh(true)
    setLoadingRecs(true)
    setError(null)
    setSelected(null)
    try {
      const [fresh, marketData] = await Promise.all([
        recommendationService.refreshRecommendations(userId.toString()),
        marketService.getMarketSummary(),
      ])
      setRecs(fresh ?? [])
      setMarket(marketData)
    } catch (err) {
      setError("Failed to refresh recommendations. Please try again.")
      console.error(err)
    } finally {
      setLoadingRefresh(false)
      setLoadingRecs(false)
    }
  }, [userId])

  const toggleWatchlist = async (symbol: string) => {
    setTogglingWatch(symbol)
    setError(null)
    try {
      if (watchlist.includes(symbol)) {
        await watchlistService.removeFromWatchlist(userId.toString(), symbol)
        setWatchlist((w) => w.filter((s) => s !== symbol))
      } else {
        await watchlistService.addToWatchlist(userId.toString(), { symbol })
        setWatchlist((w) => [...w, symbol])
      }
    } catch (err) {
      setError(`Failed to update watchlist for ${symbol}.`)
      console.error(err)
    } finally {
      setTogglingWatch(null)
    }
  }

  const handleAddPortfolio = async (quantity: number, buyPrice: number) => {
    if (!portfolioModal) return
    setAddingPortfolio(true)
    setError(null)
    try {
      await portfolioService.addToPortfolio(userId.toString(), {
        symbol: portfolioModal.symbol,
        quantity,
        buyPrice,
      })
      setPortfolioModal(null)
    } catch (err) {
      setError(`Failed to add ${portfolioModal.symbol} to portfolio.`)
      console.error(err)
    } finally {
      setAddingPortfolio(false)
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setError(null)
    try {
      const dto: UserPreferenceUpdateDTO = {
        riskLevel: riskLevel,
        preferredSectors: prefSectors,
        investmentAmount: user?.investmentAmount ?? 0,
        ownedStocks: user?.ownedStocks ?? [],
      }
      await userService.updatePreferences(userId.toString(), dto)
      setUser((u) => u ? { ...u, riskLevel, preferredSectors: prefSectors } : u)
      await handleRefresh()
    } catch (err) {
      setError("Failed to save preferences. Please try again.")
      console.error(err)
    } finally {
      setSavingProfile(false)
    }
  }

  if (loadingInit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-2">
              <Brain size={28} />
              <h1 className="text-3xl font-bold">AI Stock Recommender</h1>
            </div>
            <p className="text-blue-100 mt-1">Personalized picks powered by Gemini AI</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-7 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                <Brain size={18} className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-500 text-sm">Loading AI recommendations...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Brain size={28} />
              <h1 className="text-3xl font-bold">AI Stock Recommender</h1>
            </div>
            <p className="text-blue-100 mt-1">
              Personalized picks powered by Gemini AI
              {user && <span className="ml-2 opacity-75">· {user.name}</span>}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-blue-700 rounded-lg p-1">
              {(["recommendations", "profile"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === tab
                      ? "bg-white text-blue-700"
                      : "text-blue-100 hover:text-white"
                    }`}
                >
                  {tab === "recommendations" ? "AI Picks" : "My Profile"}
                </button>
              ))}
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${market?.isMarketOpen ? "bg-green-500" : "bg-red-500"
              }`}>
              {market?.isMarketOpen ? "Market Open" : "Market Closed"}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loadingRefresh}
              className="p-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
              title="Refresh recommendations"
            >
              <RefreshCw
                size={20}
                style={{ animation: loadingRefresh ? "spin 1s linear infinite" : "none" }}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {error && <ErrorBanner message={error} onRetry={handleRefresh} />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "NEPSE Index",
              value: market ? fmt(market.nepseIndex) : "—",
              change: market?.nepseChangePercent ?? 0,
              label: market ? `${market.nepseChangePercent >= 0 ? "+" : ""}${market.nepseChangePercent.toFixed(2)}%` : "—",
            },
            {
              title: "Total Turnover",
              value: market ? fmtM(market.totalTurnover) : "—",
              change: 1,
              label: "Today",
            },
            {
              title: "Advancing",
              value: market?.advancingStocks ?? "—",
              change: 1,
              label: "stocks up",
            },
            {
              title: "Declining",
              value: market?.decliningStocks ?? "—",
              change: -1,
              label: "stocks down",
            },
          ].map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className={`flex items-center mt-2 ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stat.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="ml-1 text-sm font-semibold">{stat.label}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.change >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <Activity className={stat.change >= 0 ? "text-green-600" : "text-red-600"} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {loadingRecs ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                <Brain size={18} className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-500 text-sm">
                {loadingRefresh ? "Regenerating AI recommendations..." : "Loading recommendations..."}
              </p>
            </div>
          </div>

        ) : activeTab === "recommendations" ? (

          <div className={`grid gap-6 ${selected ? "grid-cols-1 lg:grid-cols-[1fr_400px]" : "grid-cols-1"}`}>

            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                  <Sparkles size={13} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">
                    AI Picks for {user?.name ?? "You"}
                  </span>
                </div>
                {user && <RiskBadge level={user.riskLevel} />}
                {user && (
                  <span className="text-xs text-gray-500">
                    Sectors: {user.preferredSectors.join(", ")}
                  </span>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Top AI Recommendations</h3>
                </div>

                {recs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                    <Brain size={36} className="text-gray-300" />
                    <p className="text-sm">No recommendations yet.</p>
                    <button
                      onClick={handleRefresh}
                      className="text-sm text-blue-600 font-semibold hover:underline"
                    >
                      Generate now
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Symbol</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">LTP</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Change</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">AI Score</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Signal</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recs.map((rec, i) => (
                          <tr
                            key={rec.id}
                            onClick={() => setSelected(selected?.id === rec.id ? null : rec)}
                            className={`border-b border-gray-100 cursor-pointer transition-colors ${selected?.id === rec.id ? "bg-blue-50" : "hover:bg-gray-50"
                              }`}
                          >
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                                }`}>
                                {i + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-blue-600">{rec.symbol}</td>
                            <td className="py-3 px-4">
                              <div className="text-gray-900 text-sm">{rec.securityName}</div>
                              <div className="text-xs text-gray-400">{rec.sector}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">
                              ₨{fmt(rec.ltp)}
                            </td>
                            <td className={`py-3 px-4 text-right font-semibold ${rec.percentageChange >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                              <div className="flex items-center justify-end gap-1">
                                {rec.percentageChange >= 0
                                  ? <TrendingUp size={14} />
                                  : <TrendingDown size={14} />}
                                {rec.percentageChange >= 0 ? "+" : ""}{rec.percentageChange.toFixed(2)}%
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-bold text-gray-900">
                                  {(rec.score * 100).toFixed(0)}
                                </span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${rec.score * 100}%`, background: scoreColor(rec.score) }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: scoreBg(rec.score), color: scoreColor(rec.score) }}
                              >
                                {scoreLabel(rec.score)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleWatchlist(rec.symbol) }}
                                  disabled={togglingWatch === rec.symbol}
                                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                                  title={watchlist.includes(rec.symbol) ? "Remove from Watchlist" : "Add to Watchlist"}
                                >
                                  <Star
                                    size={15}
                                    className={watchlist.includes(rec.symbol) ? "text-yellow-500" : "text-gray-400"}
                                    fill={watchlist.includes(rec.symbol) ? "#eab308" : "none"}
                                  />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelected(rec) }}
                                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                  title="View Details"
                                >
                                  <ChevronRight size={15} className="text-gray-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {selected && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-4 h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
                <div className="flex justify-between items-start p-6 border-b border-gray-100">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{selected.symbol}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{selected.securityName}</div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900">₨{fmt(selected.ltp)}</div>
                    <div className={`flex items-center gap-1 mt-1 font-semibold ${selected.percentageChange >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                      {selected.percentageChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      ₨{Math.abs(selected.pointChange).toFixed(2)} ({Math.abs(selected.percentageChange).toFixed(2)}%)
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      AI Score Breakdown
                    </p>
                    <ScoreBar label="Trend (30d)" value={selected.trendScore} color="#2563eb" />
                    <ScoreBar label="Fundamentals" value={selected.fundamentalsScore} color="#7c3aed" />
                    <ScoreBar label="Sector Match" value={selected.sectorScore} color="#0891b2" />
                    <ScoreBar label="Risk Alignment" value={selected.riskScore} color="#16a34a" />
                    <ScoreBar label="Market Activity" value={selected.popularityScore} color="#d97706" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Fundamentals
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "P/E Ratio", value: selected.peRatio.toFixed(1) },
                        { label: "EPS", value: `₨${selected.eps}` },
                        { label: "52W High", value: `₨${selected.high52week}` },
                        { label: "52W Low", value: `₨${selected.low52week}` },
                        { label: "Volume", value: fmt(selected.volume) },
                        { label: "Market Cap", value: fmtM(selected.marketCap) },
                      ].map((f) => (
                        <div key={f.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-xs text-gray-500">{f.label}</div>
                          <div className="text-sm font-bold text-gray-900 mt-0.5">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Gemini AI Analysis
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.aiExplanation}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Generated {new Date(selected.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleWatchlist(selected.symbol)}
                      disabled={togglingWatch === selected.symbol}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold text-sm transition-colors disabled:opacity-60 ${watchlist.includes(selected.symbol)
                          ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Star
                        size={14}
                        fill={watchlist.includes(selected.symbol) ? "#ca8a04" : "none"}
                      />
                      {watchlist.includes(selected.symbol) ? "Watching" : "Watchlist"}
                    </button>
                    <button
                      onClick={() => setPortfolioModal(selected)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
                    >
                      <PlusCircle size={14} />
                      Add to Portfolio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        ) : (
          <div className="max-w-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Investment Profile</h3>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Risk Tolerance</p>
              <div className="flex gap-3">
                {(["Low", "Medium", "High"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskLevel(r)}
                    className={`flex-1 py-2.5 rounded-lg border font-semibold text-sm transition-all ${riskLevel === r
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Preferred Sectors</p>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setPrefSectors((ps) =>
                        ps.includes(s) ? ps.filter((x) => x !== s) : [...ps, s]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${prefSectors.includes(s)
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              {savingProfile ? (
                <>
                  <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Save & Regenerate Recommendations
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {portfolioModal && (
        <PortfolioModal
          symbol={portfolioModal.symbol}
          currentPrice={portfolioModal.ltp}
          onConfirm={handleAddPortfolio}
          onClose={() => setPortfolioModal(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}