'use client'

import AdminListPage from '@/components/Application/Admin/product/AdminListPage'
import { DT_PRODUCT_COLUMN } from '@/lib/column'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_EDIT, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { Layers, PackagePlus, ShoppingBag } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
]

export default function ShowProduct() {
  return (
    <AdminListPage
      breadcrumbData={breadcrumbData}
      icon={ShoppingBag}
      eyebrow="Catalog"
      title="All products"
      subtitle="Search, edit or remove products. Variant count and total stock are calculated live."
      actions={[
        { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Variants', icon: Layers, variant: 'ghost' },
        { href: ADMIN_PRODUCT_ADD, label: 'New product', icon: PackagePlus },
      ]}
      columns={DT_PRODUCT_COLUMN}
      queryKey="product-data"
      fetchUrl="/api/product"
      exportEndpoint="/api/product/export"
      deleteEndpoint="/api/product/delete"
      trashView={`${ADMIN_TRASH}?trashof=product`}
      editHref={ADMIN_PRODUCT_EDIT}
    />
  )
}
