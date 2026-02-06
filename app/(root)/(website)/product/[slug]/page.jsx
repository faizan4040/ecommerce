import React from 'react'

const ProductPage = async({ params, searchParams }) => {
  const { slug } = await params
  const { color, size } = await searchParams

  
  return (
    <div>ProductPage</div>
  )
}

export default ProductPage