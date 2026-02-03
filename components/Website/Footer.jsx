"use client"

import {
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Settings,
  Headphones,
  Info,
  Globe,
  ArrowRight,
} from "lucide-react"
import { BsWhatsapp } from "react-icons/bs"

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200">

      {/* ================= NEWSLETTER ================= */}
      <div className="border-b bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* LEFT */}
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-400">
              Newsletter
            </h3>

            <p className="mt-2 text-3xl sm:text-4xl font-bold text-white">
              Sign up for our newsletter
            </p>

            <p className="mt-4 text-gray-100 max-w-md">
              Get exclusive updates, early access to offers, and the latest releases
              delivered straight to your inbox.
            </p>
          </div>

          {/* RIGHT */}
          <div>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="
                  flex-1 px-4 py-3
                  bg-transparent
                  border border-gray-600
                  rounded-xl
                  text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-white
                "
              />

              <button
                type="submit"
                className="
                  px-6 py-3
                  bg-white text-gray-900
                  rounded-full font-semibold
                  hover:bg-gray-200 transition
                "
              >
                Subscribe
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-100 leading-relaxed">
             By signing up you consent to receive updates by email
             about our latest new releases and our best special 
             offers. We will never share your personal information 
             with third parties for their marketing purposes and you
              can unsubscribe at any time. For more information
               please see our privacy statement.
            </p>
          </div>
        </div>
      </div>

      {/* ================= LINKS ================= */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-18 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-sm">

        {/* SUPPORT */}
        <ul className="space-y-4">
          <li className="flex items-center gap-2 hover:text-white cursor-pointer">
            <MessageCircle size={16} /> Chat
          </li>
         <li className="flex items-center gap-2 hover:text-green-500 cursor-pointer">
          <a
            href="https://wa.me/911234567890" // replace with your WhatsApp number
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <BsWhatsapp size={18} /> WhatsApp
          </a>
        </li>

          <li className="flex items-center gap-2 hover:text-white cursor-pointer">
            <Headphones size={16} /> Contact Us
          </li>
          <li className="flex items-center gap-2 hover:text-white cursor-pointer">
            <Settings size={16} /> Manage Cookies Settings
          </li>
          <li className="flex items-center gap-2 font-medium">
            <Info size={16} /> Help Code: 743163
          </li>
        </ul>

        {/* SOCIAL TEXT LINKS */}
        <ul className="space-y-4">
          <li className="flex items-center gap-2 hover:text-red-500 cursor-pointer">
          <a
            href="https://www.youtube.com/channel/YourChannelID" // replace with your YouTube channel link
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Youtube size={16} /> YouTube
          </a>
        </li>
          <ul className="flex flex-col gap-2">
          {/* Instagram */}
          <li className="flex items-center gap-2 hover:text-pink-500 cursor-pointer">
            <a
              href="https://www.instagram.com/YourInstagramProfile" // replace with your link
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Instagram size={16} /> Instagram
            </a>
          </li>

          {/* X / Twitter */}
          <li className="flex items-center gap-2 hover:text-blue-500 cursor-pointer">
            <a
              href="https://twitter.com/YourTwitterProfile" // replace with your link
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Twitter size={16} /> X
            </a>
          </li>

          {/* Strava */}
          <li className="flex items-center gap-2 hover:text-orange-500 cursor-pointer">
            <a
              href="https://www.strava.com/athletes/YourStravaID" // replace with your link
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ArrowRight size={16} /> Strava
            </a>
          </li>

          {/* Facebook */}
          <li className="flex items-center gap-2 hover:text-blue-700 cursor-pointer">
            <a
              href="https://www.facebook.com/YourFacebookProfile" // replace with your link
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Facebook size={16} /> Facebook
            </a>
          </li>

          {/* Komoot */}
          <li className="flex items-center gap-2 hover:text-green-500 cursor-pointer">
            <a
              href="https://www.komoot.com/user/YourKomootID" // replace with your link
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ArrowRight size={16} /> Komoot
            </a>
          </li>
        </ul>

        </ul>

        {/* ORDER INFO */}
        <div>
          <h4 className="text-xl font-semibold mb-4 text-white">Order Info</h4>
          <ul className="space-y-2">
            <li>Order Tracking</li>
            <li>Delivery & Returns</li>
            <li>Gift Vouchers</li>
            <li>Student Discount</li>
          </ul>
        </div>

        {/* CUSTOMER CARE */}
        <div>
          <h4 className="text-xl font-semibold mb-4 text-white">Customer Care</h4>
          <ul className="space-y-2">
            <li>Help Centre</li>
            <li>My Account</li>
            <li>ULTRA Membership</li>
            <li>Price Beat Promise</li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h4 className="text-xl font-semibold mb-4 text-white">Company</h4>
          <ul className="space-y-2">
            <li>About Us</li>
            <li>Careers</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* LANGUAGE */}
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span>English</span>
            <button className="underline text-sm">Change</button>
          </div>

          {/* ICONS */}
          <div className="flex gap-5">
            <Youtube className="hover:opacity-70 cursor-pointer" />
            <Instagram className="hover:opacity-70 cursor-pointer" />
            <Twitter className="hover:opacity-70 cursor-pointer" />
            <Facebook className="hover:opacity-70 cursor-pointer" />
          </div>
        </div>

        <div className="bg-gray-900 text-center py-4 text-xs text-gray-400">
          © 2026 B-sporting Limited | All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
