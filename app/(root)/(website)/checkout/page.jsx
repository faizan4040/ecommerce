'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { CiCircleRemove } from "react-icons/ci";


import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import {
  WEBSITE_SHOP,
  WEBSITE_CHECKOUT,
  WEBSITE_PRODUCT_DETAILS,
} from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

import useFetch from '@/hooks/useFetch'
import { addIntoCart, clearCart } from '@/store/reducer/cartReducer'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showToast } from '@/lib/showToast'
import { IMAGES } from '@/routes/Images'
import z from 'zod'

/* ---------------- HELPERS ---------------- */
const formatPrice = (v) =>
  Number(v || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })

const getImageSrc = (media) => {
  if (!media) return IMAGES.image_placeholder
  if (typeof media === 'string') return media
  if (Array.isArray(media) && media[0]) {
    return media[0].url || media[0].path || IMAGES.image_placeholder
  }
  return IMAGES.image_placeholder
}

/* ---------------- BREADCRUMB ---------------- */
const breadCrumb = {
  title: 'Checkout',
  links: [{ label: 'Checkout' }],
}

const CheckOut = () => {
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cartStore)
  const auth = useSelector((state) => state.authStore)

  /* ---------------- COUPON STATE ---------------- */
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [isCouponApplied, setIsCouponApplied] = useState(false)

  /* ---------------- VERIFY CART ---------------- */
  const { data: verifiedResponse } = useFetch(
    '/api/cart-verification',
    'POST',
    { data: cart.products }
  )

  useEffect(() => {
    if (verifiedResponse?.success) {
      dispatch(clearCart())
      verifiedResponse.data.forEach((item) => {
        dispatch(addIntoCart(item))
      })
    }
  }, [verifiedResponse, dispatch])

  /* ---------------- PRICE CALCULATIONS ---------------- */
  const { subtotal, discount, totalAmount } = useMemo(() => {
    const products = cart.products || []

    const sub = products.reduce(
      (sum, p) => sum + p.sellingPrice * p.qty,
      0
    )

    const disc = products.reduce(
      (sum, p) => sum + (p.mrp - p.sellingPrice) * p.qty,
      0
    )

    const total = Math.max(sub - couponDiscount, 0)

    return { subtotal: sub, discount: disc, totalAmount: total }
  }, [cart.products, couponDiscount])

  /* ---------------- COUPON FORM ---------------- */
  const couponForm = useForm({
    resolver: zodResolver(
      zSchema.pick({
        code: true,
        minShoppingAmount: true,
      })
    ),
    defaultValues: {
      code: '',
      minShoppingAmount: subtotal,
    },
  })

  useEffect(() => {
    couponForm.setValue('minShoppingAmount', subtotal)
  }, [subtotal, couponForm])

  const applyCoupon = async (values) => {
    setCouponLoading(true)
    try {
      const { data } = await axios.post('/api/coupon/apply', values)

      if (!data.success) {
        throw new Error(data.message)
      }

      const discountAmount =
        (subtotal * data.data.discountPercentage) / 100

      setCouponDiscount(discountAmount)
      setCouponCode(values.code.toUpperCase())
      setIsCouponApplied(true)
      couponForm.reset()

      showToast('success', data.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponDiscount(0)
    setCouponCode('')
    setIsCouponApplied(false)
    showToast('success', 'Coupon removed')
  }

  /* ---------------- EMPTY CART ---------------- */
  if (cart.count === 0) {
    return (
      <div className="py-32 text-center">
        <h4 className="text-4xl font-semibold mb-5">Your cart is empty</h4>
        <Button asChild>
          <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
        </Button>
      </div>
    )
  }


  // place order
const orderFormSchema = zSchema
  .pick({
    name: true,
    email: true,
    phone: true,
    country: true,
    state: true,
    city: true,
    pincode: true,
    landmark: true,
    ordernot: true,
  })
  .extend({
    userId: z.string().optional(),
  })


const orderForm = useForm({
  resolver: zodResolver(orderFormSchema), 
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    landmark: '',
    ordernot: '',
    userId: auth?._id,
  },
})

// const placeOrder = async(formData) = {

// }

const submitOrder = (values) => {
  const payload = {
    ...values,
    products: cart.products,
    subtotal,
    discount,
    couponCode: isCouponApplied ? couponCode : null,
    couponDiscount,
    totalAmount,
  }

  console.log('ORDER PAYLOAD 👉', payload)

  // axios.post('/api/order/create', payload)
}


  return (
    <div>
      <WebsiteBreadcrumb props={breadCrumb} />

      <div className="flex flex-wrap lg:flex-nowrap gap-10 my-20 lg:px-32 px-4">

       <div className="lg:w-[70%] w-full">
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-6">Shipping Details</h2>

    <Form {...orderForm}>
      <form
        onSubmit={orderForm.handleSubmit(submitOrder)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >

        {/* NAME */}
        <FormField
          control={orderForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* EMAIL */}
        <FormField
          control={orderForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Email Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PHONE */}
        <FormField
          control={orderForm.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Phone Number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* COUNTRY */}
        <FormField
          control={orderForm.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* STATE */}
        <FormField
          control={orderForm.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CITY */}
        <FormField
          control={orderForm.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PINCODE */}
        <FormField
          control={orderForm.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Pincode" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LANDMARK */}
        <FormField
          control={orderForm.control}
          name="landmark"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormControl>
                <Input placeholder="Landmark" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ORDER NOTE */}
        <FormField
          control={orderForm.control}
          name="ordernot"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormControl>
                <Input placeholder="Order note (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SUBMIT */}
        <Button
          type="submit"
          className="md:col-span-2 mt-4 bg-black rounded-full cursor-pointer hover:bg-orange-500 transition-all duration-300"
        >
          Place Order
        </Button>

      </form>
    </Form>
  </div>
</div>


        <div className="lg:w-1/3 w-full">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

            {/* PRODUCTS */}
            <table className="w-full mb-4">
              <tbody>
                {cart.products.map((product) => (
                  <tr key={product.variantId}>
                    <td className="py-3">
                      <div className="flex gap-4">
                        <Image
                          src={getImageSrc(product.media)}
                          width={60}
                          height={60}
                          className="rounded"
                          alt={product.name}
                        />
                        <div>
                          <Link
                            href={WEBSITE_PRODUCT_DETAILS(product.url)}
                            className="font-medium line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm">Color: {product.color}</p>
                          <p className="text-sm">Size: {product.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-right">
                      {product.qty} × {formatPrice(product.sellingPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PRICE */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {formatPrice(discount)}</span>
              </div>

              {isCouponApplied && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-2">
                    Coupon ({couponCode})
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      <CiCircleRemove size={20}/>
                    </button>
                  </span>
                  <span>- {formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* COUPON FORM */}
            {!isCouponApplied && (
              <Form {...couponForm}>
                <form
                  onSubmit={couponForm.handleSubmit(applyCoupon)}
                  className="flex gap-3 mt-5"
                >
                  <FormField
                    control={couponForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Enter coupon code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ButtonLoading
                    type="submit"
                    text="Apply"
                    loading={couponLoading}
                  />
                </form>
              </Form>
            )}

            {/* CTA */}
            {/* <Button asChild className="w-full mt-6 rounded-full bg-black">
              <Link href={WEBSITE_CHECKOUT}>Proceed to Checkout</Link>
            </Button> */}

            <p className="text-center mt-4">
              <Link href={WEBSITE_SHOP} className="text-sm hover:underline">
                Continue Shopping
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckOut


