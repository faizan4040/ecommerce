'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import useFetch from "@/hooks/useFetch"
import { statusBadge } from "@/lib/helperfunction"
import { IMAGES } from "@/routes/Images"
import Image from "next/image"
import { useEffect, useState } from "react"

const LatestOrder = () => {
  const [latestOrder, setLatestOrder] = useState([])
  const { data, loading } = useFetch(
    "/api/dashboard/admin/latest-order"
  )

  useEffect(() => {
    if (data?.success) {
      setLatestOrder(data.data)
    }
  }, [data])

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        Loading...
      </div>
    )
  }

  if (!latestOrder.length) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <Image
          src={IMAGES.logo}
          alt="No Orders"
          width={120}
          height={120}
        />
      </div>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm h-full bg-background -mt-4">
  {/* HEADER */}
  <CardHeader className="px-6 py-5 border-b flex flex-row items-center justify-between">
    <CardTitle className="text-lg font-semibold tracking-tight">
      Recent Orders
    </CardTitle>

    <span className="text-xs text-muted-foreground">
      Showing last {latestOrder.length} orders
    </span>
  </CardHeader>

  {/* CONTENT */}
  <CardContent className="p-4">
    {/* SCROLL CONTAINER */}
    <div className="relative max-h-80 overflow-y-auto">
      <Table className="table-fixed w-full">
        {/* STICKY HEADER */}
        <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
          <TableRow className="pr-4">
            <TableHead className="w-[22%]">Order ID</TableHead>
            <TableHead className="w-[22%]">Payment ID</TableHead>
            <TableHead className="w-[12%] text-center">Items</TableHead>
            <TableHead className="w-[20%]">Status</TableHead>
            <TableHead className="w-[16%] text-right pr-6">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {latestOrder.map((order, index) => (
            <TableRow
              key={order._id}
              className={`transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? "bg-muted/20" : ""
              }`}
            >
              <TableCell className="w-[22%] font-mono text-xs text-muted-foreground truncate">
                {order._id}
              </TableCell>

              <TableCell className="w-[22%] font-mono text-xs truncate">
                {order.payment_id || "—"}
              </TableCell>

              <TableCell className="w-[12%] text-center font-medium">
                {order.products?.length || 0}
              </TableCell>

              <TableCell className="w-[20%]">
                {statusBadge(order.status)}
              </TableCell>

              <TableCell className="w-[16%] text-right font-semibold pr-6">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>


  )
}

export default LatestOrder
