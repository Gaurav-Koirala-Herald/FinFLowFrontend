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
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = "Low" | "Medium" | "High"

interface StockDTO {
  symbol: string
  securityName: string
  sector: string
  currentPrice: number
  pointChange: number
  percentageChange: number
  priceChange30Days: number
  peRatio: number
  marketCap: number
  volume: number
  high52Week: number
  low52Week: number
  eps: number
}

interface RecommendationDTO {
  id: number
  stock: StockDTO
  score: number
  trendScore: number
  fundamentalsScore: number
  sectorScore: number
  riskScore: number
  popularityScore: number
  aiExplanation: string
  generatedAt: Date
}

interface UserProfileDTO {
  id: string
  name: string
  riskLevel: RiskLevel
  preferredSectors: string[]
  investmentAmount: number
  ownedStocks: string[]
}

interface MarketSummaryDTO {
  nepseIndex: number
  nepseChangePercent: number
  totalTurnover: number
  advancingStocks: number
  decliningStocks: number
  isMarketOpen: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USER: UserProfileDTO = {
  id: "u1",
  name: "Aarav Shrestha",
  riskLevel: "Medium",
  preferredSectors: ["Banking", "Hydropower"],
  investmentAmount: 500000,
  ownedStocks: ["NABIL", "CHCL"],
}

const MOCK_MARKET: MarketSummaryDTO = {
  nepseIndex: 2187.43,
  nepseChangePercent: 1.24,
  totalTurnover: 4823450000,
  advancingStocks: 134,
  decliningStocks: 87,
  isMarketOpen: true,
}

const MOCK_RECOMMENDATIONS: RecommendationDTO[] = [
  {
    id: 1,
    stock: { symbol: "NICA", securityName: "NIC Asia Bank Ltd.", sector: "Banking", currentPrice: 512.3, pointChange: 18.4, percentageChange: 3.73, priceChange30Days: 8.2, peRatio: 14.2, marketCap: 42000000000, volume: 245000, high52Week: 580, low52Week: 390, eps: 36.1 },
    score: 0.87, trendScore: 0.82, fundamentalsScore: 0.78, sectorScore: 1.0, riskScore: 1.0, popularityScore: 0.72,
    aiExplanation: "NIC Asia Bank presents a compelling investment opportunity given your medium-risk profile and preference for banking stocks. The bank has demonstrated consistent earnings growth with an EPS of 36.1 and maintains a healthy P/E ratio of 14.2, suggesting it's not overvalued relative to peers. The 30-day price momentum of +8.2% indicates strong buying interest. Risk disclaimer: Stock prices can be volatile and past performance does not guarantee future results.",
    generatedAt: new Date(),
  },
  {
    id: 2,
    stock: { symbol: "UPPER", securityName: "Upper Tamakoshi Hydropower Ltd.", sector: "Hydropower", currentPrice: 278.5, pointChange: 6.2, percentageChange: 2.28, priceChange30Days: 5.4, peRatio: 18.7, marketCap: 38000000000, volume: 189000, high52Week: 320, low52Week: 210, eps: 14.9 },
    score: 0.81, trendScore: 0.68, fundamentalsScore: 0.71, sectorScore: 1.0, riskScore: 0.9, popularityScore: 0.65,
    aiExplanation: "Upper Tamakoshi aligns well with your sector preference for hydropower. As Nepal's largest hydropower project, it benefits from long-term power purchase agreements ensuring stable revenue. The current price offers a reasonable entry point below its 52-week high. Risk disclaimer: Hydropower stocks can be affected by seasonal variations, regulatory changes, and water level fluctuations.",
    generatedAt: new Date(),
  },
  {
    id: 3,
    stock: { symbol: "NIFRA", securityName: "Nepal Infrastructure Bank", sector: "Development Bank", currentPrice: 98.7, pointChange: 3.1, percentageChange: 3.24, priceChange30Days: 11.3, peRatio: 11.4, marketCap: 8500000000, volume: 312000, high52Week: 115, low52Week: 72, eps: 8.66 },
    score: 0.76, trendScore: 0.91, fundamentalsScore: 0.85, sectorScore: 0.3, riskScore: 0.5, popularityScore: 0.88,
    aiExplanation: "Nepal Infrastructure Bank shows exceptionally strong momentum with an 11.3% price gain over 30 days. The low P/E of 11.4 suggests potential undervaluation. However, it falls outside your preferred sectors — consider this as a diversification opportunity. Risk disclaimer: Development banks carry higher credit and liquidity risks compared to commercial banks.",
    generatedAt: new Date(),
  },
  {
    id: 4,
    stock: { symbol: "SHIVM", securityName: "Shiva Shree Hydropower Ltd.", sector: "Hydropower", currentPrice: 215.0, pointChange: -4.5, percentageChange: -2.05, priceChange30Days: -3.1, peRatio: 22.1, marketCap: 4200000000, volume: 98000, high52Week: 265, low52Week: 180, eps: 9.72 },
    score: 0.71, trendScore: 0.42, fundamentalsScore: 0.62, sectorScore: 1.0, riskScore: 0.5, popularityScore: 0.41,
    aiExplanation: "While Shiva Shree is experiencing short-term price weakness, the underlying fundamentals remain intact for a medium-term recovery. The short-term dip could present a buying opportunity if you're comfortable with a 3–6 month horizon. Risk disclaimer: Smaller hydropower companies face execution and grid connectivity risks.",
    generatedAt: new Date(),
  },
  {
    id: 5,
    stock: { symbol: "GBIME", securityName: "Global IME Bank Ltd.", sector: "Banking", currentPrice: 376.8, pointChange: 9.8, percentageChange: 2.67, priceChange30Days: 6.7, peRatio: 16.3, marketCap: 56000000000, volume: 421000, high52Week: 420, low52Week: 285, eps: 23.1 },
    score: 0.83, trendScore: 0.75, fundamentalsScore: 0.74, sectorScore: 1.0, riskScore: 1.0, popularityScore: 0.94,
    aiExplanation: "Global IME Bank is one of Nepal's largest commercial banks with a strong branch network and consistently growing deposits. At a P/E of 16.3, it is fairly valued and aligns with your medium-risk, banking-sector preference. Risk disclaimer: Banking stocks are sensitive to interest rate policy changes from Nepal Rastra Bank.",
    generatedAt: new Date(),
  },
]

const SECTORS = ["Banking", "Hydropower", "Insurance", "Finance", "Manufacturing", "Development Bank", "Microfinance"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("en-NP")
const fmtM = (n: number) => n >= 1e9 ? `₨${(n / 1e9).toFixed(2)}B` : `₨${(n / 1e6).toFixed(1)}M`
const scoreColor = (s: number) => s >= 0.8 ? "#16a34a" : s >= 0.65 ? "#d97706" : "#dc2626"
const scoreBg = (s: number) => s >= 0.8 ? "#dcfce7" : s >= 0.65 ? "#fef3c7" : "#fee2e2"
const scoreLabel = (s: number) => s >= 0.8 ? "Strong Buy" : s >= 0.65 ? "Buy" : "Watch"

// ─── ScoreBar (light theme) ───────────────────────────────────────────────────

const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-bold" style={{ color }}>{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="h-1.5 bg-gray-200 rounded-full">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value * 100}%`, background: color }} />
    </div>
  </div>
)

// ─── RiskBadge (light theme) ──────────────────────────────────────────────────

const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const cfg = {
    Low: { bg: "bg-green-100", text: "text-green-700", label: "Low Risk" },
    Medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium Risk" },
    High: { bg: "bg-red-100", text: "text-red-700", label: "High Risk" },
  }[level]
  return (
    <span className={`${cfg.bg} ${cfg.text} text-xs font-bold px-3 py-1 rounded-full`}>
      {cfg.label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIRecommender() {
  const [user] = useState<UserProfileDTO>(MOCK_USER)
  const [market] = useState<MarketSummaryDTO>(MOCK_MARKET)
  const [recs, setRecs] = useState<RecommendationDTO[]>(MOCK_RECOMMENDATIONS)
  const [selected, setSelected] = useState<RecommendationDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [watchlist, setWatchlist] = useState<string[]>(["UPPER"])
  const [activeTab, setActiveTab] = useState<"recommendations" | "profile">("recommendations")
  const [prefSectors, setPrefSectors] = useState<string[]>(user.preferredSectors)
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(user.riskLevel)

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    setAiLoading(true)
    await new Promise((r) => setTimeout(r, 2200))
    setLoading(false)
    setAiLoading(false)
    setRecs([...MOCK_RECOMMENDATIONS].sort(() => Math.random() - 0.3))
  }, [])

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((w) => w.includes(symbol) ? w.filter((s) => s !== symbol) : [...w, symbol])
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header — matches NepseDashboard exactly ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Brain size={28} />
              <h1 className="text-3xl font-bold">AI Stock Recommender</h1>
            </div>
            <p className="text-blue-100 mt-1">Personalized picks powered by Gemini AI</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Tab switcher */}
            <div className="flex bg-blue-700 rounded-lg p-1">
              {(["recommendations", "profile"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === tab ? "bg-white text-blue-700" : "text-blue-100 hover:text-white"
                  }`}
                >
                  {tab === "recommendations" ? "AI Picks" : "My Profile"}
                </button>
              ))}
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${market.isMarketOpen ? "bg-green-500" : "bg-red-500"}`}>
              {market.isMarketOpen ? "Market Open" : "Market Closed"}
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition"
            >
              <RefreshCw size={20} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* ── Market Stat Cards — same style as NepseDashboard StatCard ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "NEPSE Index", value: fmt(market.nepseIndex), change: market.nepseChangePercent },
            { title: "Total Turnover", value: fmtM(market.totalTurnover), change: 0.8 },
            { title: "Advancing", value: market.advancingStocks, change: 1 },
            { title: "Declining", value: market.decliningStocks, change: -1 },
          ].map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className={`flex items-center mt-2 ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stat.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="ml-1 text-sm font-semibold">
                      {stat.title === "NEPSE Index" ? `${stat.change >= 0 ? "+" : ""}${stat.change.toFixed(2)}%` : stat.change >= 0 ? "Up today" : "Down today"}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.change >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <Activity className={stat.change >= 0 ? "text-green-600" : "text-red-600"} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {aiLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                <Brain size={18} className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-500 text-sm">Analyzing market data with AI...</p>
            </div>
          </div>
        ) : activeTab === "recommendations" ? (

          <div className={`grid gap-6 ${selected ? "grid-cols-1 lg:grid-cols-[1fr_400px]" : "grid-cols-1"}`}>

            {/* ── Recommendations List ── */}
            <div>
              {/* Sub-header */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                  <Sparkles size={13} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">AI Picks for {user.name}</span>
                </div>
                <RiskBadge level={user.riskLevel} />
                <span className="text-xs text-gray-500">Sectors: {user.preferredSectors.join(", ")}</span>
              </div>

              {/* Table card — same style as StockTable */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Top AI Recommendations</h3>
                </div>
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
                          className={`border-b border-gray-100 cursor-pointer transition-colors ${
                            selected?.id === rec.id ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold ${
                              i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-blue-600">{rec.stock.symbol}</td>
                          <td className="py-3 px-4">
                            <div className="text-gray-900 text-sm">{rec.stock.securityName}</div>
                            <div className="text-xs text-gray-400">{rec.stock.sector}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            ₨{fmt(rec.stock.currentPrice)}
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${rec.stock.percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            <div className="flex items-center justify-end gap-1">
                              {rec.stock.percentageChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {rec.stock.percentageChange >= 0 ? "+" : ""}{rec.stock.percentageChange.toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-gray-900">{(rec.score * 100).toFixed(0)}</span>
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
                                onClick={(e) => { e.stopPropagation(); toggleWatchlist(rec.stock.symbol) }}
                                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                title="Add to Watchlist"
                              >
                                <Star
                                  size={15}
                                  className={watchlist.includes(rec.stock.symbol) ? "text-yellow-500" : "text-gray-400"}
                                  fill={watchlist.includes(rec.stock.symbol) ? "#eab308" : "none"}
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
              </div>
            </div>

            {/* ── Detail Panel ── */}
            {selected && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-4 h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
                {/* Panel header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{selected.stock.symbol}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{selected.stock.securityName}</div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Price block */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900">₨{fmt(selected.stock.currentPrice)}</div>
                    <div className={`flex items-center gap-1 mt-1 font-semibold ${selected.stock.percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {selected.stock.percentageChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      ₨{Math.abs(selected.stock.pointChange).toFixed(2)} ({Math.abs(selected.stock.percentageChange).toFixed(2)}%)
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">AI Score Breakdown</p>
                    <ScoreBar label="Trend (30d)" value={selected.trendScore} color="#2563eb" />
                    <ScoreBar label="Fundamentals" value={selected.fundamentalsScore} color="#7c3aed" />
                    <ScoreBar label="Sector Match" value={selected.sectorScore} color="#0891b2" />
                    <ScoreBar label="Risk Alignment" value={selected.riskScore} color="#16a34a" />
                    <ScoreBar label="Market Activity" value={selected.popularityScore} color="#d97706" />
                  </div>

                  {/* Fundamentals grid */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Fundamentals</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "P/E Ratio", value: selected.stock.peRatio.toFixed(1) },
                        { label: "EPS", value: `₨${selected.stock.eps}` },
                        { label: "52W High", value: `₨${selected.stock.high52Week}` },
                        { label: "52W Low", value: `₨${selected.stock.low52Week}` },
                        { label: "Volume", value: fmt(selected.stock.volume) },
                        { label: "Market Cap", value: fmtM(selected.stock.marketCap) },
                      ].map((f) => (
                        <div key={f.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-xs text-gray-500">{f.label}</div>
                          <div className="text-sm font-bold text-gray-900 mt-0.5">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Gemini AI Analysis</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.aiExplanation}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleWatchlist(selected.stock.symbol)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold text-sm transition-colors ${
                        watchlist.includes(selected.stock.symbol)
                          ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Star size={14} fill={watchlist.includes(selected.stock.symbol) ? "#ca8a04" : "none"} />
                      {watchlist.includes(selected.stock.symbol) ? "Watching" : "Watchlist"}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
                      <PlusCircle size={14} />
                      Add to Portfolio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        ) : (
          /* ── Profile Tab ── */
          <div className="max-w-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Investment Profile</h3>

            {/* Risk level */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Risk Tolerance</p>
              <div className="flex gap-3">
                {(["Low", "Medium", "High"] as RiskLevel[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskLevel(r)}
                    className={`flex-1 py-2.5 rounded-lg border font-semibold text-sm transition-all ${
                      riskLevel === r
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Preferred Sectors</p>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrefSectors((ps) => ps.includes(s) ? ps.filter((x) => x !== s) : [...ps, s])}
                    className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                      prefSectors.includes(s)
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
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              <Sparkles size={16} />
              Regenerate AI Recommendations
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}