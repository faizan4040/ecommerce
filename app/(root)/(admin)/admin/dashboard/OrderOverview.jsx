"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// FULL DATA (ALL)
const fullData = [
  { month: "Jan", amount: 40, click: 25 },
  { month: "Feb", amount: 55, click: 30 },
  { month: "Mar", amount: 48, click: 28 },
  { month: "Apr", amount: 30, click: 20 },
  { month: "May", amount: 60, click: 35 },
  { month: "Jun", amount: 52, click: 32 },
  { month: "Jul", amount: 58, click: 38 },
  { month: "Aug", amount: 45, click: 30 },
  { month: "Sep", amount: 50, click: 34 },
  { month: "Oct", amount: 62, click: 40 },
  { month: "Nov", amount: 55, click: 36 },
  { month: "Dec", amount: 68, click: 45 },
]

// FILTER LOGIC
const filterData = (range) => {
  if (range === "1M") return fullData.slice(-1)
  if (range === "6M") return fullData.slice(-6)
  if (range === "1Y") return fullData
  return fullData
}

// CHART CONFIG
const chartConfig = {
  amount: { label: "Page View", color: "var(--chart-1)" },
  click: { label: "Click", color: "#22c55e" },
}

export function OrderOverview() {
  const [activeRange, setActiveRange] = useState("All")

  const chartData = filterData(activeRange)

  return (
    <Card className="h-full flex flex-col">
      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        {/* LEFT */}
        <div className="text-sm font-semibold">Performance</div>

        {/* RIGHT FILTERS */}
        <div className="flex gap-4 text-sm font-medium text-muted-foreground">
          {["All", "1M", "6M", "1Y"].map((item) => (
            <button
              key={item}
              onClick={() => setActiveRange(item)}
              className={`transition ${
                activeRange === item
                  ? "text-primary"
                  : "hover:text-foreground cursor-pointer bg-gray-200 rounded-lg py-1 px-2"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>

      {/* CHART */}
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-65 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />

              {/* BAR */}
              <Bar
                dataKey="amount"
                fill="var(--color-amount)"
                radius={3}
                barSize={18}
                isAnimationActive
                animationDuration={600}
              />

              {/* GREEN LINE */}
              <Line
                type="monotone"
                dataKey="click"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">Page View</span>
        </div>

        {/* <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Click</span>
        </div> */}
      </CardFooter>
    </Card>
  )
}
