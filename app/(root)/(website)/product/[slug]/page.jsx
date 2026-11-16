import { toPlainText } from '@/lib/richText'
import ProductDetails from './productDetails'

const API = process.env.NEXT_PUBLIC_API_BASE_URL
const SITE = process.env.NEXT_PUBLIC_BASE_URL || ''

async function getProduct(slug, search = {}) {
  const qs = new URLSearchParams()
  if (search.color) qs.set('color', search.color)
  if (search.size) qs.set('size', search.size)
  try {
    const res = await fetch(`${API}/product/details/${slug}${qs.size ? `?${qs}` : ''}`, { cache: 'no-store' })
    const json = await res.json()
    return json?.success ? json.data : null
  } catch {
    return null
  }
}

// handles both HTML and Markdown descriptions
const plain = (stored, max = 160) => toPlainText(stored).slice(0, max)

/* ---------- SEO: <title>, description, keywords, Open Graph, Twitter ---------- */
export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getProduct(slug)
  if (!data?.product) return { title: 'Product not found' }

  const p = data.product
  const title = p.seo?.metaTitle || `${p.name}${p.brand ? ` | ${p.brand}` : ''}`
  const description = p.seo?.metaDescription || plain(p.description)
  const image = data.variant?.media?.[0]?.secure_url || p.media?.[0]?.secure_url
  const url = `${SITE}/product/${p.slug}`

  return {
    title,
    description,
    keywords: p.seo?.keywords?.length ? p.seo.keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 1200, alt: p.name }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  }
}

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params
  const { color, size } = await searchParams
  const data = await getProduct(slug, { color, size })

  if (!data?.product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-6xl">👟</p>
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p className="text-neutral-500">It may have been removed or the link is wrong.</p>
      </div>
    )
  }

  const { product, variant, variants = [], colors = [], reviewCount = 0, rating = 0 } = data

  // Google "Product" rich result
  const prices = variants.map((v) => v.sellingPrice).filter(Boolean)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seo?.metaDescription || plain(product.description, 300),
    image: [...(variant?.media || []), ...(product.media || [])].map((m) => m.secure_url).slice(0, 6),
    sku: variant?.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category?.name,
    ...(reviewCount > 0 && rating
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, reviewCount } }
      : {}),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: prices.length ? Math.min(...prices) : product.sellingPrice,
      highPrice: prices.length ? Math.max(...prices) : product.sellingPrice,
      offerCount: variants.length || 1,
      availability: variants.some((v) => v.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE}/product/${product.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductDetails
        product={product}
        variant={variant}
        variants={variants}
        colors={colors}
        reviewCount={reviewCount}
        rating={rating}
      />
    </>
  )
}
