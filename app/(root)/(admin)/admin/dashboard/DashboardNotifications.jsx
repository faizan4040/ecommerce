'use client'

import React, { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { FiAlertTriangle, FiTrendingUp, FiCheckCircle } from "react-icons/fi"

const DashboardNotifications = () => {
  const [lowStock, setLowStock] = useState([])
  const [mostSold, setMostSold] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("/api/dashboard/admin/stock-report")

        if (res.data?.success) {
          setLowStock(res.data.data.lowStock || [])
          setMostSold(res.data.data.mostSold || [])
        }
      } catch (error) {
        console.error("Dashboard API error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-500">Loading dashboard...</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* LOW STOCK */}
      <Card className="bg-red-50 border-red-300 rounded-2xl shadow-lg">
        <CardHeader className="flex items-center gap-2">
          <FiAlertTriangle className="text-red-600 w-6 h-6 animate-pulse" />
          <h4 className="text-lg font-bold text-red-700">
            Low Stock Alerts
          </h4>
        </CardHeader>

        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {lowStock.length ? (
            lowStock.map(item => (
              <div
                key={item._id}
                className="flex justify-between items-center p-3 bg-red-100 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-red-700">
                    {item.product?.name}
                  </p>
                  <p className="text-xs text-red-600">
                    SKU: {item.sku}
                  </p>
                </div>

                <span className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse">
                  {item.stock} left
                </span>
              </div>
            ))
          ) : (
            <p className="text-green-700 flex items-center gap-2">
              <FiCheckCircle /> All stock healthy
            </p>
          )}
        </CardContent>
      </Card>

      {/* MOST SOLD */}
      <Card className="bg-green-50 border-green-300 rounded-2xl shadow-lg">
        <CardHeader className="flex items-center gap-2">
          <FiTrendingUp className="text-green-600 w-6 h-6" />
          <h4 className="text-lg font-bold text-green-700">
            Most Sold Products
          </h4>
        </CardHeader>

        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {mostSold.length ? (
            mostSold.map(item => (
              <div
                key={item.variantId}
                className="flex justify-between items-center p-3 bg-green-100 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-green-800">
                    {item.productName}
                  </p>
                  <p className="text-xs text-green-600">
                    SKU: {item.sku}
                  </p>
                </div>

                <span className="px-3 py-1 text-xs font-bold bg-green-600 text-white rounded-full">
                  {item.totalSold} sold
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No sales yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardNotifications