'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import useFetch from '@/hooks/useFetch'
import { Slider } from '../ui/slider'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { formatINR } from '@/lib/pricing'
import { sizeLabel } from '@/lib/shoeSizes'
import { isLight, swatchColor } from '@/lib/colorSwatch'

const GENDERS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
]

// Kids sizes (C10…) first, then numbers small → large
const sizeOrder = (a, b) => {
  const ka = /^c/i.test(a), kb = /^c/i.test(b)
  if (ka !== kb) return ka ? -1 : 1
  const num = (v) => parseFloat(String(v).replace(/[^\d.]/g, '')) || 0
  return num(a) - num(b)
}

/**
 * Shop filter sidebar – every section open by default.
 * priceRange: { min, max } from the shop API.  onDone: close the mobile drawer after a change.
 */
export default function Filter({ priceRange = { min: 0, max: 10000 }, onDone }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const { data: categoryData } = useFetch('/api/category/get-category')
  const { data: colorData } = useFetch('/api/product-variant/colors')
  const { data: sizeData } = useFetch('/api/product-variant/sizes')

  const list = (key) => searchParams.get(key)?.split(',').filter(Boolean) || []
  const selCategory = list('category')
  const selColor = list('color')
  const selSize = list('size')
  const gender = searchParams.get('gender')

  const lo = Math.floor(priceRange.min / 100) * 100
  const hi = Math.max(Math.ceil(priceRange.max / 100) * 100, lo + 100)
  const [price, setPrice] = useState([lo, hi])
  useEffect(() => {
    setPrice([Number(searchParams.get('minPrice')) || lo, Number(searchParams.get('maxPrice')) || hi])
  }, [searchParams, lo, hi])

  const push = (mutate) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    params.delete('page')
    router.push(`${WEBSITE_SHOP}${params.toString() ? `?${params}` : ''}`, { scroll: false })
    onDone?.()
  }
  const toggleIn = (key, value) =>
    push((p) => {
      const cur = p.get(key)?.split(',').filter(Boolean) || []
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]
      next.length ? p.set(key, next.join(',')) : p.delete(key)
    })
  const setGender = (g) => push((p) => (p.get('gender') === g ? p.delete('gender') : p.set('gender', g)))
  const applyPrice = (min, max) =>
    push((p) => {
      min > lo ? p.set('minPrice', min) : p.delete('minPrice')
      max < hi ? p.set('maxPrice', max) : p.delete('maxPrice')
    })

  const activeCount =
    selCategory.length + selColor.length + selSize.length + (gender ? 1 : 0) +
    (searchParams.get('minPrice') || searchParams.get('maxPrice') ? 1 : 0)

  const sizes = useMemo(() => (sizeData?.success ? [...sizeData.data].sort(sizeOrder) : []), [sizeData])
  const presets = useMemo(() => {
    const steps = [1000, 2500, 5000]
    return [
      { label: `Under ${formatINR(steps[0])}`, min: lo, max: steps[0] },
      { label: `${formatINR(steps[0])} – ${formatINR(steps[1])}`, min: steps[0], max: steps[1] },
      { label: `${formatINR(steps[1])} – ${formatINR(steps[2])}`, min: steps[1], max: steps[2] },
      { label: `Above ${formatINR(steps[2])}`, min: steps[2], max: hi },
    ].filter((p) => p.min < hi)
  }, [lo, hi])

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <p className="flex items-center gap-2 text-base font-extrabold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-white">{activeCount}</span>
          )}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => push((p) => ['category', 'color', 'size', 'gender', 'minPrice', 'maxPrice'].forEach((k) => p.delete(k)))}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition hover:text-orange-600 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Gender */}
      <Section title="Shop for">
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGender(g.value)}
              className={`h-10 rounded-xl text-sm font-semibold transition cursor-pointer ${
                gender === g.value ? 'bg-neutral-900 text-white shadow-md' : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-neutral-900'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Category */}
      {categoryData?.success && categoryData.data.length > 0 && (
        <Section title="Category" count={selCategory.length}>
          <ul className="max-h-56 space-y-1 overflow-y-auto pr-1 thin-scroll">
            {categoryData.data.map((c) => {
              const on = selCategory.includes(c.slug)
              return (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => toggleIn('category', c.slug)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition cursor-pointer ${on ? 'bg-orange-50 font-semibold text-neutral-900' : 'text-neutral-700 hover:bg-white'}`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${on ? 'border-orange-500 bg-orange-500 text-white' : 'border-neutral-300 bg-white'}`}>
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="capitalize">{c.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {/* Size */}
      {sizes.length > 0 && (
        <Section title="Size (UK)" count={selSize.length}>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((s) => {
              const on = selSize.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleIn('size', s)}
                  className={`h-10 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    on ? 'bg-neutral-900 text-white shadow-md' : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-neutral-900'
                  }`}
                >
                  {sizeLabel(/^c/i.test(s) ? 'kids' : undefined, s, 'uk', false)}
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {/* Colour */}
      {colorData?.success && colorData.data.length > 0 && (
        <Section title="Colour" count={selColor.length}>
          <div className="grid grid-cols-2 gap-2">
            {colorData.data.map((c) => {
              const name = typeof c === 'string' ? c : c.name
              const hex = swatchColor(name, c.code)
              const on = selColor.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleIn('color', name)}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition cursor-pointer ${on ? 'bg-white font-semibold shadow-sm ring-2 ring-neutral-900' : 'text-neutral-700 hover:bg-white'}`}
                >
                  <span className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isLight(hex) ? 'border border-neutral-300' : ''}`} style={{ backgroundColor: hex }}>
                    {on && <Check className={`h-3.5 w-3.5 ${isLight(hex) ? 'text-neutral-900' : 'text-white'}`} strokeWidth={3} />}
                  </span>
                  <span className="truncate capitalize">{name}</span>
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {/* Price */}
      <Section title="Price">
        <div className="px-1 pt-2">
          <Slider value={price} min={lo} max={hi} step={100} minStepsBetweenThumbs={1} onValueChange={setPrice} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <label key={i} className="rounded-xl bg-white px-3 py-2 ring-1 ring-neutral-200">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{i ? 'Max' : 'Min'}</span>
              <span className="text-sm font-bold">{formatINR(price[i])}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPrice(p.min, p.max)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:text-neutral-900 hover:ring-neutral-900 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => applyPrice(price[0], price[1])}
          className="mt-4 h-11 w-full rounded-xl bg-orange-500 text-sm font-bold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 cursor-pointer"
        >
          Apply price
        </button>
      </Section>
    </div>
  )
}

/* Collapsible section – open by default */
function Section({ title, count = 0, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-t border-neutral-200/80 py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left cursor-pointer">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-900">
          {title}
          {count > 0 && <span className="ml-1.5 text-orange-500">({count})</span>}
        </span>
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
