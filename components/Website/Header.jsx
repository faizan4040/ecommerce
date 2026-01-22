"use client"

import { useEffect, useRef, useState } from "react"
import {
  Menu,
  Search,
  User,
  Heart,
  ChevronDown,
  Globe,
} from "lucide-react"
import { WEBSITE_HOME } from "@/routes/WebsiteRoute"
import Card from '@/components/Website/Card'

const ads = [
  "SHOP NOW, PAY WITH KLARNA",
  "FREE DELIVERY ON ORDERS OVER £100",
  "JOIN ULTRA & GET EXCLUSIVE BENEFITS",
]

const categories = [
  "The Sale",
  "New In",
  "Men's",
  "Women's",
  "Kids'",
  "Run",
  "Trail",
  "Hike",
  "Sports",
  "Brands",
  "Partners",
  "Advice",
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [adIndex, setAdIndex] = useState(0)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

 
  const miniBarRef = useRef(null)
  const langRef = useRef(null)
  const profileRef = useRef(null)

  /* Auto ads slider */
  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ads.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  /* Click outside handler */
  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return

      if (miniBarRef.current && !miniBarRef.current.contains(e.target)) {
        setOpen(false)
      }

      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }

      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  return (
    <>
      <header className="relative z-40">
        {/* MINI TOP BAR */}
        <div ref={miniBarRef} className="bg-white text-black text-xs border-b">
          <button
            onClick={() => setOpen(!open)}
            className="group w-full py-2 flex justify-center items-center gap-2"
          >
            <span className="relative font-medium">
              {ads[adIndex]}
              <span className="absolute left-0 -bottom-1 h-px w-0 bg-black transition-all group-hover:w-full" />
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ${
              open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-white border-t shadow-xl">
              <div className="grid md:grid-cols-3 gap-6 p-6 text-sm">
                <div>
                  <h3 className="font-semibold">SHOP NOW, PAY WITH</h3>
                  <p className="text-gray-600">Choose Klarna at checkout.</p>
                </div>
                <div>
                  <h3 className="font-semibold">STUDENT DISCOUNT</h3>
                  <p className="text-gray-600">12% off SS26.</p>
                </div>
                <div>
                  <h3 className="font-semibold">ULTRA</h3>
                  <p className="text-gray-600">10% off first app order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN NAV */}
        <div className="bg-black text-white px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Menu className="cursor-pointer" />
            <a href={WEBSITE_HOME} className="font-bold tracking-wide">
              BRANDLOGO.COM
            </a>
          </div>

          <div className="flex items-center gap-8 relative">
            {/* SEARCH */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 rounded-xl text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Search products"
              />
            </div>

            {/* LANGUAGE */}
            <button
              onClick={() => {
                setLangOpen(!langOpen)
                setProfileOpen(false)
              }}
              className="hidden sm:flex items-center gap-1.5 text-sm hover:underline"
            >
              <Globe size={16} />
              <span>EN £</span>
            </button>

            {langOpen && (
              <div
                ref={langRef}
                className="absolute right-0 top-14 z-50 w-80 bg-white text-black rounded-2xl shadow-xl border p-6"
              >
                <h4 className="text-xs font-semibold mb-4">
                  Please choose your language or currency
                </h4>

                <select className="w-full border rounded-lg px-3 py-2 text-sm mb-4">
                  <option>English</option>
                  <option>French</option>
                  <option>German</option>
                </select>

                <button className="w-full bg-black text-white py-2.5 rounded-xl text-sm">
                  Update
                </button>
              </div>
            )}

            {/* PROFILE */}
            <User
              className="cursor-pointer"
              onClick={() => {
                setProfileOpen(!profileOpen)
                setLangOpen(false)
              }}
            />

            {profileOpen && (
              <div
                ref={profileRef}
                className="absolute right-0 top-14 z-50 w-72 bg-white text-black rounded-2xl shadow-xl border p-6"
              >
                <h4 className="font-semibold mb-2">Join Ultra</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Exclusive offers, faster checkout & early access.
                </p>

                <button className="w-full border py-2 rounded-xl mb-2">
                  Sign In
                </button>
                <button className="w-full bg-black text-white py-2 rounded-xl">
                  Create Free Account
                </button>
              </div>
            )}

            <Heart className="hidden sm:block cursor-pointer" />
            <Card className="cursor-pointer"/>
          </div>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <nav className="border-t bg-white">
        <ul className="flex gap-6 px-6 py-3 text-sm font-medium overflow-x-auto">
          {categories.map((item) => (
            <li key={item} className="cursor-pointer whitespace-nowrap">
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
