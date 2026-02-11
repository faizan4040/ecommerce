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
  WEBSITE_PRODUCT_DETAILS,
  WEBSITE_ORDER_DETAILS,
} from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import useFetch from '@/hooks/useFetch'
import { addIntoCart, clearCart } from '@/store/reducer/cartReducer'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showToast } from '@/lib/showToast'
import { IMAGES } from '@/routes/Images'
import { z } from 'zod'
import Script from 'next/script'
import { useRouter } from 'next/navigation'


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
  const router = useRouter()
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cartStore)
  const auth = useSelector((state) => state.authStore)

  /* ---------------- COUPON STATE ---------------- */
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderConfirmation, setOrderConfirmation] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)

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
    ordernote: true,
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
    ordernote: '',
    userId: auth?._id,
  },
})


//get order id
const getOrderId = async (amount) => {
   try{
       const { data: orderIdData } = await axios.post('/api/payment/get-order-id',{ amount })
       if(!orderIdData.success) {
         throw new Error(orderIdData.message)
       }

       return { success: true, order_id: orderIdData.data }


   } catch(error){
      return { success: false, message: error.message }
   }
}

// razorpay setup
const placeOrder = async (formData) => {
  setPlacingOrder(true)

  try {
    const generateOrderId = await getOrderId(totalAmount)
    if (!generateOrderId.success) {
      throw new Error(generateOrderId.message)
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded')
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: totalAmount * 100,
      currency: 'INR',
      name: 'All Spikes',
      description: 'Payment for order',
      order_id: generateOrderId.order_id,

      handler: async function (response) {
        try {
          setSavingOrder(true)

          const products = cart.products.map((cartItem) => ({
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            name: cartItem.name,
            qty: cartItem.qty,
            mrp: cartItem.mrp,
            sellingPrice: cartItem.sellingPrice,
          }))

          const { data } = await axios.post('/api/payment/save-order', {
            ...formData,
            ...response,
            products,
            subtotal,
            discount,
            couponDiscount,
            totalAmount,
          })

          if (data.success) {
            showToast('success', data.message)
            dispatch(clearCart())
            orderForm.reset()
            router.push(
              WEBSITE_ORDER_DETAILS(response.razorpay_order_id)
            )
          } else {
            showToast('error', data.message)
          }
        } catch (err) {
          showToast('error', err.message)
        } finally {
          setSavingOrder(false)
        }
      },

      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },

      theme: {
        color: '#f97316',
      },
    }

    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', function (response) {
      showToast('error', response.error.description)
    })

    rzp.open()
  } catch (error) {
    showToast('error', error.message)
  } finally {
    setPlacingOrder(false)
  }
}





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

}

if(savingOrder) return <div className='h-screen w-screen fixed top-0 left-0 flex items-center'>
  <span>Loading...</span>
</div>


  return (
    <div>
      <WebsiteBreadcrumb props={breadCrumb} />

      <div className="flex flex-wrap lg:flex-nowrap gap-10 my-20 lg:px-32 px-4">

    <div className="lg:w-[70%] w-full">
  <div className="bg-white p-6 rounded-xl shadow-sm border">
   <div className="flex flex-row items-center gap-3 mb-6 border-b pb-3">
  <h2 className="text-xl font-semibold flex items-center gap-3">
    <img
      src={IMAGES.shipping}
      alt="Shipping"
      className="h-15 w-15 -mt-4"
      />
      <span className='font-semibold'>Shipping Details</span>
    </h2>
  </div>

    <Form {...orderForm}>
      <form
        onSubmit={orderForm.handleSubmit(placeOrder)}
        className="space-y-4"
      >

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FULL NAME */}
          <FormField
            control={orderForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PHONE */}
          <FormField
            control={orderForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
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
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter country"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STATE */}
          <FormField
            control={orderForm.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} />
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
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PINCODE */}
          <FormField
            control={orderForm.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pincode" {...field} />
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
              <FormItem>
                <FormLabel>Landmark</FormLabel>
                <FormControl>
                  <Input placeholder="Nearby landmark" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ORDER NOTE (FULL WIDTH) */}
        <FormField
          control={orderForm.control}
          name="ordernote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Note (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Any special delivery instructions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SUBMIT */}
      <ButtonLoading
        type="submit"
        text="Place Order"
        loading={placingOrder}
        className="w-full mt-6 cursor-pointer text-white hover:text-white bg-black rounded-full hover:bg-orange-500 transition-all duration-300"
      />

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

            <p className="text-center mt-4">
              <Link href={WEBSITE_SHOP} className="text-sm hover:underline">
                Continue Shopping
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Script src='https://checkout.razorpay.com/v1/checkout.js'/>
    </div>
  )
}

export default CheckOut


