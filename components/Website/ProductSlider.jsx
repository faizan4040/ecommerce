"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Plus } from "lucide-react"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const MAX_PRODUCTS = 12

// Card backgrounds – cycles through these, like the reference (sage, brown, grey, …)
const CARD_COLORS = ["#6f8f6a", "#7a6252", "#a9adb3", "#5f8a6b", "#8a7e6b", "#6b7b8f"]

const formatPrice = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
    : ""

const getImage = (p) => p?.media?.[0]?.secure_url || p?.media?.[0]?.url || IMAGES.image_placeholder
const getBrand = (p) => (typeof p?.category === "object" && p.category?.name) || "KMF Shoes"

export default function ProductSlider() {
  const sliderRef = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [activeDot, setActiveDot] = useState(0)

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product?limit=${MAX_PRODUCTS}`
        )
        const list = Array.isArray(data?.data) ? data.data : []
        if (!cancelled) setProducts(list.slice(0, MAX_PRODUCTS)) // API already returns newest first
      } catch (err) {
        console.error("Failed to fetch latest products:", err)
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /* ---------- Arrow state + mobile dots ---------- */
  const updateScrollState = useCallback(() => {
    const el = sliderRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    const card = el.firstElementChild
    if (card) {
      const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0)
      setActiveDot(Math.round(el.scrollLeft / step))
    }
  }, [])

  useEffect(() => {
    updateScrollState()
    window.addEventListener("resize", updateScrollState)
    return () => window.removeEventListener("resize", updateScrollState)
  }, [products, updateScrollState])

  // Scroll by exactly one card (1 on phone, 2 on tablet, … all snap cleanly)
  const scrollByCard = (dir) => {
    const el = sliderRef.current
    const card = el?.firstElementChild
    if (!el || !card) return
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0)
    el.scrollBy({ left: dir * step, behavior: "smooth" })
  }

  const scrollToIndex = (i) => {
    const el = sliderRef.current
    const card = el?.children?.[i]
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" })
  }

  return (
    <section className="w-full px-4 py-12 sm:px-8 sm:py-16 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        {/* ---------- HEADER ---------- */}
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">
              Just landed
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              New in Footwear
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={WEBSITE_SHOP}
              className="hidden items-center gap-1.5 text-sm font-semibold text-neutral-900 transition hover:text-orange-500 md:inline-flex"
            >
              View all <ArrowRight size={16} />
            </Link>
            <ArrowButton dir={-1} disabled={!canPrev} onClick={() => scrollByCard(-1)} />
            <ArrowButton dir={1} disabled={!canNext} onClick={() => scrollByCard(1)} />
          </div>
        </div>

        {/* ---------- SLIDER ---------- */}
        {loading ? (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${CARD_WIDTH} shrink-0`}>
                <div className="h-[300px] animate-pulse rounded-[24px] bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">No products found.</p>
        ) : (
          <>
            <div
              ref={sliderRef}
              onScroll={updateScrollState}
              className="hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-6 pt-2"
            >
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  color={CARD_COLORS[i % CARD_COLORS.length]}
                  index={i}
                />
              ))}
            </div>

            {/* Dots (phone + tablet) */}
            <div className="mt-2 flex justify-center gap-1.5 lg:hidden">
              {products.map((p, i) => (
                <button
                  key={p._id}
                  type="button"
                  aria-label={`Go to product ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeDot ? "w-6 bg-orange-500" : "w-1.5 bg-neutral-300"
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center md:hidden">
              <Link
                href={WEBSITE_SHOP}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-neutral-900 px-6 py-2.5 text-sm font-semibold transition hover:bg-neutral-900 hover:text-white"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* Phone: 1 card · sm: 2 · md: 3 · lg+: 4   (widths account for the 24px gap) */
const CARD_WIDTH =
  "basis-full sm:basis-[calc(50%-10px)] md:basis-[calc(33.333%-13.34px)] lg:basis-[calc(25%-15px)] xl:basis-[calc(20%-16px)]"

/* ------------------------------------------------------------------ */

function ProductCard({ product, color, index }) {
  const href = WEBSITE_PRODUCT_DETAILS(product.slug)
  const word = (product.name || "").split(" ").slice(0, 2).join(" ").toUpperCase()
  const hasDiscount = product.discountPercentage > 0 && product.mrp > product.sellingPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.08, ease: "easeOut" }}
      className={`${CARD_WIDTH} group shrink-0 snap-start`}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[24px] p-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] transition-shadow duration-500 group-hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: color }}
      >
        {/* Big faded product name behind the shoe */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-6 select-none overflow-hidden whitespace-nowrap font-black leading-[0.85] tracking-tighter text-white/15"
        >
          <p className="text-[48px] transition-transform duration-700 group-hover:-translate-x-6">{word}</p>
          <p className="text-[48px] -translate-x-10 transition-transform duration-700 group-hover:translate-x-0">
            {word}
          </p>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute left-5 top-5 z-10 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-900">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}

        {/* Shoe image */}
        <Link href={href} className="relative z-[1] mb-2.5 block h-40 overflow-hidden rounded-[18px] bg-[#f3f3f3] sm:h-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImage(product)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* White info card */}
        <div className="relative z-[1] mt-auto rounded-[18px] bg-white p-3">
          <Link href={href}>
            <h3 className="line-clamp-1 text-sm font-bold text-neutral-900 transition group-hover:text-orange-600">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs text-neutral-400">{getBrand(product)}</p>

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-neutral-900">{formatPrice(product.sellingPrice)}</span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through">{formatPrice(product.mrp)}</span>
              )}
            </div>

            <Link
              href={href}
              aria-label={`View ${product.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/40 transition-all duration-300 hover:rotate-90 hover:scale-110 hover:bg-orange-600"
            >
              <Plus size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ArrowButton({ dir, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? "Previous" : "Next"}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${
        disabled
          ? "cursor-not-allowed border-neutral-200 text-neutral-300"
          : "cursor-pointer border-neutral-300 text-orange-500 shadow-sm hover:border-orange-500 hover:bg-orange-500 hover:text-white"
      }`}
    >
      {dir < 0 ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
    </button>
  )
}
