'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { zodResolver } from "@hookform/resolvers/zod"
import { FaStar } from "react-icons/fa"
import axios from "axios"
import Link from "next/link"

import { zSchema } from "@/lib/zodSchema"
import ButtonLoading from "../Application/ButtonLoading"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute"
import { showToast } from "@/lib/showToast"

/* ------------------------------------------------ */
const ProdcutReview = ({
  productId,
  average = 0,
  totalReviews = 0,
  ratingBreakdown = {},
}) => {
  const auth = useSelector(store => store.authStore.auth)

  const [currentUrl, setCurrentUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  /* Current URL for login redirect */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href)
    }
  }, [])

  /* Zod schema */
  const formSchema = zSchema.pick({
    productId: true,
    userId: true,
    rating: true,
    title: true,
    review: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId,
      userId: auth?._id || "",
      rating: 1,
      title: "",
      review: "",
    },
  })

  /* Update form when productId or auth changes */
  useEffect(() => {
    if (productId) {
      form.setValue("productId", productId)
    }
    if (auth?._id) {
      form.setValue("userId", auth._id)
    }
  }, [productId, auth])

  /* Submit */
  const handleReviewSubmit = async (values) => {
    try {
      setLoading(true)

      const payload = {
        ...values,
        rating: Number(values.rating),
      }

      const { data } = await axios.post("/api/review/create", payload)

      if (!data.success) {
        throw new Error(data.message)
      }

      showToast("success", data.message)

      form.reset({
        productId,
        userId: auth._id,
        rating: 1,
        title: "",
        review: "",
      })

      setShowForm(false)
    } catch (error) {
      showToast("error", error.message)
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------ */
  return (
    <div className="border rounded-xl bg-white shadow-sm mb-20">

      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-xl">
        <h2 className="text-2xl font-semibold">Ratings & Reviews</h2>
      </div>

      {/* Summary */}
      <div className="p-6 grid md:grid-cols-2 gap-10">

        {/* Average */}
        <div>
          <h3 className="text-6xl font-bold">{average.toFixed(1)}</h3>

          <div className="flex gap-1 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < Math.round(average)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>

          <p className="text-sm text-gray-600">
            Based on {totalReviews} reviews
          </p>

          {auth && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-5 px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition"
            >
              Write a review
            </button>
          )}
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] || 0
            const percent = totalReviews ? (count / totalReviews) * 100 : 0

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-6 text-sm font-medium">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-gray-600 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Login / Form */}
      <div className="p-6 border-t bg-gray-50">

        {!auth ? (
          <div className="flex items-center gap-4">
            <p>Please login to submit a review</p>
            <Button asChild>
              <Link href={`${WEBSITE_LOGIN}?callback=${currentUrl}`}>
                Login
              </Link>
            </Button>
          </div>
        ) : (
          showForm && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleReviewSubmit)}
                className="space-y-5 max-w-xl"
              >

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Great shoes!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rating */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Rating</FormLabel>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`cursor-pointer text-2xl ${
                              star <= field.value
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            onClick={() => field.onChange(star)}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Review */}
                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review</FormLabel>
                      <FormControl>
                        <textarea
                          rows="4"
                          className="w-full p-3 border rounded-md"
                          placeholder="Share your experience..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Submit Review"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                />
              </form>
            </Form>
          )
        )}
      </div>
    </div>
  )
}

export default ProdcutReview
