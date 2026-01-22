"use client"

import React, { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { IMAGES } from "@/routes/Images"

const products = [
    { id: 1, name: "New Balance 1080v15", desc: "Premium running shoes", image: IMAGES.shoes_1 },
    { id: 2, name: "Nike Pegasus 40", desc: "Daily training comfort", image: IMAGES.shoes_2 },
    { id: 3, name: "Adidas Ultraboost", desc: "Energy return runner", image: IMAGES.shoes_3 },
    { id: 4, name: "Asics Gel Nimbus", desc: "Maximum cushioning", image: IMAGES.shoes_4 },
    { id: 5, name: "Puma Deviate Nitro", desc: "Fast & lightweight", image: IMAGES.shoes_5 },
    { id: 6, name: "Hoka Clifton 9", desc: "Soft ride comfort", image: IMAGES.shoes_6 },
    { id: 7, name: "Saucony Endorphin", desc: "Race-ready speed", image: IMAGES.shoes_7 },
    { id: 8, name: "Brooks Ghost 15", desc: "Balanced cushioning", image: IMAGES.shoes_8 },
    { id: 9, name: "Reebok Floatride", desc: "Responsive & light", image: IMAGES.shoes_9 },
    { id: 10, name: "Mizuno Wave Rider", desc: "Smooth transitions", image: IMAGES.shoes_10 },
]

const ProductSlider = () => {
    const sliderRef = useRef(null)

    const scrollLeft = () => {
        sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" })
    }

    const scrollRight = () => {
        sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" })
    }

    return (
        <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
            {/* HEADER */}
            <div className="flex items-end justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold leading-tight flex gap-4">
                    New in <br />
                    <span className="bg-black rounded-4xl text-white text-sm px-4 py-2 hover:bg-orange-500 cursor-pointer ">Footwear</span>
                </h2>

                {/* ARROWS (hide on mobile) */}
                <div className="hidden sm:flex gap-3">
                    <button
                        onClick={scrollLeft}
                        className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={scrollRight}
                        className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* SLIDER */}
            <div
                ref={sliderRef}
                className="
          flex gap-4 sm:gap-6
          overflow-x-auto overflow-y-visible
          scroll-smooth
          hide-scrollbar
          pb-4
        "
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="
              min-w-[75%]
              sm:min-w-65
              md:min-w-70
              lg:min-w-75
              bg-white rounded-xl
              shadow-md hover:shadow-xl
              transition
            "
                    >
                        {/* IMAGE */}
                        <div className="w-full h-48 sm:h-52 bg-gray-100 rounded-t-xl overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* CONTENT */}
                        <div className="p-4">
                            <h3 className="text-base sm:text-lg font-semibold">
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {product.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default ProductSlider
