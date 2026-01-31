"use client"

import React from "react"
import { Pie, PieChart, Sector, Label } from "recharts"
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LatestOrder from "./LatestOrder"
import LatestReview from "./LatestReview"
import MapOverview from "./MapOverview"

/* ------------------ PIE CHART DATA ------------------ */
const desktopData = [
  { status: "pending", count: 186, fill: "var(--color-pending)" },
  { status: "processing", count: 305, fill: "var(--color-processing)" },
  { status: "shipped", count: 237, fill: "var(--color-shipped)" },
  { status: "delivered", count: 173, fill: "var(--color-delivered)" },
  { status: "cancelled", count: 209, fill: "var(--color-cancelled)" },
  { status: "unverified", count: 209, fill: "var(--color-unverified)" },
]

const chartConfig = {
  status: { label: "Status" },
  pending: { label: "Pending", color: "var(--chart-1)" },
  processing: { label: "Processing", color: "var(--chart-2)" },
  shipped: { label: "Shipped", color: "var(--chart-3)" },
  delivered: { label: "Delivered", color: "var(--chart-4)" },
  cancelled: { label: "Cancelled", color: "var(--chart-5)" },
  unverified: { label: "Unverified", color: "var(--chart-6)" },
}

/* ------------------ MAIN COMPONENT ------------------ */
const OrderStatus = () => {
  const id = "pie-interactive"
  const [activeStatus, setActiveStatus] = React.useState(desktopData[0].status)

  const activeIndex = React.useMemo(
    () => desktopData.findIndex((i) => i.status === activeStatus),
    [activeStatus]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* ================= CARD 1 : PIE CHART ================= */}
      <Card className="flex flex-col">
        <ChartStyle id={id} config={chartConfig} />

        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current Week</CardDescription>
          </div>

          <Select value={activeStatus} onValueChange={setActiveStatus}>
            <SelectTrigger className="h-7 w-36">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent align="end">
              {desktopData.map((item) => (
                <SelectItem key={item.status} value={item.status}>
                  {chartConfig[item.status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex justify-center">
          <ChartContainer
            id={id}
            config={chartConfig}
            className="aspect-square w-full max-w-65"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={desktopData}
                dataKey="count"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={({ outerRadius = 0, ...props }) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) =>
                    viewBox?.cx && (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan className="text-3xl font-bold fill-foreground">
                          {desktopData[activeIndex]?.count || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy={24}
                          className="fill-muted-foreground text-sm"
                        >
                          {chartConfig[activeStatus]?.label}
                        </tspan>
                      </text>
                    )
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ================= CARD 2 : MAP ================= */}
       <MapOverview />

      {/* ================= CARD 3 : TABLE ================= */}
      <div>
          <LatestReview/>
      </div>
    </div>
  )
}

export default OrderStatus
