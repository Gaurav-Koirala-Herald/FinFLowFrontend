"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import type { Transaction } from "../services/transactionService"


interface DynamicAreaChartProps {
  transactions: Transaction[]
  title?: string
  description?: string
}

type TimeRange = "weekly" | "monthly" | "yearly"

const chartConfig = {
  amount: {
    label: "Amount",
  },
  income: {
    label: "Income",
    color: "hsl(142, 76%, 36%)",
  },
  expense: {
    label: "Expense",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig

function CustomColoredTooltip({ active, payload, label, processedData }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = processedData.find((d: any) => d.date === label);
  const displayLabel = item ? item.period : label;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px]">
      <p className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-2">
        {displayLabel}
      </p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => {
          const isIncome = entry.dataKey === "income";
          const color = isIncome ? "#22c55e" : "#ef4444";
          const bgColor = isIncome ? "#dcfce7" : "#fee2e2";
          const label = isIncome ? "Income" : "Expense";

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-sm text-gray-600">
                  {label}
                </span>
              </div>
              <span
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{
                  color: color,
                  backgroundColor: bgColor
                }}
              >
                ${Number(entry.value).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DynamicAreaChart({
  transactions,
  title = "Transaction Overview",
  description = "Showing income and expenses over time"
}: DynamicAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("monthly")

  const processedData = React.useMemo(() => {
    if (transactions.length === 0) return []

    const groupedData: Record<string, { date: string; income: number; expense: number; period: string }> = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate)
      let key: string
      let displayDate: string

      if (timeRange === "weekly") {
        const weekNumber = getWeekNumber(date)
        const year = date.getFullYear()
        key = `${year}-W${weekNumber}`
        displayDate = `Week ${weekNumber}, ${year}`
      } else if (timeRange === "monthly") {
        const month = date.getMonth()
        const year = date.getFullYear()
        key = `${year}-${String(month + 1).padStart(2, '0')}`
        displayDate = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      } else {
        // Yearly
        const year = date.getFullYear()
        key = `${year}`
        displayDate = `${year}`
      }

      if (!groupedData[key]) {
        groupedData[key] = { date: key, income: 0, expense: 0, period: displayDate }
      }

      // Assuming transactionTypeId: 1 = Income, 2 = Expense
      if (transaction.transactionTypeId === 1) {
        groupedData[key].income += transaction.amount
      } else if (transaction.transactionTypeId === 2) {
        groupedData[key].expense += transaction.amount
      }
    })

    // Convert to array and sort
    return Object.values(groupedData).sort((a, b) =>
      a.date.localeCompare(b.date)
    )
  }, [transactions, timeRange])

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  const formatXAxis = (value: string) => {
    if (timeRange === "weekly") {
      const parts = value.split('-W')
      return `W${parts[1]}`
    } else if (timeRange === "monthly") {
      const [year, month] = value.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString("en-US", { month: "short" })
    } else {
      return value
    }
  }

  if (transactions.length === 0) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No transaction data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {timeRange === "weekly" && "Showing weekly income and expenses"}
            {timeRange === "monthly" && "Showing monthly income and expenses"}
            {timeRange === "yearly" && "Showing yearly income and expenses"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value as TimeRange)}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">
              Weekly
            </SelectItem>
            <SelectItem value="monthly">
              Monthly
            </SelectItem>
            <SelectItem value="yearly">
              Yearly
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={processedData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#22c55e"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#22c55e"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#ef4444"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#ef4444"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatXAxis}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip
              content={(props) => <CustomColoredTooltip {...props} processedData={processedData} />}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            />
            <Area
              dataKey="expense"
              type="natural"
              fill="url(#fillExpense)"
              stroke="#ef4444"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="#22c55e"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}