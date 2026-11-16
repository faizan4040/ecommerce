'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import axios from "axios"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Diamond,
  Feather,
  Footprints,
  Heart,
  MessageSquarePlus,
  Play,
  ShoppingCart,
  Star,
  Wind,
} from "lucide-react"
import { toggleWishlist } from "@/store/reducer/wishlistReducer"
import { showToast } from "@/lib/showToast"
import { calcDiscount, formatINR } from "@/lib/pricing"
import { SIZE_CHARTS, sizeLabel } from "@/lib/shoeSizes"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import ProdcutReview from "@/components/Website/ProdcutReview"
import Drawer from "@/components/Website/Drawer"

dayjs.extend(relativeTime)

const Container = ({ className = "", children, ...rest }) => (
  <section className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`} {...rest}>
    {children}
  </section>
)

function Stars({ value = 0, size = "h-4 w-4" }) {
  return (
    <span className="relative inline-flex">
      <span className="flex gap-0.5 text-neutral-200">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${size} fill-current`} />)}
      </span>
      <span className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400" style={{ width: `${(Math.min(value, 5) / 5) * 100}%` }}>
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${size} shrink-0 fill-current`} />)}
      </span>
    </span>
  )
}

/* ================================================================== */
/* 2. FEATURE STRIP – edit FEATURES to suit your shoes               */
/* ================================================================== */
const FEATURES = [
  { icon: Feather, title: "Ultra Lightweight", text: "Feels light on every step" },
  { icon: Wind, title: "Breathable Mesh", text: "Keeps you cool" },
  { icon: Footprints, title: "Cushioned Sole", text: "Maximum comfort" },
  { icon: Diamond, title: "Premium Quality", text: "Built to last" },
]

export function FeatureStrip() {
  return (
    <Container className="mt-12">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border bg-neutral-200 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 bg-white p-4 sm:gap-4 sm:p-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 sm:h-12 sm:w-12">
              <f.icon className="h-5 w-5 text-neutral-900 sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold sm:text-base">{f.title}</p>
              <p className="truncate text-xs text-neutral-500 sm:text-sm">{f.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Container>
  )
}

/* ================================================================== */
/* 3. VIDEO + PRODUCT HIGHLIGHTS                                     */
/* ================================================================== */
const textOf = (html) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()

export function Showcase({ product, images, video, descriptionHtml, plain, onPlay }) {
  // Highlights = bullet points from the description, else its first sentences
  const { intro, points } = useMemo(() => {
    const lis = [...descriptionHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => textOf(m[1])).filter(Boolean)
    const firstP = [...descriptionHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => textOf(m[1])).find((t) => t.length > 40)
    const sentences = plain.split(/(?<=[.!?])\s+/).filter((s) => s.length > 25)
    return {
      intro: firstP || sentences.slice(0, 2).join(" ") || "",
      points: (lis.length ? lis : sentences.slice(2, 5)).slice(0, 4),
    }
  }, [descriptionHtml, plain])

  const big = video?.thumbnail_url || images[0]?.src
  const small = [images[1], images[2], images[3]].map((img, i) => img?.src || images[(i + 1) % images.length]?.src)

  return (
    <Container className="mt-12">
      <div className="grid gap-4 lg:h-[380px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.6fr)_minmax(0,1fr)] lg:gap-5">
        {/* big tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group relative aspect-[16/10] min-h-0 overflow-hidden rounded-[28px] bg-neutral-900 lg:aspect-auto lg:h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={big || IMAGES.image_placeholder} alt={product?.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/20 to-transparent" />
          <div className="absolute left-6 top-6 max-w-[60%] sm:left-8 sm:top-8">
            <p className="text-3xl font-black italic leading-none tracking-tight text-white sm:text-5xl">
              Step <span className="text-lime-400">Into</span>
              <br /> Comfort
            </p>
            <span className="mt-3 block h-1 w-16 rounded-full bg-lime-400" />
          </div>
          {video && (
            <button
              type="button"
              onClick={onPlay}
              aria-label="Play video"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-2xl transition hover:scale-110 cursor-pointer sm:h-20 sm:w-20"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
              <Play className="relative ml-1 h-7 w-7 fill-neutral-900 text-neutral-900" />
            </button>
          )}
        </motion.div>

        {/* 3 stacked images */}
        <div className="grid min-h-0 grid-cols-3 gap-3 lg:h-full lg:grid-cols-1 lg:grid-rows-3 lg:gap-4">
          {small.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * (i + 1) }}
              className="relative aspect-square min-h-0 overflow-hidden rounded-2xl bg-neutral-100 lg:aspect-auto lg:h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src || IMAGES.image_placeholder} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-110" />
            </motion.div>
          ))}
        </div>

        {/* highlights */}
        <div className="flex min-h-0 flex-col justify-center rounded-[28px] p-2 lg:p-4">
          <h2 className="text-2xl font-extrabold tracking-tight">Product Highlights</h2>
          {intro && <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-neutral-600">{intro}</p>}
          {points.length > 0 && (
            <ul className="mt-5 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[15px] text-neutral-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 fill-lime-400 text-white" />
                  <span className="line-clamp-2">{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Container>
  )
}

/* ================================================================== */
/* 4. TABS + SIZE CHART CARD                                         */
/* ================================================================== */
export function InfoTabs({ product, variant, variants, descriptionHtml, reviewCount, gender, systems, onOpenSizeGuide }) {
  const [tab, setTab] = useState("description")
  const [expanded, setExpanded] = useState(false)

  const sizesAvailable = useMemo(
    () => [...new Set(variants.filter((v) => v.stock > 0).map((v) => sizeLabel(v.gender, v.size, systems[0]?.key || "uk")))],
    [variants, systems]
  )
  const colorsAvailable = [...new Set(variants.map((v) => v.color))]

  const specs = [
    ["Brand", product?.brand],
    ["Category", product?.category?.name],
    ["Gender", variant?.gender && variant.gender[0].toUpperCase() + variant.gender.slice(1)],
    ["Colours", colorsAvailable.join(", ")],
    ["Sizes in stock", sizesAvailable.join(", ")],
    ["SKU", variant?.sku],
  ].filter(([, v]) => v)

  const TABS = [
    { key: "description", label: "Description" },
    { key: "specs", label: "Specifications" },
    { key: "shipping", label: "Shipping & Returns" },
    { key: "reviews", label: `Reviews (${reviewCount})` },
  ]

  return (
    <Container id="details" className="mt-14 scroll-mt-28">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex gap-1 overflow-x-auto border-b hide-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => (t.key === "reviews" ? document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" }) : setTab(t.key))}
                className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition cursor-pointer ${tab === t.key ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                {t.label}
                {tab === t.key && <motion.span layoutId="pd-tab-line" className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-neutral-900" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="pt-6">
              {tab === "description" && (
                <div>
                  <div className={`relative overflow-hidden transition-[max-height] duration-500 ${expanded ? "max-h-[4000px]" : "max-h-48"}`}>
                    {descriptionHtml ? <div className="rich-text" dangerouslySetInnerHTML={{ __html: descriptionHtml }} /> : <p className="text-neutral-500">No description yet.</p>}
                    {!expanded && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white to-transparent" />}
                  </div>
                  {descriptionHtml && (
                    <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline cursor-pointer">
                      {expanded ? "Show Less" : "Read More"} <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
              )}

              {tab === "specs" && (
                <dl className="overflow-hidden rounded-2xl border">
                  {specs.map(([k, v], i) => (
                    <div key={k} className={`grid grid-cols-[140px_1fr] gap-4 px-4 py-3 text-sm sm:grid-cols-[180px_1fr] ${i % 2 ? "bg-neutral-50" : ""}`}>
                      <dt className="font-semibold text-neutral-500">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {tab === "shipping" && (
                <div className="space-y-4 text-[15px] leading-relaxed text-neutral-600">
                  <p><b className="text-neutral-900">Shipping:</b> Orders are packed and dispatched quickly and delivered across India. You will get a tracking link once your order ships.</p>
                  <p><b className="text-neutral-900">Returns & exchange:</b> Wrong size? Request an exchange or return from your account as per our returns policy. Shoes must be unused and in their original box.</p>
                  <p className="text-sm text-neutral-500">Edit this text in <code>sections.jsx</code> to match your exact policy.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <SizeChartCard gender={gender} highlight={variant?.size} systems={systems} onOpen={onOpenSizeGuide} />
      </div>
    </Container>
  )
}

function SizeChartCard({ gender, highlight, systems, onOpen }) {
  const chart = SIZE_CHARTS[gender] || SIZE_CHARTS.men
  const hl = String(highlight || "").replace(/-w$/i, "")
  const idx = Math.max(0, chart.findIndex((r) => r.value === hl))
  const rows = chart.slice(Math.max(0, Math.min(idx - 1, chart.length - 4)), Math.max(0, Math.min(idx - 1, chart.length - 4)) + 4)
  const cols = [...systems.filter((s) => s.key !== "in" || systems.length === 1).slice(0, 3), { key: "cm", label: "CM" }]

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold">Size Chart</p>
          <p className="text-xs text-white/50 capitalize">{gender}&apos;s sizes</p>
        </div>
        <button type="button" onClick={onOpen} className="rounded-full bg-lime-400 px-3 py-1.5 text-xs font-bold text-neutral-900 transition hover:bg-lime-300 cursor-pointer">
          Full chart
        </button>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4">
        {/* outline shoe */}
        <svg viewBox="0 0 200 90" className="hidden w-full max-w-[170px] text-white/70 sm:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 62c0-8 4-14 12-16l38-8c10-2 18-10 24-18l6-8c3-4 9-4 12 0l6 9c4 6 11 9 18 9h18c14 0 27 6 36 16l10 11c4 4 4 10 0 13H16c-5 0-8-4-8-8z" />
          <path d="M10 70h178M90 26l10 12M104 20l10 12M118 22l8 10" />
          <path d="M20 78h168" strokeDasharray="4 6" />
        </svg>
        <table className="text-center text-sm">
          <thead>
            <tr>{cols.map((c) => <th key={c.key} className="px-3 pb-2 font-bold">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.value} className={r.value === hl ? "font-bold text-lime-400" : "text-white/80"}>
                {cols.map((c) => <td key={c.key} className="px-3 py-1.5">{r[c.key] ?? "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================================================================== */
/* 5. CUSTOMER REVIEWS (summary + latest 3, full list in a drawer)  */
/* ================================================================== */
export function ReviewsSection({ productId }) {
  const [summary, setSummary] = useState({ totalReviews: 0, averageRating: 0, rating: {} })
  const [latest, setLatest] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let off = false
    Promise.all([
      axios.get(`/api/review/details?productId=${productId}`).catch(() => null),
      axios.get(`/api/review/get?productId=${productId}&page=1`).catch(() => null),
    ]).then(([d, l]) => {
      if (off) return
      if (d?.data?.success) setSummary(d.data.data)
      if (l?.data?.success) setLatest((l.data.data?.reviews || []).slice(0, 3))
    })
    return () => {
      off = true
    }
  }, [productId, open])

  const avg = Number(summary.averageRating) || 0
  const total = summary.totalReviews || 0

  return (
    <Container id="reviews" className="mt-14 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Customer Reviews</h2>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline cursor-pointer">
          {total ? "View All Reviews" : "Write a Review"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* summary */}
        <div className="grid grid-cols-[auto_1fr] gap-6 rounded-[28px] border p-6">
          <div>
            <p className="text-5xl font-black tracking-tight">{avg.toFixed(1)}</p>
            <div className="mt-2"><Stars value={avg} /></div>
            <p className="mt-2 text-xs text-neutral-500">Based on {total} review{total === 1 ? "" : "s"}</p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((s) => {
              const c = summary.rating?.[s] || 0
              const pct = total ? Math.round((c / total) * 100) : 0
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="flex w-7 items-center gap-0.5 font-semibold">{s}<Star className="h-3 w-3 fill-amber-400 text-amber-400" /></span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-amber-400" />
                  </div>
                  <span className="w-8 text-right text-neutral-500">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* latest reviews */}
        {latest.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {latest.map((r, i) => (
              <motion.article
                key={r._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col rounded-[24px] border p-5"
              >
                <div className="flex items-center gap-3">
                  {r.avatar?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar.url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-sm font-bold">{(r.reviewedBy || "C")[0].toUpperCase()}</span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{r.reviewedBy || "Customer"}</p>
                    <p className="text-xs text-neutral-400">{dayjs(r.createdAt).fromNow()}</p>
                  </div>
                </div>
                <div className="mt-3"><Stars value={r.rating} /></div>
                {r.title && <p className="mt-2 text-sm font-bold">{r.title}</p>}
                <p className="mt-1 line-clamp-3 text-sm text-neutral-600">{r.review}</p>
              </motion.article>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-[28px] border-2 border-dashed p-8 text-center transition hover:border-lime-500 cursor-pointer"
          >
            <MessageSquarePlus className="h-9 w-9 text-neutral-300" />
            <p className="font-bold">No reviews yet</p>
            <p className="text-sm text-neutral-500">Bought this pair? Be the first to review it.</p>
          </button>
        )}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} icon={Star} title="Ratings & Reviews" subtitle={`${total} review${total === 1 ? "" : "s"}`} width="max-w-2xl">
        <div className="p-3 sm:p-4 [&>div]:border-0 [&>div]:p-2">
          <ProdcutReview productId={productId} />
        </div>
      </Drawer>
    </Container>
  )
}

/* ================================================================== */
/* 6. YOU MAY ALSO LIKE                                              */
/* ================================================================== */
export function RelatedProducts({ current }) {
  const dispatch = useDispatch()
  const saved = useSelector((s) => s.wishlistStore?.items) || []
  const [items, setItems] = useState(null)

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product?limit=30`)
      .then(({ data }) => {
        const all = (data?.data || []).filter((p) => p._id !== current._id)
        const same = all.filter((p) => p.category?.name && p.category.name === current.category?.name)
        const rest = all.filter((p) => !same.includes(p))
        setItems([...same, ...rest].slice(0, 10))
      })
      .catch(() => setItems([]))
  }, [current._id, current.category?.name])

  if (items && !items.length) return null

  return (
    <Container className="mt-14">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">You May Also Like</h2>
        <Link href={WEBSITE_SHOP} className="inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline">
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 hide-scrollbar">
        {(items || Array.from({ length: 5 })).map((p, i) =>
          !p ? (
            <div key={i} className="h-72 w-[46%] shrink-0 animate-pulse rounded-[24px] bg-neutral-100 sm:w-[31%] lg:w-[calc(20%-13px)]" />
          ) : (
            <RelatedCard key={p._id} p={p} index={i} saved={saved.some((x) => x.productId === p._id)} dispatch={dispatch} />
          )
        )}
      </div>
    </Container>
  )
}

