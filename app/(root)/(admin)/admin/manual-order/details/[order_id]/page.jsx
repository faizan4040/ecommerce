'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ADMIN_DASHBOARD, ADMIN_MANUAL_ORDERS_DETAILS } from '@/routes/AdminPanelRoute'

const ManualOrderDetails = () => {
  const { order_id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!order_id) return

    const fetchOrder = async () => {
      try {
        // Correct API path — matches /api/manual-order/[order_id]/route.js
        const res = await fetch(`/api/manual-order/${order_id}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        setOrder(data.data)
      } catch (err) {
        console.error('Fetch order error:', err)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [order_id])

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <p className="text-gray-500 animate-pulse">Loading order details...</p>
      </div>
    )
  }

  /* ── Not Found ── */
  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <p className="text-red-500 font-medium">Order not found.</p>
      </div>
    )
  }

  /* ── Status badge colours ── */
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const paymentColor = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Paid: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-700',
  }

  return (
    <>
      <BreadCrumb
        breadcrumbData={[
          { href: ADMIN_DASHBOARD, label: 'Home' },
          { href: ADMIN_MANUAL_ORDERS_DETAILS, label: 'Manual Orders' },
          { href: '', label: `Order #${order.order_id}` },
        ]}
      />

      <div className="max-w-4xl mx-auto mt-6 space-y-6 pb-10">

        {/* ── ORDER HEADER ── */}
        <Card className="rounded-2xl">
          <CardContent className="flex flex-wrap justify-between items-center gap-4 py-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Manual Order #{order.order_id}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(order.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={`px-4 py-1 text-sm capitalize ${
                  statusColor[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status || 'pending'}
              </Badge>

              <Badge
                className={`px-4 py-1 text-sm ${
                  paymentColor[order.paymentStatus] || 'bg-gray-100 text-gray-700'
                }`}
              >
                Payment: {order.paymentStatus || 'Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ── CUSTOMER DETAILS ── */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Customer Details</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            {[
              { label: 'Name', value: order.name },
              { label: 'Email', value: order.email || '—' },
              { label: 'Phone', value: order.phone },
              { label: 'Address', value: order.address },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {label}
                </span>
                <p className="font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── PRODUCT LIST ── */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Products</h3>
          </CardHeader>

          <CardContent className="space-y-3">
            {order.products?.length > 0 ? (
              order.products.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border rounded-xl p-4"
                >
                  {/* FIX: using item.media (correct field name from schema) */}
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.media ? (
                      <Image
                        src={item.media}
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

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {typeof item.category === 'object'
                        ? item.category?.name
                        : item.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.qty} × ₹{item.price}
                    </p>
                  </div>

                  <div className="font-semibold shrink-0 text-base">
                    ₹{item.qty * item.price}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No products found.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── PRICE SUMMARY ── */}
        <Card className="rounded-2xl">
          <CardContent className="space-y-3 text-sm pt-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>− ₹{order.discount}</span>
              </div>
            )}

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


















// 'use client'

// import { useParams } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import Image from 'next/image'
// import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'

// const ManualOrderDetails = () => {
//   const { order_id } = useParams()
//   const [order, setOrder] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await fetch(`/api/orders/manual/${order_id}`)
//         const data = await res.json()
//         setOrder(data.data)
//       } catch (err) {
//         console.error(err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchOrder()
//   }, [order_id])

//   if (loading) {
//     return <p className="p-6 text-center">Loading order details...</p>
//   }

//   if (!order) {
//     return <p className="p-6 text-center text-red-500">Order not found</p>
//   }

//   return (
//     <>
//       <BreadCrumb
//         breadcrumbData={[
//           { href: '/admin', label: 'Home' },
//           { href: '/admin/manual-orders', label: 'Manual Orders' },
//           { href: '', label: 'Order Details' },
//         ]}
//       />

//       <div className="max-w-6xl mx-auto mt-6 space-y-6">

//         {/* ===== ORDER HEADER ===== */}
//         <Card className="rounded-2xl">
//           <CardContent className="flex justify-between items-center py-6">
//             <div>
//               <h2 className="text-2xl font-semibold">
//                 Manual Order #{order.order_id}
//               </h2>
//               <p className="text-sm text-gray-500">
//                 Created on {new Date(order.createdAt).toLocaleString()}
//               </p>
//             </div>

//             <Badge className="px-4 py-1 text-sm capitalize">
//               {order.status || 'Pending'}
//             </Badge>
//           </CardContent>
//         </Card>

//         {/* ===== CUSTOMER DETAILS ===== */}
//         <Card className="rounded-2xl">
//           <CardHeader>
//             <h3 className="text-lg font-semibold">Customer Details</h3>
//           </CardHeader>
//           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             <p><b>Name:</b> {order.name}</p>
//             <p><b>Email:</b> {order.email}</p>
//             <p><b>Phone:</b> {order.phone}</p>
//             <p><b>Address:</b> {order.address}</p>
//           </CardContent>
//         </Card>

//         {/* ===== PRODUCT LIST ===== */}
//         <Card className="rounded-2xl">
//           <CardHeader>
//             <h3 className="text-lg font-semibold">Products</h3>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             {order.products.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-center gap-4 border rounded-xl p-4"
//               >
//                 <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
//                   {item.image ? (
//                     <Image
//                       src={item.image}
//                       alt={item.name}
//                       fill
//                       className="object-cover"
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center h-full text-xs text-gray-400">
//                       No Image
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex-1">
//                   <p className="font-medium">{item.name}</p>
//                   <p className="text-sm text-gray-500">
//                     Qty: {item.qty} × ₹{item.price}
//                   </p>
//                 </div>

//                 <div className="font-semibold">
//                   ₹{item.qty * item.price}
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         {/* ===== PRICE SUMMARY ===== */}
//         <Card className="rounded-2xl">
//           <CardContent className="space-y-3 text-sm">
//             <div className="flex justify-between">
//               <span>Subtotal</span>
//               <span>₹{order.subtotal}</span>
//             </div>

//             <Separator />

//             <div className="flex justify-between font-semibold text-lg">
//               <span>Total Amount</span>
//               <span>₹{order.totalAmount}</span>
//             </div>
//           </CardContent>
//         </Card>

//       </div>
//     </>
//   )
// }

// export default ManualOrderDetails