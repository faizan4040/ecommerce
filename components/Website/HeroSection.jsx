"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Pause,
  Play,
  ShoppingBag,
  Star,
} from "lucide-react"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

/* ------------------------------------------------------------------ */
/*  DATA – swap images / text / prices with your real products         */
/*  `hue` rotates the shoe image colour when a colour swatch is picked */
/* ------------------------------------------------------------------ */
const SHOES = [
  {
    id: 1,
    tag: "Running",
    name: "Aero Knit Runner",
    desc: "Lightweight running sneakers with breathable knit and elastic laces.",
    price: 129,
    rating: 4,
    image: IMAGES.shoes_cut_1,
    accent: "#f5b82e",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [10],
  },
  {
    id: 2,
    tag: "Lifestyle",
    name: "Cloud Street Low",
    desc: "Everyday comfort with a soft foam midsole and a clean silhouette.",
    price: 99,
    rating: 5,
    image: IMAGES.shoes_cut_2,
    accent: "#e9573f",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [7],
  },
  {
    id: 3,
    tag: "Training",
    name: "Pulse Grip Trainer",
    desc: "Stable base and grippy outsole built for gym and HIIT sessions.",
    price: 149,
    rating: 4,
    image: IMAGES.shoes_cut_3,
    accent: "#3a86ff",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [11],
  },
  {
    id: 4,
    tag: "Trail",
    name: "Ridge Trail Pro",
    desc: "Aggressive lugs and a protective upper for rough terrain.",
    price: 169,
    rating: 5,
    image: IMAGES.shoes_cut_4,
    accent: "#2ec4b6",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [8],
  },
  {
    id: 5,
    tag: "Marathon",
    name: "Tempo Carbon Elite",
    desc: "Carbon-plated race shoe with springy, responsive cushioning.",
    price: 219,
    rating: 4,
    image: IMAGES.shoes_cut_5,
    accent: "#9b5de5",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [9],
  },
  {
    id: 6,
    tag: "Casual",
    name: "Urban Glide Slip",
    desc: "Slip-on knit sneakers with a sock-like fit for all-day wear.",
    price: 89,
    rating: 4,
    image: IMAGES.shoes_cut_6,
    accent: "#ff6b6b",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [],
  },
  {
    id: 7,
    tag: "Racing",
    name: "Velocity Stripe Elite",
    desc: "Featherweight racing flats with a carbon-infused plate for race day.",
    price: 199,
    rating: 5,
    image: IMAGES.shoes_cut_7,
    accent: "#1d7fd1",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [9],
  },
  {
    id: 8,
    tag: "Speed",
    name: "Volt ZoomX Pro",
    desc: "Max-cushion foam and an aggressive rocker for record-chasing runs.",
    price: 249,
    rating: 5,
    image: IMAGES.shoes_cut_8,
    accent: "#c6f432",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [7],
  },
  {
    id: 9,
    tag: "Tempo",
    name: "Sunset Stripe Pro",
    desc: "Bouncy, responsive tempo trainer for fast daily miles.",
    price: 179,
    rating: 4,
    image: IMAGES.shoes_cut_9,
    accent: "#ff7a3d",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [10],
  },
  {
    id: 10,
    tag: "Comfort",
    name: "Cream Cloud Max",
    desc: "Plush stack height and a soft knit upper for long, easy days.",
    price: 159,
    rating: 4,
    image: IMAGES.shoes_cut_10,
    accent: "#e8c9a8",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [],
  },
  {
    id: 11,
    tag: "Sneakers",
    name: "Mint Glide Sneaker",
    desc: "Everyday sneaker with a cloud-soft midsole and breathable mesh.",
    price: 139,
    rating: 4,
    image: IMAGES.sneaker_cut_1,
    accent: "#7ee081",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [8],
  },
  {
    id: 12,
    tag: "Sneakers",
    name: "Crimson Zoom Street",
    desc: "Street-ready sneaker with a visible Zoom unit and bold colour fade.",
    price: 159,
    rating: 5,
    image: IMAGES.sneaker_cut_2,
    accent: "#ff4d5e",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [11],
  },
  {
    id: 13,
    tag: "Sneakers",
    name: "Sand Dune Cruiser",
    desc: "Chunky cushioned sneaker with a rocker sole for all-day comfort.",
    price: 149,
    rating: 4,
    image: IMAGES.sneaker_cut_3,
    accent: "#d4a017",
    sizes: [7, 8, 9, 10, 11],
    soldOut: [],
  },
]

