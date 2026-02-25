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
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { ADMIN_DASHBOARD, ADMIN_STOCK_SHOW } from "@/routes/AdminPanelRoute"
import { IMAGES } from "@/routes/AllImages"
import Image from "next/image"

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_STOCK_SHOW, label: 'Stock' },
]

const Stock = () => {
  const { data, loading } = useFetch("/api/dashboard/admin/stock-overview")

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center text-muted-foreground">
        Loading stock data...
      </div>
    )
  }

  const stockTable = data?.data?.stockTable || []

  // STATUS BADGE
  const renderStatus = (status) => {
    if (status === "Out of Stock") {
      return (
        <Badge className="bg-red-600 text-white flex w-fit items-center gap-1">
          <XCircle size={14} />
           Out of Stock
        </Badge>
      )
    }

    if (status === "Low Stock") {
      return (
        <Badge className="bg-yellow-500 text-black flex w-fit items-center gap-1 animate-pulse">
          <AlertTriangle size={14} />
          Low Stock
        </Badge>
      )
    }

    return (
      <Badge className="bg-green-600 text-white flex w-fit items-center gap-1">
        <CheckCircle size={14} />
         In Stock
      </Badge>
    )
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="py-4">
        <Card className="rounded-2xl shadow-sm w-full">
          <CardHeader className="border-b">
            <CardTitle>Product Stock Overview</CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            {/* ONLY TABLE SCROLLS */}
            <div className="max-h-125 overflow-y-auto">
              <Table>

                {/* TABLE HEADER */}
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-center">Sold</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                {/* TABLE BODY */}
                <TableBody>
                  {stockTable.map(row => (
                    <TableRow key={row.variantId} className="h-16">

                      {/* PRODUCT */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10">
                            <Image
                                src={
                                  row.image
                                    ? row.image.startsWith("http")
                                      ? row.image
                                      : `${process.env.NEXT_PUBLIC_API_URL}${row.image}`
                                    : IMAGES.image_placeholder
                                }
                                alt={row.productName}
                                fill
                                className="object-cover rounded-lg"
                              />
                          </div>

                          <div className="leading-tight">
                            <p className="font-medium text-sm">
                              {row.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {row.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* SOLD */}
                      <TableCell className="text-center font-medium">
                        {row.totalSold}
                      </TableCell>

                      {/* STOCK */}
                      <TableCell className="text-center font-medium">
                        {row.remainingStock}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>
                        {renderStatus(row.status)}
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Stock