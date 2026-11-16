'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { HeaderButton, PageHeader } from '@/components/Application/Admin/product/AdminUI'
import VariantForm from '@/components/Application/Admin/product/VariantForm'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import { Layers, List, PackagePlus } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
  { href: '', label: 'Add Variant' },
]

export default function AddProductVariant() {
  return (
    <div className="pb-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="mt-4">
        <PageHeader
          icon={Layers}
          eyebrow="Catalog"
          title="Add colour & sizes"
          subtitle="Pick a product, choose one colour, tick all its sizes – each size gets its own stock and SKU."
          actions={
            <>
              <HeaderButton href={ADMIN_PRODUCT_VARIANT_SHOW} variant="ghost"><List className="h-4 w-4" /> All variants</HeaderButton>
              <HeaderButton href={ADMIN_PRODUCT_ADD}><PackagePlus className="h-4 w-4" /> New product</HeaderButton>
            </>
          }
        />
      </div>
      <VariantForm mode="add" />
    </div>
  )
}
