"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import ProductBox from "./ProductBox"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const PER_PAGE = 8

export default function FeatureProduct() {
  const sectionRef = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(PER_PAGE)
  const [tab, setTab] = useState("All")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product`)
        if (!cancelled) setProducts(Array.isArray(data?.data) ? data.data : []) // newest first from API
      } catch (err) {
        console.error("Failed to fetch products:", err)
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Tabs = "All" + every category that has products
  const tabs = useMemo(() => {
    const names = [...new Set(products.map((p) => p.category?.name).filter(Boolean))]
    return ["All", ...names.slice(0, 6)]
  }, [products])

  const filtered = useMemo(
    () => (tab === "All" ? products : products.filter((p) => p.category?.name === tab)),
    [products, tab]
  )
  const shown = filtered.slice(0, visible)

  const changeTab = (t) => {
    setTab(t)
    setVisible(PER_PAGE)
  }

  return (
    <section ref={sectionRef} className="w-full px-4 py-14 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">
              <Sparkles className="h-3.5 w-3.5" /> For you
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Featured products
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Pick a colour, choose your size and add to cart – right from the card.
            </p>
          </div>

          <Link
            href={WEBSITE_SHOP}
            className="inline-flex items-center gap-1.5 self-start rounded-full border-2 border-neutral-900 px-5 py-2.5 text-sm font-semibold transition hover:bg-neutral-900 hover:text-white md:self-auto"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category tabs */}
        {tabs.length > 2 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => changeTab(t)}
                className={`relative shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition cursor-pointer ${
                  tab === t ? "text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="feature-tab"
                    className="absolute inset-0 rounded-full bg-neutral-900"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grid: phone 1 · tablet 2 · laptop 3 · desktop 4 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading &&
            Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="rounded-[30px] bg-white p-3 shadow-sm ring-1 ring-black/5">
                <div className="h-72 animate-pulse rounded-[24px] bg-neutral-200" />
                <div className="mt-4 space-y-2 px-2">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                  <div className="h-10 w-full animate-pulse rounded-full bg-neutral-100" />
                </div>
              </div>
            ))}

          <AnimatePresence mode="popLayout">
            {!loading &&
              shown.map((product, i) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductBox product={product} index={i} />
                </motion.div>
              ))}
          </AnimatePresence>

          {!loading && shown.length === 0 && (
            <p className="col-span-full py-16 text-center text-neutral-500">No products found.</p>
          )}
        </div>

        {/* Load more */}
        {!loading && filtered.length > 0 && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-sm text-neutral-500">
              Showing {shown.length} of {filtered.length}
            </p>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: `${(shown.length / filtered.length) * 100}%` }}
              />
            </div>
            {visible < filtered.length && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PER_PAGE)}
                className="mt-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-500 cursor-pointer"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
