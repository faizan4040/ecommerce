'use client'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import { IMAGES } from '@/routes/Images'
import { removeFromCart, increaseQuantity, decreaseQuantity } from '@/store/reducer/cartReducer'
import { WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import { BiMinus, BiPlus } from 'react-icons/bi'
import { MdDeleteOutline } from "react-icons/md";

const breadCrumb = {
  title: 'Cart',
  links: [{ label: 'Cart' }],
}

const CartPage = () => {
  const cart = useSelector((store) => store.cartStore)
  const dispatch = useDispatch()

  const [discount, setDiscount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [total, setTotal] = useState(0)
  const [promoOpen, setPromoOpen] = useState(false)

  // Recalculate subtotal, discount, total whenever cart or promo changes
  useEffect(() => {
    const subtotalCalc = cart.products.reduce(
      (sum, item) => sum + item.sellingPrice * item.qty,
      0
    )

    const discountCalc = cart.products.reduce(
      (sum, item) => sum + ((item.mrp - item.sellingPrice) * item.qty),
      0
    )

    setSubtotal(subtotalCalc)

    // Ensure discount does not exceed subtotal
    const validDiscount = Math.min(discountCalc, subtotalCalc)
    setDiscount(validDiscount)

    // Total = subtotal - discount - promoDiscount, never negative
    setTotal(Math.max(0, subtotalCalc - validDiscount - promoDiscount))
  }, [cart, promoDiscount])

  const handleQty = (type, product) => {
    if (type === 'inc') {
      dispatch(increaseQuantity({ productId: product.productId, variantId: product.variantId }))
    } else if (type === 'dec' && product.qty > 1) {
      dispatch(decreaseQuantity({ productId: product.productId, variantId: product.variantId }))
    }
  }

  const applyPromo = () => {
    if (!promoCode) return alert('Please enter a promo code')
    // Example: Flat ₹100 discount
    setPromoDiscount(100)
    alert(`Promo code "${promoCode}" applied! ₹100 off`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteBreadcrumb props={breadCrumb} />

      {cart.count === 0 ? (
        <div className="w-full h-screen flex justify-center items-center py-32">
          <div className="text-center">
            <h4 className="text-2xl font-semibold mb-4">Your cart is empty</h4>
            <Button asChild>
              <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-8xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">
            In your bag ({cart.count} Item{cart.count > 1 ? 's' : ''})
          </h2>

          <div className="grid grid-cols-12 gap-6">
            {/* Items List */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {cart.products.map((product) => (
                <div key={product.variantId} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-start">
                  <Image
                    src={product.media || IMAGES.image_placeholder}
                    width={120}
                    height={120}
                    alt={product.name}
                    className="rounded-lg object-cover border"
                  />

                  <div className="flex-1">
                    <Link
                      href={WEBSITE_PRODUCT_DETAILS(product.slug)}
                      className="text-lg font-medium line-clamp-1"
                    >
                      <h4 className="font-semibold">{product.name}</h4>
                    </Link>

                    <p className="text-sm text-gray-500 mt-1">Size: {product.size}</p>
                    <p className="text-sm text-gray-500 mt-1">Color: {product.color}</p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-3 w-32 border rounded-full overflow-hidden">
                      <button
                        onClick={() => handleQty('dec', product)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                      >
                        <BiMinus />
                      </button>
                      <input
                        value={product.qty}
                        readOnly
                        className="w-12 text-center border-none focus:outline-none text-sm"
                      />
                      <button
                        onClick={() => handleQty('inc', product)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                      >
                        <BiPlus />
                      </button>
                    </div>

                    <p className="mt-2 font-semibold text-lg">
                      {product.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: "INR" })}
                    </p>

                    <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                      <span>Total: {(product.sellingPrice * product.qty).toLocaleString('en-IN', { style: 'currency', currency: "INR" })}</span>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        onClick={() =>
                          dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId }))
                        }
                      >
                        <MdDeleteOutline/>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xl font-bold mb-2">Summary</h3>

                {/* Subtotal / Discount / Promo / Total */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span>-{discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Promo Discount</span>
                      <span>-{promoDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>

                  {/* Promo Code Input */}
                  <div className="mt-2">
                    <button
                      className="w-full text-left text-primary font-semibold hover:underline transition mb-2"
                      onClick={() => setPromoOpen(!promoOpen)}
                    >
                      {promoOpen ? 'Hide Promo Code' : 'Have a promo code?'}
                    </button>
                    {promoOpen && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => {
                            if (!promoCode) return alert('Please enter a promo code')
                            setPromoDiscount(100)
                            alert(`Promo code "${promoCode}" applied! ₹100 off`)
                          }}
                          className="bg-primary text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <Button className="w-full bg-primary text-white py-3 rounded-xl mb-3 hover:opacity-90 transition">
                  View Cart
                </Button>
                <Button className="w-full bg-primary text-white py-3 rounded-xl hover:opacity-90 transition">
                  Checkout
                </Button>
              </div>

              {/* Delivery & Info */}
              <div className="bg-white p-6 rounded-xl shadow-sm text-sm text-gray-500 space-y-2">
                <p>Delivery Calculator</p>
                <p>All our orders are Carbon neutral</p>
                <p>Members get priority order processing, create an Ultra account during checkout</p>
                <p>All taxes and duties are already included in the price.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
