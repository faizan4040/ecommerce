'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { toPlainText } from '@/lib/richText'
import { Heart, ShoppingBag } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '@/store/reducer/wishlistReducer'
import { isLight, swatchColor } from '@/lib/colorSwatch'
import { addIntoCart } from '@/store/reducer/cartReducer'
import { showToast } from '@/lib/showToast'
import { calcDiscount, formatINR } from '@/lib/pricing'
import { sizeLabel, sortSizes } from '@/lib/shoeSizes'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'

/**
 * Product card – used by Feature Products and any product grid.
 * Expects a product from /api/product/get-feature-product (with `colors`),
 * but also works with plain products (falls back to "View details").
 */
export default function ProductBox({ product, index = 0 }) {
  const dispatch = useDispatch()
  const colors = product?.colors || []
  const [colorIdx, setColorIdx] = useState(0)
  const [size, setSize] = useState(null)
  const savedList = useSelector((st) => st.wishlistStore?.items) || []
  const saved = savedList.some((x) => x.productId === product?._id)
  // first size system the admin enabled for this product (UK for older products)
  const cardSystem = product?.sizeSystems?.[0] || 'uk'

  const color = colors[colorIdx]
  const gender = color?.gender || 'men'

  // sizes for the selected colour, in chart order
  const sizes = useMemo(() => {
    if (!color) return []
    const order = sortSizes(gender, color.sizes.map((s) => s.size))
    return order.map((v) => color.sizes.find((s) => s.size === v))
  }, [color, gender])

  const selected = sizes.find((s) => s.size === size)
  const priceSource = selected || sizes.find((s) => s.stock > 0) || sizes[0] || product
  const mrp = priceSource?.mrp ?? product?.mrp
  const sp = priceSource?.sellingPrice ?? product?.sellingPrice
  const discount = calcDiscount(mrp, sp)

  const image = color?.image || product?.media?.[0]?.secure_url || IMAGES.image_placeholder
  const href = WEBSITE_PRODUCT_DETAILS(product?.slug)
  const detailsHref = color ? `${href}?color=${encodeURIComponent(color.name)}${size ? `&size=${size}` : ''}` : href
  const description = toPlainText(product?.description)

  const pickColor = (i) => {
    setColorIdx(i)
    setSize(null)
  }

  const toggleSave = () => {
    dispatch(
      toggleWishlist({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image,
        mrp,
        sellingPrice: sp,
      })
    )
    showToast('success', saved ? 'Removed from saved items.' : 'Saved for later ♥')
  }

  const addToCart = () => {
    if (!selected) return showToast('error', 'Please select a size first.')
    if (selected.stock <= 0) return showToast('error', 'This size is out of stock.')
    dispatch(
      addIntoCart({
        productId: product._id,
        variantId: selected.variantId,
        name: product.name,
        url: product.slug,
        size: selected.size,
        color: color.name,
        mrp: selected.mrp,
        sellingPrice: selected.sellingPrice,
        media: color.image || image,
        qty: 1,
      })
    )
    showToast('success', `${product.name} (UK ${selected.size}) added to cart.`)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-[30px] bg-white p-3 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-[0_30px_70px_-25px_rgba(249,115,22,0.45)]"
    >
      {/* ===== Curved image panel – photo fills the whole frame ===== */}
      <div className="relative h-72 overflow-hidden rounded-[24px] bg-neutral-100 sm:h-80">
        <Link href={detailsHref} className="absolute inset-0 block" aria-label={product?.name}>
          <AnimatePresence initial={false}>
            <motion.img
              key={image}
              src={image}
              alt={`${product?.name} – ${color?.name || ''}`}
              loading="lazy"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
        </Link>

        {/* gradients so the chips stay readable on any photo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/25 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/45 to-transparent" />

        {/* Top row: colour swatches + discount + save */}
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur">
            {colors.length > 0 ? (
              colors.slice(0, 5).map((c, i) => {
                const hex = swatchColor(c.name, c.code)
                return (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => pickColor(i)}
                    className={`h-5 w-5 rounded-full transition-transform hover:scale-110 cursor-pointer ${
                      isLight(hex) ? 'border border-neutral-300' : ''
                    } ${i === colorIdx ? 'ring-2 ring-neutral-900 ring-offset-1' : ''}`}
                    style={{ backgroundColor: hex }}
                  />
                )
              })
            ) : (
              <span className="px-2 text-[10px] font-semibold text-neutral-600">New</span>
            )}
            {colors.length > 5 && <span className="pr-1.5 text-[10px] font-bold text-neutral-700">+{colors.length - 5}</span>}
          </div>

          <div className="flex items-center gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">-{discount}%</span>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 1.35 }}
              onClick={toggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save for later'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur cursor-pointer"
            >
              <Heart className={`h-4 w-4 transition ${saved ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'}`} />
            </motion.button>
          </div>
        </div>

        {/* Size chips over the bottom of the photo */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-1.5 overflow-x-auto hide-scrollbar">
          {sizes.length > 0 ? (
            sizes.map((s) => {
              const out = s.stock <= 0
              const on = s.size === size
              return (
                <button
                  key={s.variantId}
                  type="button"
                  disabled={out}
                  onClick={() => setSize(on ? null : s.size)}
                  title={out ? 'Out of stock' : sizeLabel(gender, s.size, cardSystem)}
                  className={`h-8 min-w-9 shrink-0 rounded-lg px-2 text-xs font-semibold shadow-sm transition cursor-pointer ${
                    on
                      ? 'bg-orange-500 text-white shadow-orange-500/40'
                      : out
                        ? 'cursor-not-allowed bg-white/60 text-neutral-400 line-through'
                        : 'bg-white/95 text-neutral-800 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  {sizeLabel(gender, s.size, cardSystem, false)}
                </button>
              )
            })
          ) : (
            <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-600">Sizes coming soon</span>
          )}
        </div>
      </div>

      {/* ===== Info ===== */}
      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={detailsHref} className="min-w-0">
            <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 transition group-hover:text-orange-600">{product?.name}</h3>
          </Link>
          {color && <span className="shrink-0 pt-1 text-xs text-neutral-400">{color.name}</span>}
        </div>
        {(product?.brand || product?.category?.name) && (
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {[product?.brand, product?.category?.name].filter(Boolean).join(' · ')}
          </p>
        )}
        {description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">{description}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="leading-tight">
            <p className="text-xl font-extrabold text-neutral-900">{formatINR(sp)}</p>
            {discount > 0 && <p className="text-xs text-neutral-400 line-through">{formatINR(mrp)}</p>}
          </div>

          {sizes.length > 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={addToCart}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition cursor-pointer ${
                selected
                  ? 'bg-orange-500 text-white shadow-orange-500/40 hover:bg-orange-600'
                  : 'bg-neutral-900 text-white shadow-black/20 hover:bg-orange-500'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              {selected ? 'Add to cart' : 'Pick size'}
            </motion.button>
          ) : (
            <Link
              href={detailsHref}
              className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              View details
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  )
}
