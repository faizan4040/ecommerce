'use client'
import { useEffect, useRef, useState } from "react"
import {
  Menu,
  Search,
  Heart,
  ChevronDown,
  Globe,
} from "lucide-react"
import { WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Card from '@/components/Website/Card'
import Link from "next/link"
import { useSelector } from "react-redux"
import { Avatar, AvatarImage } from "../ui/avatar"
import { IMAGES } from "@/routes/Images"
import {
  X,
  ChevronRight,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { IoSearchOutline } from "react-icons/io5"



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
    const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [open, setOpen] = useState(false)
  const [adIndex, setAdIndex] = useState(0)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const auth = useSelector(store => store.authStore.auth)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  const handleCategoryClick = (category) => {
  setActiveCategory(category)   // highlight category in header
  setActiveItem(category)       // show content in sidebar
  setSidebarOpen(true)          // open sidebar
}

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
      if (miniBarRef.current && !miniBarRef.current.contains(e.target)) setOpen(false)
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (mobileMenuOpen && !e.target.closest("#mobile-menu")) setMobileMenuOpen(false)
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [mobileMenuOpen])




    const handleSearch = () => {
    if (query.trim() !== "") {
      router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="sticky top-0 z-50">
      <header className="relative z-50">
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
            <ChevronDown size={14} className={`transition-transform cursor-pointer ${open ? "rotate-180" : ""}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
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
        <div className="bg-gray-900 text-white px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-14">
            {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:flex items-center gap-2 text-white cursor-pointer"
          >
            <Menu size={24} />
          </button>

             <Link href={WEBSITE_HOME} className="font-bold tracking-wide">
              <img
               src={IMAGES.logo}
               className="h-9 w-38"
              />
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8 relative">
            {/* SEARCH */}
          <div className="relative flex items-center">
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className="px-4 py-2 bg-black text-white rounded-l-full flex items-center gap-2 z-10 cursor-pointer"
                >
                  <IoSearchOutline size={16} />
                  Search
                </button>

                {/* Animated search input */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${showSearch ? 'w-60 sm:w-[320px] md:w-100 lg:w-125 ml-2' : 'w-0'}
                  `}
                >
                  <div className="relative">
                    {/* Search icon inside input */}
                    <IoSearchOutline
                      size={16} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 rounded-r-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Search products, categories, pages..."
                    />
                  </div>
                </div>
              </div>



            {/* LANGUAGE */}
            <button
              onClick={() => { setLangOpen(!langOpen); setProfileOpen(false) }}
              className="flex items-center gap-1.5 text-sm hover:underline"
            >
              <Globe size={16} />
              <span>EN £</span>
            </button>

            {langOpen && (
              <div ref={langRef} className="absolute right-0 top-14 z-50 w-80 bg-white text-black rounded-2xl shadow-xl border p-6">
                <h4 className="text-xs font-semibold mb-4">Please choose your language or currency</h4>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mb-4">
                  <option>English</option>
                  <option>French</option>
                  <option>German</option>
                </select>
                <button className="w-full bg-black text-white py-2.5 rounded-xl text-sm">Update</button>
              </div>
            )}

           {/* PROFILE / AUTH */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setLangOpen(false);
              }}
              className="flex items-center cursor-pointer"
            >
              {auth ? (
                // Logged-in: show profile avatar
                <Avatar>
                  <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                </Avatar>
              ) : (
                // Not logged-in: show user icon
                <span className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
                  <User size={20} />
                </span>
              )}
            </button>

            {profileOpen && (
              <div
                ref={profileRef}
                className="absolute right-0 mt-5 -mr-20 w-72 cursor-pointer bg-white text-black rounded-2xl shadow-xl border p-6"
              >
                {!auth ? (
                  // User not logged in → show "Create Free Account" button
                  <Link href={WEBSITE_REGISTER}>
                    <button className="w-full bg-black text-white py-2 rounded-xl cursor-pointer">
                      Create Free Account
                    </button>
                  </Link>
                ) : (
                  // User logged in → show profile dropdown
                  <div className="flex flex-col items-center gap-3 cursor-pointer">
                    <Link href={`/profile/${auth.id}`}>
                      <Avatar>
                        <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                      </Avatar>
                    </Link>
                    <span className="font-medium">{auth.name}</span>
                    <Link href={WEBSITE_HOME}>
                      <button className="w-full border py-2 px-4 rounded-xl cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300">Dashboard</button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>


            <Heart className="hidden sm:block cursor-pointer" />
            <Card className="cursor-pointer" />
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden bg-black text-white p-4 space-y-4">
            <input
              className="w-full pl-3 pr-4 py-2 rounded-xl text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Search products"
            />
            {!auth ? (
              <>
                <Link href={WEBSITE_LOGIN}>
                  <button className="w-full border py-2 rounded-xl mb-2">Sign In</button>
                </Link>
                <Link href={WEBSITE_REGISTER}>
                  <button className="w-full bg-white text-black py-2 rounded-xl">Create Free Account</button>
                </Link>
              </>
            ) : (
              <Link href={`/profile/${auth.id}`}>
                <Avatar>
                  <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                </Avatar>
              </Link>
            )}

            <div className="flex flex-col gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveCategory(item)}
                  className={`text-left px-2 py-1 font-medium ${activeCategory === item ? "border-b-2 border-white" : ""}`}
                >
                  {item}
                </button>
              ))}
             <div>Shop</div>
            </div>
          </div>
        )}
      </header>

      {/* OVERLAY */}
<div
  className={`fixed inset-0 z-50 transition-all duration-300 ${
    sidebarOpen ? "bg-black/40 visible" : "invisible"
  }`}
  onClick={() => setSidebarOpen(false)}
/>

{/* SIDEBAR */}
<div
  className={`fixed top-0 left-0 z-50 h-full w-full md:w-325 bg-white shadow-2xl
  transform transition-transform duration-500
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
>
  {/* HEADER */}
  <div className="flex justify-between items-center p-5 border-b ">
    <h3 className="font-semibold text-lg">Menu</h3>
    <button onClick={() => setSidebarOpen(false)} className="cursor-pointer">
      <X size={22} />
    </button>
  </div>

  <div className="flex h-full">
    {/* LEFT MENU */}
    <div className="w-1/6 border-r p-4 space-y-3">
      {categories.map((item) => (
        <button
          key={item}
          onClick={() => {
            setActiveItem(item)
            setActiveCategory(item)
          }}
          className="w-full flex justify-between items-center py-2 px-2 hover:bg-gray-100 rounded-lg"
        >
          <span className="font-medium">{item}</span>
          <ChevronRight size={18} />
        </button>
      ))}
    </div>

    {/* RIGHT CONTENT */}
    <div className="w-1/2 p-4">
      {!activeItem ? (
        <p className="text-gray-400 text-sm">
          Select a category
        </p>
      ) : (
        <div className="space-y-4">
          <h4 className="font-semibold">{activeItem}</h4>

          <img
            src="/dummy-category.jpg"
            alt={activeItem}
            className="rounded-xl w-full h-40 object-cover"
          />

          <p className="text-sm text-gray-600">
            Explore latest products from {activeItem}
          </p>

          <button className="text-sm underline">
            View All {activeItem}
          </button>
        </div>
      )}
    </div>
  </div>
  
</div>


      {/* CATEGORY BAR DESKTOP */}
      <nav className="hidden md:block border-t bg-white">
        <ul className="flex gap-6 px-6 py-3 text-sm font-medium overflow-x-auto">
          {categories.map((item) => (
            <li
            key={item}
            onClick={() => handleCategoryClick(item)}
            className={`cursor-pointer whitespace-nowrap relative ${
              activeCategory === item ? "font-semibold" : ""
            }`}
          >
            {item}
            {activeCategory === item && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-black" />
            )}
          </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
