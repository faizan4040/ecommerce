'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { clearWishlist, removeFromWishlist } from '@/store/reducer/wishlistReducer'
import { formatINR } from '@/lib/pricing'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import Drawer from './Drawer'

/* Header "Saved for later" icon + drawer */
export default function Wishlist() {
  const items = useSelector((s) => s.wishlistStore?.items) || []
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Saved for later" className="relative cursor-pointer">
        <Heart size={21} className="text-white transition hover:text-orange-400" />
        <AnimatePresence>
          {items.length > 0 && (
            <motion.span
              key={items.length}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-2.5 -top-2 min-w-[18px] rounded-full bg-white px-1 text-center text-[10px] font-bold leading-[18px] text-neutral-900 ring-2 ring-neutral-950"
            >
              {items.length}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        icon={Heart}
        title="Saved for later"
        subtitle={items.length ? `${items.length} saved item${items.length > 1 ? 's' : ''}` : 'Tap ♥ on any shoe to save it'}
        footer={
          items.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearWishlist())}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-red-500 cursor-pointer"
            >
              Clear all
            </button>
          )
        }
      >
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-50"
            >
              <Heart className="h-10 w-10 text-rose-500" />
            </motion.div>
            <p className="mt-5 text-lg font-bold">Nothing saved yet</p>
            <p className="mt-1 text-sm text-neutral-500">Save shoes you like and come back to them anytime.</p>
            <Link
              href={WEBSITE_SHOP}
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              Explore shoes
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:p-5">
            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <motion.li
                  key={it.productId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group overflow-hidden rounded-2xl border"
                >
                  <Link href={WEBSITE_PRODUCT_DETAILS(it.slug)} onClick={() => setOpen(false)} className="block">
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image || IMAGES.image_placeholder} alt={it.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-semibold">{it.name}</p>
                      <p className="text-sm font-bold">{formatINR(it.sellingPrice)}</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromWishlist(it.productId))}
                    className="flex w-full items-center justify-center gap-1.5 border-t py-2 text-xs font-semibold text-neutral-500 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Drawer>
    </>
  )
}
