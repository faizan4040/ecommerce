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
import { Badge } from "@/components/ui/badge"

const StockOverview = () => {
  const { data, loading } = useFetch(
    "/api/dashboard/admin/stock-overview"
  )

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        Loading...
      </div>
    )
  }

  const stockTable = data?.data?.stockTable || []
  const mostSold = data?.data?.mostSold || []

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/*  STOCK TABLE */}
      <Card className="xl:col-span-2 rounded-2xl shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Product Stock Overview</CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {stockTable.map(row => (
                  <TableRow key={row.variantId}>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell>{row.totalSold}</TableCell>
                    <TableCell>{row.remainingStock}</TableCell>

                    <TableCell>
                      {row.status === "Out of Stock" && (
                        <Badge variant="secondary">Out of Stock</Badge>
                      )}
                      {row.status === "Low Stock" && (
                        <Badge variant="destructive">Low Stock</Badge>
                      )}
                      {row.status === "In Stock" && (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 MOST SOLD */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Most Sold Products</CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {mostSold.map(item => (
            <div
              key={item.variantId}
              className="flex justify-between items-center p-3 rounded-lg bg-muted"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.sku}</p>
              </div>
              <Badge>{item.totalSold} Sold</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}

export default StockOverview