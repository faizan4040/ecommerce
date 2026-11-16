'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownAZ,
  ArrowDownUp,

  ArrowUpZA,
  BadgePercent,
  ChevronRight,
  Loader2,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Filter from '@/components/Website/Filter'
import ProductBox from '@/components/Website/ProductBox'
import Drawer from '@/components/Website/Drawer'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_HOME, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { formatINR } from '@/lib/pricing'
import { sizeLabel } from '@/lib/shoeSizes'

const LIMIT = 12
const SORTS = [
  { value: 'default_sorting', label: 'Newest first', icon: Sparkles },
  { value: 'price_low_high', label: 'Price: Low to High', icon: TrendingUp },
  { value: 'price_high_low', label: 'Price: High to Low', icon: TrendingDown },
  { value: 'discount', label: 'Biggest discount', icon: BadgePercent },
  { value: 'asc', label: 'Name: A to Z', icon: ArrowDownAZ },
  { value: 'desc', label: 'Name: Z to A', icon: ArrowUpZA },
]

function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qs = searchParams.toString()
  const [sorting, setSorting] = useState('default_sorting')
  const [mobileFilter, setMobileFilter] = useState(false)

  const { data, error, isFetching, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['shop-products', sorting, qs],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await axios.get(`/api/shop?page=${pageParam}&limit=${LIMIT}&sort=${sorting}${qs ? `&${qs}` : ''}`)
      if (!data.success) throw new Error(data.message || 'Failed to load products')
      return data.data
    },
    initialPageParam: 0,
    getNextPageParam: (last) => last?.nextPage ?? undefined,
  })

  const products = data?.pages?.flatMap((p) => p.products) || []
  const total = data?.pages?.[0]?.total ?? 0
  const priceRange = data?.pages?.[0]?.priceRange || { min: 0, max: 10000 }

  /* ---------- active filter chips ---------- */
  const chips = useMemo(() => {
    const out = []
    const add = (key, value, label) => out.push({ key, value, label })
    searchParams.get('q') && add('q', null, `“${searchParams.get('q')}”`)
    searchParams.get('gender') && add('gender', null, searchParams.get('gender'))
    searchParams.get('category')?.split(',').forEach((c) => add('category', c, c.replace(/-/g, ' ')))
    searchParams.get('size')?.split(',').forEach((s) => add('size', s, sizeLabel(/^c/i.test(s) ? 'kids' : undefined, s, 'uk')))
    searchParams.get('color')?.split(',').forEach((c) => add('color', c, c))
    if (searchParams.get('minPrice') || searchParams.get('maxPrice'))
      add('price', null, `${formatINR(searchParams.get('minPrice') || priceRange.min)} – ${formatINR(searchParams.get('maxPrice') || priceRange.max)}`)
    return out
  }, [searchParams, priceRange])

  const removeChip = (chip) => {
    const p = new URLSearchParams(qs)
    if (chip.key === 'price') {
      p.delete('minPrice')
      p.delete('maxPrice')
    } else if (chip.value) {
      const next = (p.get(chip.key) || '').split(',').filter((x) => x && x !== chip.value)
      next.length ? p.set(chip.key, next.join(',')) : p.delete(chip.key)
    } else p.delete(chip.key)
    router.push(`${WEBSITE_SHOP}${p.toString() ? `?${p}` : ''}`, { scroll: false })
  }

  return (
    <div className="bg-[#fafaf9] pb-20">
      <ShopHero total={total} loading={isLoading} />

      <section className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* ===== Sidebar – always open on desktop ===== */}
          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[28px] bg-neutral-100/70 p-5 ring-1 ring-black/5 thin-scroll">
              <Filter priceRange={priceRange} />
            </div>
          </aside>

          {/* ===== Results ===== */}
          <div className="min-w-0">
            {/* toolbar */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5 sm:px-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilter(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white lg:hidden cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {chips.length > 0 && <span className="rounded-full bg-orange-500 px-1.5 text-[11px]">{chips.length}</span>}
                </button>
                <p className="hidden text-sm text-neutral-500 sm:block">
                  {isLoading ? 'Loading…' : (
                    <>
                      <b className="text-neutral-900">{total}</b> product{total === 1 ? '' : 's'}
                    </>
                  )}
                </p>
              </div>

              {/* Sort – shadcn Select */}
              <Select value={sorting} onValueChange={setSorting}>
                <SelectTrigger
                  aria-label="Sort products"
                  className="h-10! w-[200px] cursor-pointer gap-2 rounded-xl border-0 bg-neutral-100 px-3 text-sm shadow-none transition hover:bg-neutral-200/70 focus-visible:ring-2 focus-visible:ring-orange-500/40 data-[state=open]:bg-neutral-900 data-[state=open]:text-white sm:w-[220px] [&>svg:last-child]:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ArrowDownUp className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="hidden shrink-0 opacity-50 sm:inline">Sort:</span>
                    {/* the option's own icon is hidden here – only its label shows */}
                    <span className="min-w-0 truncate font-semibold [&_svg]:hidden">
                      <SelectValue />
                    </span>
                  </span>
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="end"
                  sideOffset={8}
                  className="w-[240px] rounded-2xl border-0 bg-white p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
                >
                  <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">Sort by</p>
                  {SORTS.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="cursor-pointer rounded-xl py-2.5 pl-3 pr-8 text-sm font-medium text-neutral-700 focus:bg-orange-50 focus:text-neutral-900 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white [&_svg]:text-current"
                    >
                      <s.icon className="h-4 w-4 opacity-70" />
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* active filters */}
            <AnimatePresence initial={false}>
              {chips.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 pt-4">
                    {chips.map((c) => (
                      <button
                        key={`${c.key}-${c.value || c.label}`}
                        type="button"
                        onClick={() => removeChip(c)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-neutral-900 cursor-pointer"
                      >
                        {c.label} <X className="h-3.5 w-3.5" />
                      </button>
                    ))}
                    <Link href={WEBSITE_SHOP} scroll={false} className="px-2 text-xs font-semibold text-orange-600 hover:underline">
                      Clear all
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* grid */}
            {error ? (
              <p className="mt-10 rounded-2xl bg-red-50 p-6 text-center font-medium text-red-600">{error.message}</p>
            ) : isLoading ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-[30px] bg-white p-3 ring-1 ring-black/5">
                    <div className="h-72 animate-pulse rounded-[24px] bg-neutral-200 sm:h-80" />
                    <div className="mt-4 space-y-2 px-2 pb-2">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                      <div className="h-10 w-full animate-pulse rounded-full bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-[28px] bg-white px-6 py-20 text-center ring-1 ring-black/5">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                  <PackageSearch className="h-9 w-9 text-orange-500" />
                </span>
                <p className="mt-5 text-xl font-extrabold">No shoes match these filters</p>
                <p className="mt-1 text-sm text-neutral-500">Try removing a filter or searching for something else.</p>
                <Link href={WEBSITE_SHOP} className="mt-6 rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-orange-500">
                  Reset filters
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, i) => (
                  <ProductBox key={product._id} product={product} index={i} />
                ))}
              </div>
            )}

            {/* load more */}
            {products.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="text-sm text-neutral-500">Showing {products.length} of {total}</p>
                <div className="h-1 w-48 overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${total ? (products.length / total) * 100 : 0}%` }} />
                </div>
                {hasNextPage && (
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-500 disabled:opacity-60 cursor-pointer"
                  >
                    {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />} Load more
                  </button>
                )}
              </div>
            )}
            {isFetching && !isLoading && !isFetchingNextPage && (
              <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" /> Updating…
              </div>
            )}
          </div>
        </div>
      </section>

      {/* mobile filter drawer */}
      <Drawer
        open={mobileFilter}
        onClose={() => setMobileFilter(false)}
        icon={SlidersHorizontal}
        title="Filters"
        subtitle={`${total} product${total === 1 ? '' : 's'}`}
        footer={
          <button type="button" onClick={() => setMobileFilter(false)} className="h-12 w-full rounded-2xl bg-orange-500 text-sm font-bold text-white cursor-pointer">
            Show {total} result{total === 1 ? '' : 's'}
          </button>
        }
      >
        <div className="p-5">
          <Filter priceRange={priceRange} />
        </div>
      </Drawer>
    </div>
  )
}

