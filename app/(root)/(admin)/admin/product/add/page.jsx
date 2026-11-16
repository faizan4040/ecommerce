'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { HeaderButton, PageHeader } from '@/components/Application/Admin/product/AdminUI'
import ProductForm from '@/components/Application/Admin/product/ProductForm'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD } from '@/routes/AdminPanelRoute'
import { Layers, List, PackagePlus } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Add Product' },
]

export default function AddProduct() {
  return (
    <div className="pb-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="mt-4">
        <PageHeader
          icon={PackagePlus}
          eyebrow="Catalog"
          title="Add a new product"
          subtitle="Add details, upload images & video from your device, set pricing and SEO. Then add colour & size variants."
          actions={
            <>
              <HeaderButton href={ADMIN_PRODUCT_SHOW} variant="ghost"><List className="h-4 w-4" /> All products</HeaderButton>
              <HeaderButton href={ADMIN_PRODUCT_VARIANT_ADD}><Layers className="h-4 w-4" /> Add variant</HeaderButton>
            </>
          }
        />
      </div>
      <ProductForm mode="add" />
    </div>
  )
}