const COLOURS = [
  { name: "Original", swatch: "#1f1f1f", hue: 0 },
  { name: "Amber", swatch: "#f5b82e", hue: 40 },
  { name: "Flame", swatch: "#e9573f", hue: 320 },
  { name: "Ocean", swatch: "#1d7fd1", hue: 180 },
]

const HOLD_MS = 5000 // autoplay: how long each shoe stays in the centre after it lands

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

/*
 * ONE shoe on screen at a time, moving like a foot taking a step:
 *
 *   next (→):  bottom-left  ──arc up──►  centre (lands)  ──arc──►  bottom-right
 *   prev (←):  bottom-right ──arc up──►  centre (lands)  ──arc──►  bottom-left
 *
 * Enter: toe lifted, swings up through a slightly-high point, heel touches down, settles flat.
 * Exit:  heel lifts first (toe tips down), swings up a little, then drops off the far corner.
 */
const ENTER_S = 1.9 // step-in duration (seconds) – bigger = slower
const EXIT_S = 1.4 // step-out duration (seconds) – bigger = slower
const LOCK_MS = (ENTER_S + EXIT_S) * 1000 // no new click until the step finishes
// Autoplay waits for the full step-out + step-in, THEN gives the shoe HOLD_MS on screen
const AUTOPLAY_MS = LOCK_MS + HOLD_MS

const DIST = 65 // how far off-centre (vw) the shoe starts / ends – raise to start further out
const DROP = 32 // how low (vh) it starts / ends
const LIFT = 7 // how high (vh) above centre the arc peaks

/*
 * Smoothness trick: x, y and rotate each get their OWN single smooth curve
 * (no multi-stop keyframes on x/rotate), so the motion never pauses mid-path.
 * Only y has one turning point – the top of the arc – where slowing down is natural.
 */
const EASE_OUT = [0.22, 1, 0.36, 1] // fast start, long soft landing
const EASE_IN = [0.64, 0, 0.78, 0] // soft start, speeds away
const EASE_INOUT = [0.45, 0, 0.55, 1]

const stepVariants = {
  enter: (d) => ({
    x: `${-d * DIST}vw`,
    y: `${DROP}vh`,
    rotate: -d * 28,
    opacity: 0,
  }),
  center: () => ({
    x: "0vw",
    y: [`${DROP}vh`, `${-LIFT}vh`, "0vh"],
    rotate: 0,
    opacity: 1,
    transition: {
      x: { duration: ENTER_S, ease: EASE_OUT },
      y: { duration: ENTER_S, times: [0, 0.55, 1], ease: ["easeOut", EASE_INOUT] },
      rotate: { duration: ENTER_S * 0.95, ease: EASE_OUT },
      opacity: { duration: ENTER_S * 0.3, ease: "linear" },
    },
  }),
  exit: (d) => ({
    x: `${d * DIST}vw`,
    y: ["0vh", `${-LIFT * 0.8}vh`, `${DROP}vh`],
    rotate: d * 30,
    opacity: 0,
    transition: {
      x: { duration: EXIT_S, ease: EASE_IN },
      y: { duration: EXIT_S, times: [0, 0.4, 1], ease: [EASE_INOUT, "easeIn"] },
      rotate: { duration: EXIT_S, ease: EASE_IN },
      opacity: { duration: EXIT_S * 0.3, delay: EXIT_S * 0.7, ease: "linear" },
    },
  }),
}

