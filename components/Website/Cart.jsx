'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { IMAGES } from '@/routes/Images'
import { removeFromCart } from '@/store/reducer/cartReducer'
import { Button } from '../ui/button'
import Link from 'next/link'
import { WEBSITE_CART, WEBSITE_CHECKOUT } from '@/routes/WebsiteRoute'
import { showToast } from '@/lib/showToast'

const Cart = () => {
  const cart = useSelector((state) => state.cartStore)
  const dispatch = useDispatch()

  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [open, setOpen] = useState(false)

  // Calculate subtotal and discount whenever cart changes
  useEffect(() => {
    const totalAmount = cart.products.reduce(
      (sum, product) => sum + product.sellingPrice * product.qty,
      0
    )

    const totalDiscount = cart.products.reduce(
      (sum, product) => sum + (product.mrp - product.sellingPrice) * product.qty,
      0
    )

    setSubtotal(totalAmount)
    setDiscount(totalDiscount)
  }, [cart])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Cart Icon */}
      <SheetTrigger className="relative cursor-pointer">
        <ShoppingBag size={26} className="text-gray-100 hover:text-orange-500 transition" />
        {cart.count > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-400 text-black text-xs px-2 py-0.5 rounded-full">
            {cart.count}
          </span>
        )}
      </SheetTrigger>

      {/* Sidebar */}
      <SheetContent className="w-160 sm:w-175 md:w-187.5 max-w-[95vw] flex flex-col px-0">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="text-2xl font-bold">
            My Cart ({cart.count})
          </SheetTitle>
        </SheetHeader>

        {/* Products */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-5">
          {cart.count === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag size={50} className="mb-3 opacity-40" />
              <p className="text-lg font-semibold">Your Cart Is Empty</p>
            </div>
          )}

          {cart.products.map((product) => (
            <div
              key={product.variantId}
              className="flex gap-4 p-3 cursor-pointer border rounded-xl shadow-sm hover:shadow-md transition"
            >
              <Image
                src={product.media || IMAGES.image_placeholder}
                width={90}
                height={90}
                alt={product.name}
                className="rounded-lg object-cover border"
              />

              <div className="flex-1">
                <h4 className="font-semibold leading-snug">{product.name}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{product.size} • {product.color}</p>

                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold text-primary">
                    {product.sellingPrice.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </span>

                  <button
                    onClick={() =>
                      dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId }))
                    }
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  Qty: <span className="font-semibold">{product.qty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.count > 0 && (
          <div className="border-t px-6 py-5 sticky bottom-0 bg-white">
            {/* Discount & Subtotal */}
            <div className="flex flex-col mb-4 text-lg font-semibold space-y-2">
              <div className="flex justify-between">
                <span>Discount</span>
                <span>
                  {discount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {subtotal.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button
                asChild
                className="w-full sm:w-[48%] bg-primary text-white py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition"
                onClick={() => setOpen(false)}
              >
                <Link href={WEBSITE_CART}>View Cart</Link>
              </Button>

              <Button
                asChild
                className="w-full sm:w-[48%] bg-primary text-white py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition"
                onClick={() => setOpen(false)}
              >
                {cart.count ? (
                  <Link href={WEBSITE_CHECKOUT}>Checkout</Link>
                ) : (
                  <button type="button" onClick={() => showToast('error', 'Your cart is empty')}>
                    Checkout
                  </button>
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default Cart