function RelatedCard({ p, index, saved, dispatch }) {
  const img = p.colors?.[0]?.image || p.media?.[0]?.secure_url || IMAGES.image_placeholder
  const discount = calcDiscount(p.mrp, p.sellingPrice)
  const href = WEBSITE_PRODUCT_DETAILS(p.slug)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 5) * 0.06 }}
      className="group w-[46%] shrink-0 snap-start overflow-hidden rounded-[24px] border bg-white transition hover:shadow-xl sm:w-[31%] lg:w-[calc(20%-13px)]"
    >
      <div className="relative aspect-[4/3.4] overflow-hidden bg-neutral-100">
        <Link href={href}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        <button
          type="button"
          onClick={() => {
            dispatch(toggleWishlist({ productId: p._id, name: p.name, slug: p.slug, image: img, mrp: p.mrp, sellingPrice: p.sellingPrice }))
            showToast("success", saved ? "Removed from wishlist." : "Added to wishlist ♥")
          }}
          aria-label="Wishlist"
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow cursor-pointer"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
        {discount > 0 && <span className="absolute left-2.5 top-2.5 rounded-full bg-lime-400 px-2 py-0.5 text-[10px] font-bold">-{discount}%</span>}
      </div>
      <div className="p-3.5">
        <Link href={href} className="line-clamp-1 text-sm font-bold hover:text-lime-700">{p.name}</Link>
        <p className="line-clamp-1 text-xs text-neutral-400">{p.brand || p.category?.name || " "}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="leading-tight">
            <p className="font-extrabold">{formatINR(p.sellingPrice)}</p>
            {discount > 0 && <p className="text-xs text-neutral-400 line-through">{formatINR(p.mrp)}</p>}
          </div>
          <Link href={href} aria-label={`View ${p.name}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-lime-400 hover:text-neutral-900">
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/* Size guide (inside the drawer)                                    */
/* ================================================================== */
export function SizeGuideBody({ gender, highlight, systems }) {
  const chart = SIZE_CHARTS[gender] || SIZE_CHARTS.men
  const hl = String(highlight || "").replace(/-w$/i, "")
  const cols = [...systems, { key: "cm", label: "Foot (cm)" }]
  return (
    <div className="space-y-6 p-5 sm:p-6">
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-center text-sm">
          <thead className="bg-neutral-950 text-white">
            <tr>{cols.map((c) => <th key={c.key} className="px-3 py-3 font-semibold">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {chart.map((r, i) => (
              <tr key={r.value} className={r.value === hl ? "bg-lime-400 font-bold text-neutral-900" : i % 2 ? "bg-neutral-50" : ""}>
                {cols.map((c) => <td key={c.key} className="px-3 py-2.5">{r[c.key] ?? "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl bg-lime-50 p-5">
        <p className="font-bold">How to measure your foot</p>
        <ol className="mt-3 space-y-2 text-sm text-neutral-700">
          {[
            "Stand on a sheet of paper with your heel against a wall.",
            "Mark the tip of your longest toe.",
            "Measure from the wall to the mark in centimetres.",
            "Match it with the Foot (cm) column above.",
          ].map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400 text-xs font-bold">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </div>
      <p className="text-xs text-neutral-500">Indian (IN) sizes are the same as UK sizes. Between two sizes? Pick the bigger one.</p>
    </div>
  )
}
