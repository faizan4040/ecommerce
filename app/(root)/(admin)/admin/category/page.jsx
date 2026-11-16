'use client'

import AdminListPage from '@/components/Application/Admin/product/AdminListPage'
import { DT_CATEGORY_COLUMN } from '@/lib/column'
import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_EDIT, ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { FolderPlus, FolderTree, ShoppingBag } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
]

export default function ShowCategory() {
  return (
    <AdminListPage
      breadcrumbData={breadcrumbData}
      icon={FolderTree}
      eyebrow="Catalog"
      title="All categories"
      subtitle="Organise products into categories for filters, menus and SEO."
      actions={[
        { href: ADMIN_PRODUCT_SHOW, label: 'Products', icon: ShoppingBag, variant: 'ghost' },
        { href: ADMIN_CATEGORY_ADD, label: 'New category', icon: FolderPlus },
      ]}
      columns={DT_CATEGORY_COLUMN}
      queryKey="category-data"
      fetchUrl="/api/category"
      exportEndpoint="/api/category/export"
      deleteEndpoint="/api/category/delete"
      trashView={`${ADMIN_TRASH}?trashof=category`}
      editHref={ADMIN_CATEGORY_EDIT}
    />
  )
}
