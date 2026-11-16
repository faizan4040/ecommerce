'use client'

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  Package,
  Search,
  User,
  UserPlus,
  X,
} from "lucide-react"
import Card from "@/components/Website/Cart"
import Wishlist from "@/components/Website/Wishlist"
import { Avatar, AvatarImage } from "../ui/avatar"
import { IMAGES } from "@/routes/AllImages"
import { categories } from "@/routes/MenuCategories"
import {
  USER_DASHBOARD,
  USER_ORDERS,
  WEBSITE_HOME,
  WEBSITE_LOGIN,
  WEBSITE_REGISTER,
  WEBSITE_SHOP,
} from "@/routes/WebsiteRoute"

/* Featured shoe shown inside each mega menu (uses the background-removed cut-outs) */
const FEATURED = {
  "Men's": { image: IMAGES.shoes_cut_3, title: "Built for the long run", accent: "#ff5a0a" },
  "Women's": { image: IMAGES.shoes_cut_4, title: "Light. Fast. Yours.", accent: "#ec4899" },
  "Kids'": { image: IMAGES.sneaker_cut_3, title: "Made to play all day", accent: "#f59e0b" },
}

const NAV = [
  { name: "Home", link: WEBSITE_HOME },
  ...categories.map((c) => ({ name: c.name, link: c.link, mega: c })),
  { name: "Shop", link: WEBSITE_SHOP },
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const auth = useSelector((store) => store.authStore.auth)

  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(null) // nav item under the mouse (pill highlight)
  const [mega, setMega] = useState(null) // open mega-menu category
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerCat, setDrawerCat] = useState(null) // expanded accordion in mobile drawer

  const profileRef = useRef(null)
  const searchRef = useRef(null)
  const megaTimer = useRef(null)

  /* Shrink + glass effect after scrolling */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* Close everything on route change */
  useEffect(() => {
    setMega(null)
    setDrawerOpen(false)
    setProfileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  /* Click outside (profile) + Escape key */
  useEffect(() => {
    const onDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMega(null)
        setProfileOpen(false)
        setSearchOpen(false)
        setDrawerOpen(false)
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  /* Lock page scroll while the mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerOpen])

  /* Focus the search input when it opens */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 150)
  }, [searchOpen])

  const submitSearch = (e) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
  }

  const openMega = (cat) => {
    clearTimeout(megaTimer.current)
    setMega(cat)
  }
  const closeMegaSoon = () => {
    clearTimeout(megaTimer.current)
    megaTimer.current = setTimeout(() => setMega(null), 150)
  }

  // Home / Shop get the red "active" dot; category links are filtered shop URLs, so they don't
  const isActive = (item) => {
    if (item.link === WEBSITE_HOME) return pathname === WEBSITE_HOME
    if (item.link === WEBSITE_SHOP) return pathname?.startsWith(WEBSITE_SHOP)
    return false
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 px-2 transition-[padding] duration-500 sm:px-4 ${scrolled ? "pt-2" : "pt-3 sm:pt-4"}`}
        onMouseLeave={closeMegaSoon}
      >
        {/* ───────── MAIN BAR – floating, fully rounded left & right ───────── */}
        <div
          className={`relative mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-full border pl-3 pr-2 transition-all duration-500 sm:pl-6 sm:pr-3 ${
            scrolled || mega
              ? "border-white/10 bg-neutral-950/85 py-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              : "border-white/10 bg-neutral-950 py-2.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)]"
          }`}
        >
          {/* LEFT: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="group flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full text-white transition hover:bg-white/10 lg:hidden cursor-pointer"
            >
              <span className="h-0.5 w-5 rounded bg-current transition-all group-hover:w-6" />
              <span className="h-0.5 w-3.5 self-center rounded bg-current transition-all group-hover:w-6" />
              <span className="h-0.5 w-5 rounded bg-current transition-all group-hover:w-6" />
            </button>

            <Link href={WEBSITE_HOME} className="shrink-0" aria-label="Home">
              <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300 }}>
                <Image
                  src={IMAGES.logo_kmf_white}
                  alt="KMF Shoes"
                  width={1025}
                  height={423}
                  priority
                  className={`w-auto transition-[height] duration-500 ${scrolled ? "h-9" : "h-10 md:h-11"}`}
                />
              </motion.div>
            </Link>
          </div>

          {/* CENTER: desktop nav with sliding highlight */}
          <nav className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
            <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
              {NAV.map((item) => {
                const active = isActive(item) || mega?.name === item.name
                return (
                  <li
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => {
                      setHovered(item.name)
                      item.mega ? openMega(item.mega) : closeMegaSoon()
                    }}
                  >
                    {hovered === item.name && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-white/10"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Link
                      href={item.link}
                      className={`relative flex items-center gap-1 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                        active ? "text-white" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {item.name}
                      {item.mega && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${mega?.name === item.name ? "rotate-180" : ""}`}
                        />
                      )}
                      {isActive(item) && (
                        <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-500" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* RIGHT: search, profile, cart */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Expanding search (desktop) */}
            <form
              onSubmit={submitSearch}
              className={`hidden items-center overflow-hidden rounded-full border transition-all duration-500 ease-out md:flex ${
                searchOpen
                  ? "w-64 border-white/20 bg-white/10 xl:w-80"
                  : "w-10 border-transparent bg-transparent"
              }`}
            >
              <button
                type={searchOpen ? "submit" : "button"}
                onClick={() => !searchOpen && setSearchOpen(true)}
                aria-label="Search"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:text-orange-400 cursor-pointer"
              >
                <Search size={19} />
              </button>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="Search shoes, brands…"
                tabIndex={searchOpen ? 0 : -1}
                className="w-full bg-transparent pr-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none"
              />
            </form>

            {/* Search toggle (mobile) */}
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:hidden cursor-pointer"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 cursor-pointer"
              >
                {auth ? (
                  <Avatar className="h-8 w-8 ring-2 ring-orange-500/80 ring-offset-2 ring-offset-neutral-950">
                    <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                  </Avatar>
                ) : (
                  <User size={20} />
                )}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-4 w-72 origin-top-right overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl"
                  >
                    {!auth ? (
                      <div className="p-5">
                        <p className="text-base font-semibold">Welcome 👋</p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Sign in for faster checkout and order tracking.
                        </p>
                        <Link
                          href={WEBSITE_LOGIN}
                          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500"
                        >
                          <LogIn size={16} /> Sign In
                        </Link>
                        <Link
                          href={WEBSITE_REGISTER}
                          className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-neutral-300 py-2.5 text-sm font-medium transition hover:border-neutral-900"
                        >
                          <UserPlus size={16} /> Create Free Account
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 bg-neutral-50 p-5">
                          <Avatar className="h-11 w-11">
                            <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{auth.name}</p>
                            {auth.email && <p className="truncate text-xs text-neutral-500">{auth.email}</p>}
                          </div>
                        </div>
                        <div className="p-2">
                          <ProfileLink href={USER_DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                          <ProfileLink href={USER_ORDERS} icon={Package} label="My Orders" />
                          <ProfileLink href={`/profile/${auth.id}`} icon={User} label="Profile" />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Saved for later (wishlist drawer) */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10">
              <Wishlist />
            </div>

            {/* Cart drawer */}
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <Card />
            </div>
          </div>
        </div>

        {/* ───────── MOBILE SEARCH ───────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              onSubmit={submitSearch}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-[1400px] overflow-hidden md:hidden"
            >
              <div className="relative mt-2 mb-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shoes, brands…"
                  className="w-full rounded-full border border-white/10 bg-neutral-950 py-3 pl-11 pr-4 text-sm text-white shadow-lg placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ───────── MEGA MENU (desktop) ───────── */}
        <AnimatePresence>
          {mega && (
            <motion.div
              key="mega"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onMouseEnter={() => clearTimeout(megaTimer.current)}
              className="absolute inset-x-4 top-full mx-auto mt-3 hidden max-w-[1400px] overflow-hidden rounded-[2rem] border border-neutral-200 bg-white text-neutral-900 shadow-2xl lg:block"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mega.name}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-[1fr_1fr_340px] gap-10 px-10 py-9"
                >
                  {mega.sections?.slice(0, 2).map((section) => (
                    <div key={section.title}>
                      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                        {section.title}
                      </p>
                      <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                        {section.items.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.link}
                              onClick={() => setMega(null)}
                              className="group inline-flex items-center gap-1 text-sm text-neutral-600 transition hover:text-neutral-900"
                            >
                              <span className="relative">
                                {sub.name}
                                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <FeaturedCard category={mega} onClick={() => setMega(null)} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* Dim the page behind the mega menu */}
      <AnimatePresence>
        {mega && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 hidden bg-black/30 backdrop-blur-[2px] lg:block"
            onMouseEnter={closeMegaSoon}
          />
        )}
      </AnimatePresence>

      {/* ───────── MOBILE DRAWER ───────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-[61] flex w-[88%] max-w-sm flex-col bg-neutral-950 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <Image src={IMAGES.logo_kmf_white} alt="KMF Shoes" width={1025} height={423} className="h-10 w-auto" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 hover:rotate-90 duration-300 cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                    className="border-b border-white/5"
                  >
                    {item.mega ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDrawerCat((c) => (c === item.name ? null : item.name))}
                          className="flex w-full items-center justify-between px-3 py-4 text-left text-lg font-semibold cursor-pointer"
                        >
                          {item.name}
                          <ChevronDown
                            size={18}
                            className={`text-neutral-400 transition-transform duration-300 ${drawerCat === item.name ? "rotate-180 text-orange-500" : ""}`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {drawerCat === item.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              {item.mega.sections?.map((section) => (
                                <div key={section.title} className="px-3 pb-4">
                                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                                    {section.title}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {section.items.map((sub) => (
                                      <Link
                                        key={sub.name}
                                        href={sub.link}
                                        onClick={() => setDrawerOpen(false)}
                                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-orange-500 hover:text-white"
                                      >
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.link}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center justify-between px-3 py-4 text-lg font-semibold"
                      >
                        {item.name}
                        <ArrowRight size={18} className="text-neutral-500" />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {!auth && (
                <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-4">
                  <Link
                    href={WEBSITE_LOGIN}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xl border border-white/20 py-2.5 text-center text-sm font-medium transition hover:bg-white hover:text-neutral-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={WEBSITE_REGISTER}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xl bg-orange-500 py-2.5 text-center text-sm font-medium transition hover:bg-orange-500"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ------------------------------------------------------------------ */

function ProfileLink({ href, icon: Icon, label }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
    >
      <Icon size={17} className="text-neutral-400 transition group-hover:text-orange-500" />
      {label}
      <ArrowRight size={15} className="ml-auto -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  )
}

function FeaturedCard({ category, onClick }) {
  const f = FEATURED[category.name] || FEATURED["Men's"]
  return (
    <Link
      href={category.link}
      onClick={onClick}
      className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-2xl bg-neutral-950 p-6 text-white"
    >
      <div
        className="absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-60 transition-transform duration-700 group-hover:scale-125"
        style={{ background: `radial-gradient(circle, ${f.accent} 0%, transparent 70%)` }}
      />
      <motion.div
        className="absolute right-0 top-4 h-36 w-64"
        initial={{ x: 40, rotate: -18, opacity: 0 }}
        animate={{ x: 0, rotate: -12, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.05 }}
      >
        <Image
          src={f.image}
          alt=""
          fill
          sizes="256px"
          className="object-contain transition-transform duration-500 group-hover:-translate-y-2 group-hover:-rotate-3"
        />
      </motion.div>
      <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
        {category.name} collection
      </p>
      <p className="relative mt-1 text-xl font-bold leading-tight">{f.title}</p>
      <span className="relative mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
        Shop now
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
