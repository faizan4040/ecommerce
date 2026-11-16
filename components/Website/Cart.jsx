'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { decreaseQuantity, increaseQuantity, removeFromCart } from '@/store/reducer/cartReducer'
import { formatINR } from '@/lib/pricing'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_CART, WEBSITE_CHECKOUT, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import Drawer from './Drawer'

const getImageSrc = (media) => {
  if (!media) return IMAGES.image_placeholder
  if (typeof media === 'string') return media
  if (Array.isArray(media) && media.length) return media[0]?.secure_url || media[0]?.url || media[0]?.path || media[0]
  return IMAGES.image_placeholder
}

export default function Cart() {
  const cart = useSelector((s) => s.cartStore) ?? { count: 0, products: [] }
  const dispatch = useDispatch()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const products = cart.products || []
  const items = products.reduce((n, p) => n + (p.qty || 1), 0)
  const mrpTotal = products.reduce((s, p) => s + Math.max(p.mrp || 0, p.sellingPrice || 0) * p.qty, 0)
  const total = products.reduce((s, p) => s + (p.sellingPrice || 0) * p.qty, 0)
  const discount = Math.max(mrpTotal - total, 0)

  const go = (href) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      {/* Header icon */}
      <button type="button" onClick={() => setOpen(true)} aria-label="Open cart" className="relative cursor-pointer">
        <ShoppingBag size={22} className="text-white transition hover:text-orange-400" />
        <AnimatePresence>
          {cart.count > 0 && (
            <motion.span
              key={cart.count}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-2.5 -top-2 min-w-[18px] rounded-full bg-orange-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-neutral-950"
            >
              {cart.count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        icon={ShoppingBag}
        title="Your bag"
        subtitle={items ? `${items} item${items > 1 ? 's' : ''}` : 'Nothing here yet'}
        footer={
          products.length > 0 && (
            <div>
              <div className="space-y-2 text-sm">
                <Row label="Total MRP" value={formatINR(mrpTotal)} />
                {discount > 0 && <Row label="Discount" value={`− ${formatINR(discount)}`} className="text-emerald-600" />}
                <div className="flex items-end justify-between border-t pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-extrabold">{formatINR(total)}</span>
                </div>
              </div>
              {discount > 0 && (
                <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
                  🎉 You are saving {formatINR(discount)} on this order
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => go(WEBSITE_CART)}
                  className="h-12 rounded-2xl border-2 border-neutral-900 text-sm font-semibold transition hover:bg-neutral-900 hover:text-white cursor-pointer"
                >
                  View bag
                </button>
                <button
                  type="button"
                  onClick={() => go(WEBSITE_CHECKOUT)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 cursor-pointer"
                >
                  Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        }
      >
        {products.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
            <motion.div
              initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50"
            >
              <ShoppingBag className="h-10 w-10 text-orange-500" />
            </motion.div>
            <p className="mt-5 text-lg font-bold">Your bag is empty</p>
            <p className="mt-1 text-sm text-neutral-500">Find a pair you love and it will show up here.</p>
            <button
              type="button"
              onClick={() => go(WEBSITE_SHOP)}
              className="mt-6 rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 cursor-pointer"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <ul className="space-y-3 p-4 sm:p-5">
            <AnimatePresence initial={false}>
              {products.map((p, i) => {
                const ids = { productId: p.productId, variantId: p.variantId }
                return (
                  <motion.li
                    key={`${p.productId}-${p.variantId}`}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                    exit={{ opacity: 0, x: 80, height: 0, marginTop: 0, transition: { duration: 0.25 } }}
                    className="flex gap-4 rounded-2xl border p-3"
                  >
                    <Link
                      href={WEBSITE_PRODUCT_DETAILS(p.url)}
                      onClick={() => setOpen(false)}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getImageSrc(p.media)} alt={p.name} className="h-full w-full object-cover" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={WEBSITE_PRODUCT_DETAILS(p.url)}
                          onClick={() => setOpen(false)}
                          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-orange-600"
                        >
                          {p.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(ids))}
                          aria-label="Remove"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        UK {String(p.size).replace(/-w$/i, '')} · {p.color}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border">
                          <button
                            type="button"
                            onClick={() => (p.qty > 1 ? dispatch(decreaseQuantity(ids)) : dispatch(removeFromCart(ids)))}
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-neutral-100 cursor-pointer"
                            aria-label="Decrease"
                          >
                            {p.qty > 1 ? <Minus className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{p.qty}</span>
                          <button
                            type="button"
                            onClick={() => dispatch(increaseQuantity(ids))}
                            disabled={p.qty >= 10}
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-right leading-tight">
                          <p className="font-bold">{formatINR(p.sellingPrice * p.qty)}</p>
                          {p.mrp > p.sellingPrice && (
                            <p className="text-xs text-neutral-400 line-through">{formatINR(p.mrp * p.qty)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </Drawer>
    </>
  )
}

function Row({ label, value, className = '' }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className={className ? '' : 'text-neutral-500'}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
