"use client"

import axios from "axios"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import ProductBox from "./ProductBox"

const FeatureProduct = () => {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const limit = 8 // 4 cards per row × 2 rows initially = 8 products

  const fetchProducts = async () => {
    if (!hasMore) return
    setLoading(true)
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product?page=${page}&limit=${limit}`
      )
      if (!data.data || data.data.length < limit) setHasMore(false)
      setProducts(prev => [...prev, ...data.data])
      setPage(prev => prev + 1)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Feature Products</h2>
        <Link
          href="/products"
          className="text-sm sm:text-base underline underline-offset-4 hover:text-primary"
        >
          View All
        </Link>
      </div>

      {/* Product Grid: 4 cards per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No products found.
          </div>
        )}

        {products.map((product, index) => (
          <ProductBox key={`${product._id}-${index}`} product={product} />
        ))}
      </div>

      {/* Loading */}
      {loading && <p className="text-center mt-6 text-gray-500">Loading...</p>}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={fetchProducts}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-orange-500 cursor-pointer transition"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  )
}

export default FeatureProduct
