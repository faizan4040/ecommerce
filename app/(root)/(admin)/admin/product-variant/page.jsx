'use client'

import AdminListPage from '@/components/Application/Admin/product/AdminListPage'
import { DT_PRODUCT_VARIANT_COLUMN } from '@/lib/column'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_EDIT, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { Layers, Plus, ShoppingBag } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
]

export default function ShowProductVariant() {
  return (
    <AdminListPage
      breadcrumbData={breadcrumbData}
      icon={Layers}
      eyebrow="Catalog"
      title="Product variants"
      subtitle="Every colour + size combination with its own SKU, stock and price."
      actions={[
        { href: ADMIN_PRODUCT_SHOW, label: 'Products', icon: ShoppingBag, variant: 'ghost' },
        { href: ADMIN_PRODUCT_VARIANT_ADD, label: 'Add variant', icon: Plus },
      ]}
      columns={DT_PRODUCT_VARIANT_COLUMN}
      queryKey="product-variant-data"
      fetchUrl="/api/product-variant"
      exportEndpoint="/api/product-variant/export"
      deleteEndpoint="/api/product-variant/delete"
      trashView={`${ADMIN_TRASH}?trashof=product-variant`}
      editHref={ADMIN_PRODUCT_VARIANT_EDIT}
    />
  )
}
