'use client'

import React from 'react'
import useFetch from '@/hooks/useFetch'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const breadcrumbData = [
  { href: '/admin/dashboard', label: 'Home' },
  { href: '', label: 'Manual Orders' },
]

const ManualOrdersList = () => {
  const { data, loading } = useFetch('/api/orders/manual')

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mt-4 rounded-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Manual Orders</h2>
        </CardHeader>

        <CardContent>
          {loading && <p>Loading...</p>}

          {!loading && data?.data?.length === 0 && (
            <p>No manual orders found</p>
          )}

          {!loading && data?.data?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Order ID</th>
                    <th className="p-2 border">Customer</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {data.data.map((order) => (
                    <tr key={order._id}>
                      <td className="p-2 border">{order.order_id}</td>
                      <td className="p-2 border">{order.name}</td>
                      <td className="p-2 border">{order.phone}</td>
                      <td className="p-2 border">₹{order.totalAmount}</td>
                      <td className="p-2 border">{order.status}</td>
                      <td className="p-2 border">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ManualOrdersList