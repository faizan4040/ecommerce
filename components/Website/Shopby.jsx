"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { IMAGES } from "@/routes/Images"

const categories = [
  {
    id: 1,
    title: "Men",
    image: IMAGES.men,
    link: "/shop/men",
  },
  {
    id: 2,
    title: "Women",
    image: IMAGES.womens,
    link: "/shop/women",
  },
  {
    id: 3,
    title: "Kids",
    image: IMAGES.kids,
    link: "/shop/kids",
  },
]

const Shopby = () => {
  const router = useRouter()

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-24">
      
      {/* HEADER */}
      <h2 className="text-3xl sm:text-4xl font-bold mb-10">
        Shop by
      </h2>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((item) => (
          <div
            key={item.id}
            className="
              relative
              h-80 sm:h-95
              rounded-2xl
              overflow-hidden
              group
              cursor-pointer
            "
            onClick={() => router.push(item.link)}
          >
            {/* IMAGE */}
            <img
              src={item.image}
              alt={item.title}
              className="
                w-full h-full object-cover
                transition-transform duration-700
                group-hover:scale-110
              "
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/30" />

            {/* CONTENT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                {item.title}
              </h3>

              <button
                className="
                  px-6 py-2
                  border border-white
                  rounded-full
                  text-sm font-medium
                  backdrop-blur-sm
                  bg-white/10
                  hover:bg-white hover:text-black
                  transition-all duration-300 cursor-pointer
                "
              >
                Shop Shoes
              </button>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

export default Shopby
