'use client'
import useFetch from '@/hooks/useFetch'
import { IMAGES } from '@/routes/Images'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import Image from 'next/image'
import Link from 'next/link'
import React, { use, useEffect, useState } from 'react'

const OrderDetails = ({ params }) => {
  const { orderid } = use(params)
  const [orderData, setOrderData] = useState()
  const {data, loading} = useFetch(`/api/orders/get/${orderid}`)


  useEffect(()=>{
   if(data && data.success){
    setOrderData(data.data)
   }
  },[data])

  return (
    <div>
     

      <div className='lg:px-32 px-5 my-20'>
        {orderData && !orderData.success ?
          <div className='flex justify-center items-center py-32'>
            <h4 className='text-red-600 text-xl font-semibold'>Order Not Found</h4>
          </div>
          :
          <div>
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 text-sm">

                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900">
                    {orderData?.data?.order_id || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-semibold text-gray-900">
                    {orderData?.data?.payment_id || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize
                    ${orderData?.data?.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : orderData?.data?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {orderData?.data?.status || 'unknown'}
                  </span>
                </div>

              </div>
            </div>

            <div className="overflow-x-auto ">
              <table className="w-full border-collapse border border-gray-200 ">
                {/* Table Head */}
                <thead className="bg-gray-100 ">
                  <tr>
                    <th className="text-start p-3 text-gray-700 font-semibold">Product</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Price</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Quantity</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Total</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {orderData?.data?.products?.map((product) => (
                    <tr
                      key={product.variantId._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Info */}
                      <td className="p-3 flex items-center gap-4">
                        <Image
                          src={product?.variantId?.media[0]?.secure_url || IMAGES.image_placeholder}
                          width={60}
                          height={60}
                          alt={product?.productId?.name}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <Link
                            href={WEBSITE_PRODUCT_DETAILS(product?.productId?.slug)}
                            className="font-medium text-gray-800 hover:underline"
                          >
                            {product?.productId?.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">Color: {product?.variantId?.color}</p>
                          <p className="text-sm text-gray-500">Size: {product?.variantId?.size}</p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="text-center p-3 text-gray-700 font-medium">
                        {product.sellingPrice.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>

                      {/* Quantity */}
                      <td className="text-center p-3 text-gray-700 font-medium">{product.qty}</td>

                      {/* Total */}
                      <td className="text-center p-3 text-gray-900 font-semibold">
                        {(product.qty * product.sellingPrice).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-10">
              {/* Shipping Address */}
              <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold mb-4 border-b pb-2">Shipping Address</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{orderData?.data?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{orderData?.data?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{orderData?.data?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span>{orderData?.data?.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Country:</span>
                    <span>{orderData?.data?.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">State:</span>
                    <span>{orderData?.data?.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">City:</span>
                    <span>{orderData?.data?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pincode:</span>
                    <span>{orderData?.data?.pincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Landmark:</span>
                    <span>{orderData?.data?.landmark}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Order Note:</span>
                    <span>{orderData?.data?.ordernote || '...'}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span>{orderData?.data?.subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Discount</span>
                    <span>{orderData?.data?.discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Coupon Discount</span>
                    <span>{orderData?.data?.couponDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between mt-4 pt-2 border-t text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{orderData?.data?.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        }

      </div>
    </div>
  )
}

export default OrderDetails


























// 'use client'
// import useFetch from "@/hooks/useFetch";
// import { IMAGES } from "@/routes/Images";
// import { WEBSITE_PRODUCT_DETAILS } from "@/routes/WebsiteRoute";
// import Image from "next/image";
// import Link from "next/link";
// import React, { use, useEffect, useState } from "react";

// const OrderDetails =  ({ params }) => {
//   const { orderid } = use(params)
//   const [orderData, setOrderData] = useState()
//   const {data, loading} = useFetch(`/api/orders/get/${orderid}`)


//   useEffect(()=>{
//    if(data && data.success){
//     setOrderData(data.data)
//    }
//   },[data])

//   const order = orderData?.data;


//   if (!orderData?.success) {
//     return (
//       <div className="py-32 text-center text-red-600 font-semibold">
//         Order Not Found
//       </div>
//     );
//   }

//   return (
//     <div>
     

//       <div className="max-w-7xl mx-auto px-5 py-10 space-y-8">

//         {/* 🔹 TOP BANNER (reduced height) */}
//         <div className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center">
//           <div>
//             <h2 className="text-lg font-bold text-gray-900">
//               #{order.order_id}
//             </h2>
//             <p className="text-sm text-gray-500">
//               {new Date(order.createdAt).toLocaleString()}
//             </p>
//           </div>

//           <span className={`px-4 py-1 rounded-full text-sm font-semibold
//             ${order.status === "success"
//               ? "bg-green-100 text-green-700"
//               : order.status === "pending"
//               ? "bg-yellow-100 text-yellow-700"
//               : "bg-red-100 text-red-700"}`}
//           >
//             {order.status}
//           </span>
//         </div>

//         {/* 🔹 PROGRESS + SUMMARY */}
//         <div className="grid md:grid-cols-3 gap-6">

//           {/* LEFT – ORDER PROGRESS */}
//           <div className="md:col-span-2 bg-white border rounded-lg p-6">
//             <h3 className="font-semibold mb-4">Order Progress</h3>

//             <ul className="space-y-3 text-sm">
//               <li className="font-medium text-green-700">✔ Order Confirmed</li>
//               <li className={order.status === "pending" ? "text-yellow-600" : ""}>
//                 Payment {order.status === "pending" ? "Pending" : "Completed"}
//               </li>
//               <li>Processing</li>
//               <li>Shipping</li>
//               <li>Delivered</li>
//             </ul>

//             <p className="mt-4 text-xs text-gray-500">
//               Estimated shipping date:{" "}
//               {new Date(
//                 new Date(order.createdAt).getTime() + 2 * 86400000
//               ).toDateString()}
//             </p>
//           </div>

//           {/* RIGHT – ORDER SUMMARY */}
//           <div className="bg-white border rounded-lg p-6">
//             <h3 className="font-semibold mb-4">Order Summary</h3>

//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Sub Total</span>
//                 <span>₹{order.subtotal}</span>
//               </div>
//               <div className="flex justify-between text-red-600">
//                 <span>Discount</span>
//                 <span>-₹{order.discount + order.couponDiscount}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Delivery Charge</span>
//                 <span>₹0</span>
//               </div>
//               <div className="border-t pt-3 flex justify-between font-bold">
//                 <span>Total Amount</span>
//                 <span>₹{order.totalAmount}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 🔹 PRODUCTS + PAYMENT */}
//         <div className="grid md:grid-cols-3 gap-6">

//           {/* PRODUCTS TABLE */}
//           <div className="md:col-span-2 bg-white border rounded-lg p-6">
//             <h3 className="font-semibold mb-4">Products</h3>

//             <table className="w-full text-sm">
//               <tbody>
//                 {order.products.map((product) => (
//                   <tr key={product.variantId._id} className="border-b">
//                     <td className="py-3 flex gap-3 items-center">
//                       <Image
//                         src={
//                           product?.variantId?.media?.[0]?.url ||
//                           IMAGES.image_placeholder
//                         }
//                         width={50}
//                         height={50}
//                         className="rounded-lg border"
//                         alt=""
//                       />
//                       <div>
//                         <Link
//                           href={WEBSITE_PRODUCT_DETAILS(
//                             product.productId.slug
//                           )}
//                           className="font-medium"
//                         >
//                           {product.productId.name}
//                         </Link>
//                         <p className="text-xs text-gray-500">
//                           {product.variantId.color} / {product.variantId.size}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="text-center">×{product.qty}</td>
//                     <td className="text-right font-semibold">
//                       ₹{product.qty * product.sellingPrice}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* PAYMENT INFO */}
//           <div className="bg-white border rounded-lg p-6">
//             <h3 className="font-semibold mb-4">Payment Information</h3>
//             <p className="text-sm">Method: <b>Online</b></p>
//             <p className="text-sm">Transaction ID:</p>
//             <p className="font-mono text-xs mt-1">{order.payment_id}</p>
//           </div>
//         </div>

//         {/* 🔹 CUSTOMER + TIMELINE */}
//         <div className="grid md:grid-cols-3 gap-6">

//           {/* ORDER TIMELINE */}
//           <div className="md:col-span-2 bg-white border rounded-lg p-6">
//             <h3 className="font-semibold mb-4">Order Timeline</h3>
//             <ul className="space-y-3 text-sm text-gray-700">
//               <li>✔ Order Confirmed</li>
//               <li>Invoice Created</li>
//               <li>Invoice Sent</li>
//               <li>Payment Successful</li>
//             </ul>
//           </div>

//           {/* CUSTOMER DETAILS */}
//           <div className="bg-white border rounded-lg p-6">
//             <h3 className="font-semibold mb-4">Customer Details</h3>
//             <p className="font-medium">{order.name}</p>
//             <p className="text-sm">{order.email}</p>
//             <p className="text-sm">{order.phone}</p>

//             <div className="mt-4 text-sm">
//               <p className="font-semibold">Shipping Address</p>
//               <p>
//                 {order.address}, {order.city}, {order.state},{" "}
//                 {order.country} - {order.pincode}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* 🔹 FOOTER */}
//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-white border rounded-lg p-6 text-sm">
//             <p><b>Vendor:</b> Catpiller</p>
//             <p><b>Date:</b> {new Date(order.createdAt).toDateString()}</p>
//             <p><b>Paid By:</b> {order.name}</p>
//             <p><b>Reference:</b> #{order.order_id}</p>
//           </div>

//           {/* GOOGLE MAP */}
//           <div className="bg-white border rounded-lg overflow-hidden">
//             <iframe
//               width="100%"
//               height="250"
//               loading="lazy"
//               src={`https://www.google.com/maps?q=${encodeURIComponent(
//                 `${order.city}, ${order.country}`
//               )}&output=embed`}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetails;





