'use client'

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

/**
 * Smooth side drawer used by Cart, Wishlist and Size guide.
 * Slides in from the right (full width on phones), dims + blurs the page,
 * closes on overlay click / Esc, and locks page scroll while open.
 */
export default function Drawer({ open, onClose, title, subtitle, icon: Icon, children, footer, width = "max-w-md" }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  // render the portal only after mount (avoids SSR/hydration mismatch)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/50 backdrop-blur-[3px]"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className={`absolute inset-y-0 right-0 flex w-full ${width} flex-col bg-white shadow-2xl sm:rounded-l-[28px]`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                {Icon && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <h2 className="text-lg font-bold leading-tight text-neutral-900">{title}</h2>
                  {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full transition duration-300 hover:rotate-90 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

            {/* Footer */}
            {footer && <div className="border-t bg-white px-5 py-4 sm:px-6">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