/* ================================================================== */
/* Banner                                                             */
/* ================================================================== */
const HERO_SHOES = [IMAGES.shoes_cut_8, IMAGES.sneaker_cut_2, IMAGES.shoes_cut_1]
const QUICK = [
  { label: 'All', params: '' },
  { label: 'Men', params: 'gender=men' },
  { label: 'Women', params: 'gender=women' },
  { label: 'Kids', params: 'gender=kids' },
]

function ShopHero({ total, loading }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const gender = searchParams.get('gender')
  const q = searchParams.get('q')
  const [term, setTerm] = useState(q || '')

  const title = q
    ? `Results for “${q}”`
    : gender
      ? `${gender === 'kids' ? 'Kids’' : gender[0].toUpperCase() + gender.slice(1) + '’s'} Shoes`
      : 'Shop All Shoes'

  const search = (e) => {
    e.preventDefault()
    const p = new URLSearchParams(searchParams.toString())
    term.trim() ? p.set('q', term.trim()) : p.delete('q')
    router.push(`${WEBSITE_SHOP}${p.toString() ? `?${p}` : ''}`)
  }

  return (
    <section className="px-3 pt-4 sm:px-4">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] bg-neutral-950 px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
        {/* glow + texture */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-8 right-4 select-none text-[110px] font-black leading-none tracking-tighter text-white/[0.04] sm:text-[180px]">SHOP</span>

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* text */}
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-white/50">
              <Link href={WEBSITE_HOME} className="hover:text-white">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/80">Shop</span>
            </nav>

            <motion.h1
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              {title}
            </motion.h1>
            <p className="mt-3 max-w-md text-sm text-white/60 sm:text-base">
              Running, training and everyday sneakers – find your perfect pair in the right size and colour.
            </p>

            {/* search */}
            <form onSubmit={search} className="mt-6 flex max-w-md items-center gap-2 rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur focus-within:ring-orange-500">
              <Search className="ml-2.5 h-4 w-4 shrink-0 text-white/60" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search shoes, brands…"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
              <button type="submit" className="h-10 shrink-0 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 cursor-pointer">
                Search
              </button>
            </form>

            {/* quick links */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {QUICK.map((c) => {
                const active = c.params ? searchParams.toString().includes(c.params) : !gender && !q
                return (
                  <Link
                    key={c.label}
                    href={`${WEBSITE_SHOP}${c.params ? `?${c.params}` : ''}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? 'bg-white text-neutral-900' : 'bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </Link>
                )
              })}
              <span className="ml-1 text-sm text-white/50">{loading ? '…' : `${total} product${total === 1 ? '' : 's'}`}</span>
            </div>
          </div>

          {/* floating shoes */}
          <div className="relative hidden h-72 lg:block">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" />
            <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/25 blur-2xl" />
            {HERO_SHOES.map((src, i) => (
              // wrapper positions the shoe; the image inside floats (so the animation never fights the layout)
              <div
                key={src}
                className={`absolute ${['left-0 top-2 w-56', 'left-1/2 top-16 z-10 w-72 -translate-x-1/2', 'right-0 top-0 w-52'][i]}`}
              >
                <motion.img
                  src={src}
                  alt=""
                  initial={{ opacity: 0, y: 30, rotate: [-18, -6, 10][i] }}
                  animate={{ opacity: 1, y: [0, -12, 0], rotate: [-18, -6, 10][i] }}
                  transition={{
                    opacity: { duration: 0.6, delay: i * 0.15 },
                    y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 },
                  }}
                  className="w-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <ShopPage />
    </Suspense>
  )
}