// Floor shadow shrinks while the shoe is in the air and grows when it lands
const shadowVariants = {
  enter: { opacity: 0, scaleX: 0.3 },
  center: {
    opacity: 1,
    scaleX: 1,
    transition: { delay: ENTER_S * 0.65, duration: ENTER_S * 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, scaleX: 0.3, transition: { duration: EXIT_S * 0.4, ease: "easeIn" } },
}

const textVariants = {
  enter: { y: 30, opacity: 0 },
  center: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.15 + i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
  exit: { y: -20, opacity: 0, transition: { duration: 0.25 } },
}

const pad = (n) => String(n).padStart(2, "0")

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function HeroSection() {
  const [[index, direction], setSlide] = useState([0, 1])
  const [colour, setColour] = useState(0)
  const [size, setSize] = useState(SHOES[0].sizes[0])
  const [liked, setLiked] = useState({})
  const [autoPlay, setAutoPlay] = useState(true)

  const shoe = SHOES[index]
  const activeColour = COLOURS[colour]

  const [spin, setSpin] = useState(0) // cumulative ring rotation
  const lockRef = useRef(0)

  const goTo = useCallback((next, dir) => {
    const now = Date.now()
    if (now - lockRef.current < LOCK_MS) return
    lockRef.current = now
    const i = (next + SHOES.length) % SHOES.length
    setSlide([i, dir])
    setSpin((s) => s + dir * 180)
    setColour(0)
    setSize(SHOES[i].sizes.find((s) => !SHOES[i].soldOut.includes(s)))
  }, [])

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index])

  // Autoplay
  useEffect(() => {
    if (!autoPlay) return
    const t = setTimeout(next, AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [autoPlay, next, index])

  // Preload AND pre-decode every shoe image, so no decoding hitch when a shoe steps in
  useEffect(() => {
    SHOES.forEach((s) => {
      const img = new window.Image()
      img.src = s.image
      img.decode?.().catch(() => {})
    })
  }, [])

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev])

  const accent = colour === 0 ? shoe.accent : activeColour.swatch
  const thumbStart = Math.min(Math.floor(index / 3) * 3, SHOES.length - 3)

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-[#f4f4f2] text-neutral-900 select-none">
      {/* ---------- BACKGROUND DECOR ---------- */}
      {/* Soft colour glow – a gradient (no blur filter) that cross-fades, so it never repaints per frame */}
      <AnimatePresence initial={false}>
        <motion.div
          key={accent}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "linear" }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-[opacity]"
          style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 65%)` }}
        />
      </AnimatePresence>

      {/* Giant faded word behind shoe */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={shoe.tag}
          aria-hidden
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-x-0 top-[18%] text-center font-black uppercase leading-none tracking-tighter text-neutral-900/[0.04] text-[22vw] md:text-[16vw]"
        >
          {shoe.tag}
        </motion.h2>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col px-4 pb-6 pt-8 sm:px-8 md:px-12">
        {/* ---------- MAIN GRID ---------- */}
        <div className="grid flex-1 grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.6fr_1fr]">
          {/* ===== LEFT: info + thumbnails ===== */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div key={shoe.id} initial="enter" animate="center" exit="exit">
                <motion.p
                  variants={textVariants}
                  custom={0}
                  className="text-[11px] font-bold uppercase tracking-[0.25em]"
                >
                  {shoe.tag} —
                </motion.p>

                <motion.h1
                  variants={textVariants}
                  custom={1}
                  className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl xl:text-5xl"
                >
                  {shoe.name}
                </motion.h1>

                <motion.p
                  variants={textVariants}
                  custom={2}
                  className="mx-auto mt-4 max-w-xs text-sm leading-7 text-neutral-500 lg:mx-0 sm:text-base"
                >
                  {shoe.desc}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Thumbnails – shows the group of 3 the current shoe is in; "+N" jumps to the next group */}
            <div className="mt-8 flex justify-center gap-3 lg:justify-start">
              {SHOES.slice(thumbStart, thumbStart + 3).map((s, j) => {
                const i = thumbStart + j
                return (
                  <ThumbButton
                    key={s.id}
                    shoe={s}
                    active={i === index}
                    onClick={() => i !== index && goTo(i, i > index ? 1 : -1)}
                  />
                )
              })}
              <button
                type="button"
                onClick={() => goTo(thumbStart + 3 >= SHOES.length ? 0 : thumbStart + 3, 1)}
                className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-900 text-xs font-bold text-white transition hover:scale-105 cursor-pointer"
                aria-label="More shoes"
              >
                +{SHOES.length - 3}
              </button>
            </div>
          </div>

          {/* ===== CENTER: animated shoe ===== */}
          <div className="relative z-20 order-1 flex h-[42vh] items-center justify-center sm:h-[50vh] lg:order-2 lg:h-[70vh]">
            {/* Rotating ring – smoothly turns half a circle on every change */}
            <motion.div
              aria-hidden
              animate={{ rotate: spin, borderColor: accent }}
              transition={{ duration: ENTER_S, ease: [0.16, 1, 0.3, 1] }}
              className="absolute aspect-square w-[78%] max-w-[560px] rounded-full border-2 border-dashed will-change-transform"
            />
            <motion.div
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="absolute aspect-square w-[62%] max-w-[440px] rounded-full border border-neutral-900/10"
            >
              <span
                className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: accent }}
              />
            </motion.div>

            {/* Floor shadow (one per shoe, appears when the shoe lands) */}
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`shadow-${shoe.id}`}
                aria-hidden
                variants={shadowVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute bottom-[8%] w-[55%]"
              >
                <motion.div
                  className="h-8 w-full will-change-transform"
                  style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.28) 0%, transparent 70%)" }}
                  animate={{ scaleX: [1, 0.85, 1], opacity: [0.65, 0.4, 0.65] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                />
              </motion.div>
            </AnimatePresence>

            {/* The shoe – mode="wait": old shoe steps out fully, THEN the new one steps in */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {/* Layer 1: the step arc */}
              <motion.div
                key={shoe.id}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform"
                style={{ transformOrigin: "50% 80%" }}
              >
                <div className="relative h-[85%] w-[90%]">
                  {/* Layer 2: gentle idle float once landed + swipe */}
                  <motion.div
                    className="pointer-events-auto relative h-full w-full cursor-grab active:cursor-grabbing will-change-transform"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: ENTER_S + 0.1 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.35}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 80) next()
                      else if (info.offset.x < -80) prev()
                    }}
                  >
                    <div
                      className="relative h-full w-full transition-[filter] duration-700 ease-out"
                      style={{
                        filter:
                          colour === 0
                            ? "none"
                            : `hue-rotate(${activeColour.hue}deg) saturate(1.3)`,
                      }}
                    >
                      <Image
                        src={shoe.image}
                        alt={shoe.name}
                        fill
                        priority
                        unoptimized
                        draggable={false}
                        sizes="(max-width: 1024px) 90vw, 50vw"
                        className="object-contain"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Side arrows on the shoe (desktop) */}
            <SideArrow side="left" onClick={prev} />
            <SideArrow side="right" onClick={next} />
          </div>

          {/* ===== RIGHT: size / reviews / price / colour ===== */}
          <div className="order-3 mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto lg:max-w-[280px]">
            {/* Size */}
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Size (UK)</p>
            <div className="mt-3 flex gap-2">
              {shoe.sizes.map((s) => {
                const out = shoe.soldOut.includes(s)
                const active = s === size
                return (
                  <motion.button
                    key={s}
                    type="button"
                    disabled={out}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSize(s)}
                    className={`relative h-11 w-11 rounded-full border text-xs font-semibold transition
                      ${out ? "cursor-not-allowed border-neutral-300 text-neutral-300 line-through" : "cursor-pointer border-neutral-900"}
                      ${active ? "text-white" : ""}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="size-pill"
                        className="absolute inset-0 rounded-full bg-neutral-900"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative">{s}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Reviews */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Reviews
              </p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={`${shoe.id}-${i}`}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 300 }}
                  >
                    <Star
                      size={15}
                      className={i < shoe.rating ? "fill-neutral-500 text-neutral-500" : "text-neutral-400"}
                    />
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Price
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={shoe.price}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  className="text-xl font-extrabold"
                >
                  ${shoe.price}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Colour */}
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em]">
              Colour <span className="font-medium text-neutral-400">— {activeColour.name}</span>
            </p>
            <div className="mt-3 flex gap-4">
              {COLOURS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  onClick={() => setColour(i)}
                  className="relative flex h-9 w-9 items-center justify-center cursor-pointer"
                >
                  {colour === i && (
                    <motion.span
                      layoutId="colour-ring"
                      className="absolute inset-0 rounded-full border-2 border-neutral-900"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.span
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.8 }}
                    className="h-6 w-6 rounded-full shadow-inner"
                    style={{ backgroundColor: c.swatch }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- BOTTOM BAR ---------- */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-4 shadow-sm backdrop-blur-md sm:px-8">
          {/* Autoplay */}
          <button
            type="button"
            onClick={() => setAutoPlay((p) => !p)}
            className="flex items-center gap-3 text-sm font-medium cursor-pointer"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200">
              {autoPlay ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              {autoPlay && (
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <motion.circle
                    key={index}
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                  />
                </svg>
              )}
            </span>
            <span className="hidden sm:inline">{autoPlay ? "Pause" : "Autoplay"}</span>
          </button>

          {/* Arrows */}
          <div className="flex items-center gap-4">
            <ArrowBtn onClick={prev} label="Previous shoe">
              <ArrowLeft size={20} />
            </ArrowBtn>
            <ArrowBtn onClick={next} label="Next shoe">
              <ArrowRight size={20} />
            </ArrowBtn>
          </div>

          {/* Progress */}
          <div className="hidden items-center gap-3 text-xs font-semibold md:flex">
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
              >
                {pad(index + 1)}
              </motion.span>
            </AnimatePresence>
            <div className="flex gap-1.5">
              {SHOES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to ${s.name}`}
                  onClick={() => i !== index && goTo(i, i > index ? 1 : -1)}
                  className="relative h-[2px] w-4 overflow-hidden bg-neutral-300 cursor-pointer"
                >
                  {i === index && (
                    <motion.span
                      layoutId="progress-bar"
                      className="absolute inset-0 bg-neutral-900"
                    />
                  )}
                </button>
              ))}
            </div>
            <span>{pad(SHOES.length)}</span>
          </div>

          {/* Add to cart + wishlist */}
          <div className="flex items-center gap-4">
            <Link href={WEBSITE_SHOP}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-neutral-900 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white sm:px-7"
              >
                <ShoppingBag size={14} />
                Add to cart
              </motion.span>
            </Link>
            <motion.button
              type="button"
              whileTap={{ scale: 1.4 }}
              onClick={() => setLiked((l) => ({ ...l, [shoe.id]: !l[shoe.id] }))}
              aria-label="Add to wishlist"
              className="cursor-pointer"
            >
              <Heart
                size={22}
                className={liked[shoe.id] ? "fill-red-500 text-red-500" : "text-neutral-900"}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SMALL PIECES                                                       */
/* ------------------------------------------------------------------ */
function ThumbButton({ shoe, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.92 }}
      className={`relative h-14 w-14 overflow-hidden rounded-lg bg-white transition cursor-pointer
        ${active ? "ring-2 ring-neutral-900" : "opacity-70 hover:opacity-100"}`}
      aria-label={shoe.name}
    >
      <Image src={shoe.image} alt={shoe.name} fill sizes="56px" className="object-contain p-1.5" />
    </motion.button>
  )
}

function ArrowBtn({ onClick, label, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
    >
      {children}
    </motion.button>
  )
}

function SideArrow({ side, onClick }) {
  const left = side === "left"
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={left ? "Previous shoe" : "Next shoe"}
      whileHover={{ scale: 1.1, x: left ? -4 : 4 }}
      whileTap={{ scale: 0.9 }}
      className={`absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur md:flex cursor-pointer
        ${left ? "left-0" : "right-0"}`}
    >
      {left ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
    </motion.button>
  )
}
