'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const ManualOrderDetails = () => {
  const { order_id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/manual/${order_id}`)
        const data = await res.json()
        setOrder(data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [order_id])

  if (loading) {
    return <p className="p-6 text-center">Loading order details...</p>
  }

  if (!order) {
    return <p className="p-6 text-center text-red-500">Order not found</p>
  }

  return (
    <>
      <BreadCrumb
        breadcrumbData={[
          { href: '/admin', label: 'Home' },
          { href: '/admin/manual-orders', label: 'Manual Orders' },
          { href: '', label: 'Order Details' },
        ]}
      />

      <div className="max-w-6xl mx-auto mt-6 space-y-6">

        {/* ===== ORDER HEADER ===== */}
        <Card className="rounded-2xl">
          <CardContent className="flex justify-between items-center py-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Manual Order #{order.order_id}
              </h2>
              <p className="text-sm text-gray-500">
                Created on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <Badge className="px-4 py-1 text-sm capitalize">
              {order.status || 'Pending'}
            </Badge>
          </CardContent>
        </Card>

        {/* ===== CUSTOMER DETAILS ===== */}
        <Card className="rounded-2xl">
          <CardHeader>
            <h3 className="text-lg font-semibold">Customer Details</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><b>Name:</b> {order.name}</p>
            <p><b>Email:</b> {order.email}</p>
            <p><b>Phone:</b> {order.phone}</p>
            <p><b>Address:</b> {order.address}</p>
          </CardContent>
        </Card>

        {/* ===== PRODUCT LIST ===== */}
        <Card className="rounded-2xl">
          <CardHeader>
            <h3 className="text-lg font-semibold">Products</h3>
          </CardHeader>

          <CardContent className="space-y-4">
            {order.products.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border rounded-xl p-4"
              >
                <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.qty} × ₹{item.price}
                  </p>
                </div>

                <div className="font-semibold">
                  ₹{item.qty * item.price}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ===== PRICE SUMMARY ===== */}
        <Card className="rounded-2xl">
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  )
}

export default ManualOrderDetails