'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Expand,
  Heart,
  Minus,
  PencilRuler,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  X,
} from "lucide-react"
import { addIntoCart } from "@/store/reducer/cartReducer"
import { toggleWishlist } from "@/store/reducer/wishlistReducer"
import { showToast } from "@/lib/showToast"
import { calcDiscount, formatINR } from "@/lib/pricing"
import { SIZE_CHARTS, SIZE_SYSTEMS, sizeLabel } from "@/lib/shoeSizes"
import { isLight, swatchColor } from "@/lib/colorSwatch"
import { toHtml, toPlainText } from "@/lib/richText"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_CART, WEBSITE_CHECKOUT, WEBSITE_HOME, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Drawer from "@/components/Website/Drawer"
import { FeatureStrip, InfoTabs, RelatedProducts, ReviewsSection, Showcase, SizeGuideBody } from "./sections"

// Small trust row under the buttons – edit to match your store policy
export const TRUST = [
  { icon: Truck, title: "Free Shipping", text: "On eligible orders" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% Secure" },
  { icon: RotateCcw, title: "Easy Returns", text: "Hassle-free" },
]
const MAX_QTY = 10

export default function ProductDetails({ product, variant: initialVariant, variants = [], colors = [], reviewCount = 0, rating = 0 }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const cart = useSelector((s) => s.cartStore) ?? { products: [] }
  const savedList = useSelector((s) => s.wishlistStore?.items) || []

  const [variantId, setVariantId] = useState(initialVariant?._id)
  const variant = variants.find((v) => v._id === variantId) || initialVariant
  const gender = variant?.gender || "men"

  // Size systems the admin enabled (older products → UK only)
  const systems = useMemo(() => {
    const enabled = product?.sizeSystems?.length ? product.sizeSystems : ["uk"]
    return SIZE_SYSTEMS.filter((s) => enabled.includes(s.key))
  }, [product?.sizeSystems])
  const [system, setSystem] = useState(systems[0]?.key || "uk")

  const [qty, setQty] = useState(1)
  const [slide, setSlide] = useState(0)
  const [dir, setDir] = useState(1)
  const [lightbox, setLightbox] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [sizeGuide, setSizeGuide] = useState(false)
  const thumbsRef = useRef(null)

  /* ---------- sizes for selected colour ---------- */
  const sizeOptions = useMemo(() => {
    const chart = SIZE_CHARTS[gender] || []
    const pos = (v) => {
      const i = chart.findIndex((r) => r.value === String(v).replace(/-w$/i, ""))
      return i === -1 ? 999 : i
    }
    return variants.filter((v) => v.color === variant?.color).sort((a, b) => pos(a.size) - pos(b.size))
  }, [variants, variant?.color, gender])

  /* ---------- images (selected colour first, then product images) ---------- */
  const images = useMemo(() => {
    const seen = new Set()
    const list = [...(variant?.media || []), ...(product?.media || [])]
      .filter((m) => m?.secure_url && !seen.has(m.secure_url) && seen.add(m.secure_url))
      .map((m) => ({ src: m.secure_url, alt: m.alt || product.name }))
    return list.length ? list : [{ src: IMAGES.image_placeholder, alt: product?.name }]
  }, [variant?.media, product])
  const video = product?.video?.url ? product.video : null

  useEffect(() => setSlide(0), [variant?.color])

  useEffect(() => {
    if (!variant) return
    window.history.replaceState(
      null,
      "",
      `${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${encodeURIComponent(variant.color)}&size=${encodeURIComponent(variant.size)}`
    )
    setQty(1)
  }, [variant, product.slug])

  const go = (n) => {
    setDir(n > slide ? 1 : -1)
    setSlide((n + images.length) % images.length)
  }

  const pickColor = (name) => {
    const next =
      variants.find((v) => v.color === name && v.size === variant?.size && v.stock > 0) ||
      variants.find((v) => v.color === name && v.stock > 0) ||
      variants.find((v) => v.color === name)
    if (next) setVariantId(next._id)
  }

  /* ---------- derived ---------- */
  const stock = variant?.stock ?? 0
  const inStock = stock > 0
  const mrp = variant?.mrp ?? product?.mrp
  const sp = variant?.sellingPrice ?? product?.sellingPrice
  const discount = calcDiscount(mrp, sp)
  const inCart = cart.products?.some((p) => p.productId === product._id && p.variantId === variant?._id)
  const saved = savedList.some((x) => x.productId === product._id)
  const descriptionHtml = useMemo(() => toHtml(product?.description), [product?.description])
  const plain = useMemo(() => toPlainText(product?.description), [product?.description])
  const tagline =
    product?.seo?.metaTitle && product.seo.metaTitle !== product.name
      ? product.seo.metaTitle
      : (() => {
          // first sentence of the first paragraph (skips headings like "PRODUCT STORY")
          const firstP = descriptionHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
          return (firstP || plain).split(/(?<=[.!?])\s/)[0]?.slice(0, 110)
        })()

  const cartPayload = () => ({
    productId: product._id,
    variantId: variant._id,
    name: product.name,
    url: product.slug,
    size: variant.size,
    color: variant.color,
    mrp: variant.mrp,
    sellingPrice: variant.sellingPrice,
    media: variant?.media?.[0]?.secure_url || images[0]?.src,
    qty,
  })

  const addToCart = () => {
    if (!variant) return showToast("error", "This product is not available yet.")
    if (!inStock) return showToast("error", "This size is out of stock.")
    if (inCart) return router.push(WEBSITE_CART)
    dispatch(addIntoCart(cartPayload()))
    showToast("success", "Added to cart.")
  }
  const buyNow = () => {
    if (!variant || !inStock) return showToast("error", "Please choose an available size.")
    if (!inCart) dispatch(addIntoCart(cartPayload()))
    router.push(WEBSITE_CHECKOUT)
  }
  const toggleSave = () => {
    dispatch(toggleWishlist({ productId: product._id, name: product.name, slug: product.slug, image: images[0]?.src, mrp, sellingPrice: sp }))
    showToast("success", saved ? "Removed from wishlist." : "Added to wishlist ♥")
  }
  const scrollThumbs = (d) => thumbsRef.current?.scrollBy({ top: d * 160, left: d * 160, behavior: "smooth" })

  const current = images[slide]

  return (
    <div className="overflow-x-clip bg-white pb-28 sm:pb-16">
      {/* ===================== 1. GALLERY + INFO ===================== */}
      <section className="mx-auto w-full max-w-[1320px] px-4 pt-5 sm:px-6 lg:px-8">
        {/* back + breadcrumb */}
        <div className="mb-4 flex min-w-0 items-center gap-4 text-sm">
          <Link href={WEBSITE_SHOP} className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-neutral-900 hover:text-lime-600">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
          <nav className="hidden min-w-0 items-center gap-1.5 text-xs text-neutral-400 sm:flex">
            <Link href={WEBSITE_HOME} className="hover:text-neutral-700">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            {product?.category?.name && (
              <>
                <Link href={`${WEBSITE_SHOP}?category=${product.category.slug}`} className="shrink-0 hover:text-neutral-700">{product.category.name}</Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </>
            )}
            <span className="truncate">{product?.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-10 xl:gap-14">
          {/* ---------- gallery ---------- */}
          <div className="flex min-w-0 flex-col-reverse gap-3 lg:sticky lg:top-28 lg:flex-row">
            {/* thumbnails */}
            <div className="flex shrink-0 items-center gap-2 lg:w-[84px] lg:flex-col">
              <button type="button" onClick={() => scrollThumbs(-1)} className="hidden h-7 w-7 items-center justify-center rounded-full border bg-white transition hover:bg-neutral-100 lg:flex cursor-pointer" aria-label="Scroll up">
                <ChevronUp className="h-4 w-4" />
              </button>
              <div ref={thumbsRef} className="flex gap-2.5 overflow-x-auto p-1 hide-scrollbar lg:max-h-[420px] lg:flex-col lg:overflow-y-auto">
                {images.map((img, i) => (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    onClick={() => go(i)}
                    className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl border-2 bg-neutral-100 transition cursor-pointer lg:h-[76px] lg:w-[76px] ${
                      i === slide ? "border-lime-500 shadow-md shadow-lime-500/20" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {images.length > 5 && (
                <button type="button" onClick={() => scrollThumbs(1)} className="hidden h-7 w-7 items-center justify-center rounded-full border bg-white transition hover:bg-neutral-100 lg:flex cursor-pointer" aria-label="Scroll down">
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* main image */}
            <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[28px] bg-neutral-100 sm:aspect-[5/4.4]">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.img
                  key={`${current?.src}-${slide}`}
                  src={current?.src}
                  alt={current?.alt}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -dir * 50 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) go(slide + 1)
                    else if (info.offset.x > 70) go(slide - 1)
                  }}
                  onClick={() => setLightbox(true)}
                  draggable={false}
                  className="absolute inset-0 h-full w-full cursor-zoom-in select-none object-cover"
                />
              </AnimatePresence>

              {discount > 0 && (
                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-lime-400 px-3 py-1.5 text-xs font-bold text-neutral-900 shadow">
                  🔥 {discount}% OFF
                </span>
              )}
              <motion.button
                type="button"
                whileTap={{ scale: 1.2 }}
                onClick={toggleSave}
                aria-label="Wishlist"
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md cursor-pointer"
              >
                <Heart className={`h-5 w-5 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
              </motion.button>

              {video && (
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold shadow-md backdrop-blur transition hover:bg-white cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-neutral-900" /> Watch video
                </button>
              )}
              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label="Full screen"
                className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:bg-white cursor-pointer"
              >
                <Expand className="h-4 w-4" />
              </button>

              {images.length > 1 && (
                <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 gap-1.5 sm:flex">
                  {images.map((_, i) => (
                    <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-5 bg-neutral-900" : "w-1.5 bg-neutral-900/25"}`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---------- info ---------- */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-neutral-900">
                <Star className="h-3 w-3 fill-neutral-900" /> {product?.brand || product?.category?.name || "Bestseller"}
              </span>
              {variant?.gender && (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-600">{variant.gender}</span>
              )}
            </div>

            <h1 className="mt-3 break-words text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl">{product?.name}</h1>
            {tagline && <p className="mt-1.5 line-clamp-2 text-base text-neutral-500">{tagline}</p>}

            <a href="#reviews" className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Stars value={rating} />
              <span className="font-semibold">{rating ? rating.toFixed(1) : "0.0"}</span>
              <span className="text-neutral-500">({reviewCount} review{reviewCount === 1 ? "" : "s"})</span>
            </a>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">{formatINR(sp)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-neutral-400 line-through">{formatINR(mrp)}</span>
                  <span className="rounded-full border border-lime-500 bg-lime-100 px-3 py-0.5 text-sm font-bold text-lime-800">{discount}% OFF</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">Inclusive of all taxes</p>

            {!variant && (
              <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">Colours and sizes are being added – please check back soon.</div>
            )}

            {/* colour */}
            {colors.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    Color: <span className="font-normal capitalize text-neutral-500">{variant?.color}</span>
                  </p>
                  <button type="button" onClick={() => setSizeGuide(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-lime-700 cursor-pointer">
                    <PencilRuler className="h-4 w-4" /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5 pl-0.5">
                  {colors.map((c) => {
                    const hex = swatchColor(c.name, c.code)
                    const on = c.name === variant?.color
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => pickColor(c.name)}
                        title={c.inStock ? c.name : `${c.name} – out of stock`}
                        aria-label={c.name}
                        className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition cursor-pointer ${on ? "border-lime-500" : "border-neutral-200 hover:border-neutral-400"}`}
                      >
                        <span className={`h-6 w-6 rounded-full ${isLight(hex) ? "border border-neutral-300" : ""}`} style={{ backgroundColor: hex }} />
                        {!c.inStock && <span className="absolute h-0.5 w-8 rotate-45 bg-neutral-500/70" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* size */}
            {sizeOptions.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold">Select Size:</p>
                  {systems.length > 1 ? (
                    <div className="flex rounded-full bg-neutral-100 p-0.5">
                      {systems.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setSystem(s.key)}
                          className={`relative rounded-full px-3 py-1 text-[11px] font-bold transition cursor-pointer ${system === s.key ? "text-white" : "text-neutral-500 hover:text-neutral-900"}`}
                        >
                          {system === s.key && <motion.span layoutId="pd-system" className="absolute inset-0 rounded-full bg-neutral-900" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                          <span className="relative">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-neutral-400">{systems[0]?.label}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((v) => {
                    const on = v._id === variant?._id
                    const out = v.stock <= 0
                    return (
                      <motion.button
                        key={v._id}
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        disabled={out}
                        onClick={() => setVariantId(v._id)}
                        className={`relative flex h-10 min-w-10 items-center justify-center rounded-full border-2 px-2 text-[13px] font-semibold transition cursor-pointer ${
                          on ? "border-neutral-900 bg-neutral-900 text-white" : out ? "cursor-not-allowed border-neutral-100 text-neutral-300 line-through" : "border-neutral-200 hover:border-neutral-900"
                        }`}
                      >
                        {sizeLabel(gender, v.size, system, false)}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* qty */}
            {variant && inStock && (
              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm font-semibold">Qty</span>
                <div className="flex h-10 items-center rounded-full border">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="flex h-10 w-10 items-center justify-center disabled:opacity-30 cursor-pointer" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <span className="w-7 text-center font-bold">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(Math.min(stock, MAX_QTY), q + 1))} disabled={qty >= Math.min(stock, MAX_QTY)} className="flex h-10 w-10 items-center justify-center disabled:opacity-30 cursor-pointer" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
                {stock <= 5 && <span className="text-xs font-semibold text-orange-600">Only {stock} left</span>}
              </div>
            )}

            {/* buttons */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr]">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={addToCart}
                disabled={!variant || !inStock}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-lime-400 font-bold text-neutral-900 shadow-lg shadow-lime-500/30 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <ShoppingCart className="h-5 w-5" /> {inCart ? "Go to Cart" : "Add to Cart"} <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={toggleSave}
                className={`inline-flex h-13 items-center justify-center gap-2 rounded-2xl border-2 font-semibold transition cursor-pointer ${saved ? "border-rose-200 bg-rose-50 text-rose-600" : "border-neutral-900 hover:bg-neutral-900 hover:text-white"}`}
              >
                <Heart className={`h-5 w-5 ${saved ? "fill-rose-500 text-rose-500" : ""}`} /> {saved ? "In Wishlist" : "Add to Wishlist"}
              </motion.button>
            </div>
            {variant && inStock && (
              <button type="button" onClick={buyNow} className="mt-3 w-full text-center text-sm font-semibold text-neutral-700 underline-offset-4 hover:text-neutral-900 hover:underline cursor-pointer">
                or Buy now →
              </button>
            )}

            {/* stock bar */}
            <div className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ${inStock ? "bg-lime-50 text-neutral-800" : "bg-red-50 text-red-600"}`}>
              <CheckCircle2 className={`h-4 w-4 ${inStock ? "fill-lime-500 text-white" : "text-red-500"}`} />
              {inStock ? "In Stock • Ready to Ship" : variant ? "Out of stock in this size" : "Coming soon"}
            </div>

            {/* trust */}
            <div className="mt-5 grid grid-cols-3 divide-x border-t pt-5">
              {TRUST.map((t) => (
                <div key={t.title} className="flex flex-col items-center gap-1.5 px-2 text-center sm:flex-row sm:text-left">
                  <t.icon className="h-6 w-6 shrink-0 text-neutral-800" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold sm:text-[13px]">{t.title}</p>
                    <p className="text-[11px] text-neutral-500">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 2. FEATURE STRIP ===================== */}
      <FeatureStrip />

      {/* ===================== 3. VIDEO + HIGHLIGHTS ===================== */}
      <Showcase product={product} images={images} video={video} descriptionHtml={descriptionHtml} plain={plain} onPlay={() => setVideoOpen(true)} />

      {/* ===================== 4. TABS + SIZE CHART ===================== */}
      <InfoTabs
        product={product}
        variant={variant}
        variants={variants}
        descriptionHtml={descriptionHtml}
        reviewCount={reviewCount}
        gender={gender}
        systems={systems}
        onOpenSizeGuide={() => setSizeGuide(true)}
      />

      {/* ===================== 5. REVIEWS ===================== */}
      <ReviewsSection productId={product._id} />

      {/* ===================== 6. YOU MAY ALSO LIKE ===================== */}
      <RelatedProducts current={product} />


      {/* mobile sticky bar */}
      {variant && (
        <div className="pd-mobile-bar fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.25)] backdrop-blur sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 max-w-[38%] leading-tight">
              <p className="text-lg font-extrabold">{formatINR(sp)}</p>
              <p className="truncate text-[11px] text-neutral-500">{sizeLabel(gender, variant.size, system)} · {variant.color}</p>
            </div>
            <button type="button" onClick={addToCart} disabled={!inStock} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-lime-400 text-sm font-bold text-neutral-900 disabled:opacity-50 cursor-pointer">
              <ShoppingCart className="h-4 w-4" /> {inCart ? "Go to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}

      {/* size guide drawer */}
      <Drawer open={sizeGuide} onClose={() => setSizeGuide(false)} icon={PencilRuler} title="Size Guide" subtitle={`${gender[0].toUpperCase() + gender.slice(1)}'s shoe sizes`} width="max-w-lg">
        <SizeGuideBody gender={gender} highlight={variant?.size} systems={systems} />
      </Drawer>

      {/* image lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(false)}>
            <button type="button" onClick={() => setLightbox(false)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer" aria-label="Close"><X className="h-5 w-5" /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img key={current?.src} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={current?.src} alt={current?.alt} className="max-h-[88vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            {images.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); go(slide - 1) }} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer" aria-label="Previous"><ChevronRight className="h-6 w-6 rotate-180" /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); go(slide + 1) }} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer" aria-label="Next"><ChevronRight className="h-6 w-6" /></button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* video modal */}
      <AnimatePresence>
        {videoOpen && video && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4" onClick={() => setVideoOpen(false)}>
            <button type="button" onClick={() => setVideoOpen(false)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer" aria-label="Close"><X className="h-5 w-5" /></button>
            <motion.video initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={video.url} poster={video.thumbnail_url} controls autoPlay playsInline className="max-h-[85vh] w-full max-w-4xl rounded-2xl bg-black" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Stars({ value = 0, size = "h-4 w-4" }) {
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
