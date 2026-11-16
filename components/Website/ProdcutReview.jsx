'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, MessageSquarePlus, PenLine, Star, X } from "lucide-react"
import { zSchema } from "@/lib/zodSchema"
import { showToast } from "@/lib/showToast"
import useFetch from "@/hooks/useFetch"
import Reviewlist from "./Reviewlist"

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]

function Stars({ value = 0, className = "h-5 w-5" }) {
  return (
    <span className="relative inline-flex">
      <span className="flex gap-0.5 text-neutral-200">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${className} fill-current`} />)}
      </span>
      <span className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400" style={{ width: `${(Math.min(value, 5) / 5) * 100}%` }}>
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${className} shrink-0 fill-current`} />)}
      </span>
    </span>
  )
}

export default function ProductReview({ productId }) {
  const queryClient = useQueryClient()
  const auth = useSelector((s) => s.authStore.auth)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [hover, setHover] = useState(0)

  const { data: reviewDetails } = useFetch(`/api/review/details?productId=${productId}`)
  const summary = reviewDetails?.success ? reviewDetails.data : { totalReviews: 0, averageRating: 0, rating: {} }
  const average = Number(summary.averageRating) || 0
  const total = summary.totalReviews || 0
  const breakdown = summary.rating || {}

  const form = useForm({
    resolver: zodResolver(zSchema.pick({ productId: true, userId: true, rating: true, title: true, review: true })),
    defaultValues: { productId, userId: auth?._id || "", rating: 0, title: "", review: "" },
  })
  const { register, handleSubmit, setValue, watch, reset, formState } = form
  const errors = formState.errors
  const ratingValue = watch("rating")
  const reviewText = watch("review") || ""

  useEffect(() => {
    if (productId) setValue("productId", productId)
    if (auth?._id) setValue("userId", auth._id)
  }, [productId, auth, setValue])

  const openForm = () => {
    if (!auth) return showToast("error", "Please log in to write a review.")
    setShowForm((s) => !s)
  }

  const onSubmit = async (values) => {
    if (!auth) return showToast("error", "Please log in to submit a review.")
    if (!values.rating) return showToast("error", "Please choose a star rating.")
    try {
      setLoading(true)
      const { data } = await axios.post("/api/review/create", { ...values, rating: Number(values.rating) }, { withCredentials: true })
      if (!data.success) throw new Error(data.message)
      showToast("success", data.message)
      reset({ productId, userId: auth._id, rating: 0, title: "", review: "" })
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ["product-review"] })
    } catch (error) {
      showToast("error", error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["product-review", productId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get(`/api/review/get?productId=${productId}&page=${pageParam}`)
      if (!data.success) throw new Error(data.message)
      return data.data
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last?.nextPage ?? false,
  })
  const reviews = data?.pages?.flatMap((p) => p.reviews) || []

  return (
    <div className="rounded-[28px] border bg-white p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">Customer reviews</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Ratings & reviews</h2>
        </div>
        <button
          type="button"
          onClick={openForm}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition cursor-pointer ${
            showForm ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200" : "bg-neutral-900 text-white hover:bg-orange-500"
          }`}
        >
          {showForm ? <X className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Summary */}
        <div className="h-fit rounded-3xl bg-neutral-50 p-6 lg:sticky lg:top-28">
          <div className="flex items-center gap-4">
            <p className="text-6xl font-extrabold tracking-tight">{average.toFixed(1)}</p>
            <div>
              <Stars value={average} />
              <p className="mt-1 text-sm text-neutral-500">Based on {total} review{total === 1 ? "" : "s"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star] || 0
              const pct = total ? (count / total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="flex w-9 items-center gap-1 font-semibold">
                    {star} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-amber-400"
                    />
                  </div>
                  <span className="w-8 text-right text-neutral-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form + list */}
        <div>
          <AnimatePresence initial={false}>
            {showForm && (
              <motion.form
                onSubmit={handleSubmit(onSubmit)}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mb-8 space-y-5 rounded-3xl border-2 border-orange-100 bg-orange-50/40 p-5 sm:p-6">
                  <div>
                    <p className="mb-2 text-sm font-semibold">How would you rate it?</p>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <motion.button
                            key={s}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => setHover(s)}
                            onClick={() => setValue("rating", s, { shouldValidate: true })}
                            aria-label={`${s} star`}
                            className="cursor-pointer"
                          >
                            <Star className={`h-9 w-9 transition-colors ${s <= (hover || ratingValue) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`} />
                          </motion.button>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-amber-600">{LABELS[hover || ratingValue]}</span>
                    </div>
                    {errors.rating && <p className="mt-1 text-xs text-red-500">Please choose a rating.</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Title</label>
                    <input
                      {...register("title")}
                      placeholder="Sum it up – e.g. Super comfy for long runs"
                      className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 flex justify-between text-sm font-semibold">
                      Your review <span className="font-normal text-neutral-400">{reviewText.length}/1000</span>
                    </label>
                    <textarea
                      {...register("review")}
                      rows={4}
                      maxLength={1000}
                      placeholder="How was the fit, comfort and quality?"
                      className="w-full rounded-2xl border bg-white p-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                    />
                    {errors.review && <p className="mt-1 text-xs text-red-500">{errors.review.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 disabled:opacity-60 cursor-pointer"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit review
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {reviews.length === 0 && !isFetching ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-14 text-center">
              <MessageSquarePlus className="h-10 w-10 text-neutral-300" />
              <p className="mt-3 font-semibold">No reviews yet</p>
              <p className="mt-1 text-sm text-neutral-500">Be the first to share how they fit.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review, i) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.05 }}
                >
                  <Reviewlist review={review} />
                </motion.div>
              ))}
            </div>
          )}

          {isFetching && (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
            </p>
          )}

          {hasNextPage && !isFetching && reviews.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                className="rounded-full border-2 border-neutral-900 px-7 py-2.5 text-sm font-semibold transition hover:bg-neutral-900 hover:text-white cursor-pointer"
              >
                Load more reviews
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
