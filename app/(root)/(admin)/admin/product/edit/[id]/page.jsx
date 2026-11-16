'use client'

import { use } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { HeaderButton, PageHeader } from '@/components/Application/Admin/product/AdminUI'
import ProductForm from '@/components/Application/Admin/product/ProductForm'
import useFetch from '@/hooks/useFetch'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD } from '@/routes/AdminPanelRoute'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { ExternalLink, Layers, PencilLine } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Edit Product' },
]

export default function EditProduct({ params }) {
  const { id } = use(params)
  const { data, loading } = useFetch(`/api/product/get/${id}`)
  const product = data?.success ? data.data : null

  return (
    <div className="pb-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="mt-4">
        <PageHeader
          icon={PencilLine}
          eyebrow="Catalog"
          title={product ? `Edit: ${product.name}` : 'Edit product'}
          subtitle="Update details, media, pricing and SEO. Prices & discount are re-calculated on save."
          actions={
            product && (
              <>
                <HeaderButton href={WEBSITE_PRODUCT_DETAILS(product.slug)} variant="ghost">
                  <ExternalLink className="h-4 w-4" /> View on site
                </HeaderButton>
                <HeaderButton href={ADMIN_PRODUCT_VARIANT_ADD}><Layers className="h-4 w-4" /> Add variant</HeaderButton>
              </>
            )
          }
        />
      </div>

      {loading || !data ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-3xl bg-muted" />)}
          </div>
          <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        </div>
      ) : product ? (
        <ProductForm mode="edit" initial={product} />
      ) : (
        <div className="mt-6 rounded-3xl border bg-card p-10 text-center text-muted-foreground">Product not found.</div>
      )}
    </div>
  )
}
