import Image from "next/image"
import Link from "next/link"
import VideoSection from "./VideoSection"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

export default function CuponBanner() {
  return (
    <main className="px-4 md:px-8 py-3">
      <section
        className="
          grid grid-cols-1 md:grid-cols-[2fr_1fr]
          items-center
          gap-4
          bg-gray-100
          rounded-xl
          overflow-hidden
          hover:shadow-lg transition
        "
      >
       
        <div className="relative w-full h-[18vh] sm:h-[20vh] md:h-[24vh] bg-white">
          <Image
            src={IMAGES.coupon}
            alt="Coupon Banner"
            fill
            priority
            className="object-contain"
          />
        </div>

       
        <div className="p-4 md:p-6 text-center md:text-left">
          <span className="text-[10px] tracking-widest text-gray-500 uppercase">
            Limited Time
          </span>

          <h1 className="text-xl md:text-2xl font-extrabold leading-tight">
            UP TO <span className="text-red-600">20% OFF</span>
          </h1>

          <p className="text-sm md:text-base font-semibold">
            2026 Collection
          </p>

        
          <Link href={WEBSITE_SHOP}>
            <button
              type="button"
              className="mt-3 bg-black cursor-pointer text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:scale-105 transition"
            >
              Shop Now →
            </button>
          </Link>
        </div>
      </section>

      <div className="mt-6">
        <VideoSection />
      </div>
    </main>
  )
}
