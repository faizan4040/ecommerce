'use client'

import { use } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { HeaderButton, PageHeader } from '@/components/Application/Admin/product/AdminUI'
import VariantForm from '@/components/Application/Admin/product/VariantForm'
import useFetch from '@/hooks/useFetch'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import { Layers, PencilLine } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
  { href: '', label: 'Edit Variant' },
]

export default function EditProductVariant({ params }) {
  const { id } = use(params)
  const { data, loading } = useFetch(`/api/product-variant/get/${id}`)
  const variant = data?.success ? data.data : null

  return (
    <div className="pb-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="mt-4">
        <PageHeader
          icon={PencilLine}
          eyebrow="Catalog"
          title={variant ? `Edit ${variant.color} · UK ${String(variant.size).replace(/-w$/i, '')}` : 'Edit variant'}
          subtitle="Update colour, size, stock, SKU, price and images for this variant."
          actions={<HeaderButton href={ADMIN_PRODUCT_VARIANT_ADD}><Layers className="h-4 w-4" /> Add variant</HeaderButton>}
        />
      </div>

      {loading || !data ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-3xl bg-muted" />)}
          </div>
          <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        </div>
      ) : variant ? (
        <VariantForm mode="edit" initial={variant} />
      ) : (
        <div className="mt-6 rounded-3xl border bg-card p-10 text-center text-muted-foreground">Variant not found.</div>
      )}
    </div>
  )
}
