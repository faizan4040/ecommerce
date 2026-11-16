'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { HeaderButton, PageHeader } from '@/components/Application/Admin/product/AdminUI'
import CategoryForm from '@/components/Application/Admin/product/CategoryForm'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { FolderPlus, List } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Add Category' },
]

export default function AddCategory() {
  return (
    <div className="pb-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="mt-4">
        <PageHeader
          icon={FolderPlus}
          eyebrow="Catalog"
          title="Add a category"
          subtitle="Group your shoes – Running, Sneakers, Casual… Categories power shop filters and SEO links."
          actions={<HeaderButton href={ADMIN_CATEGORY_SHOW} variant="ghost"><List className="h-4 w-4" /> All categories</HeaderButton>}
        />
      </div>
      <CategoryForm mode="add" />
    </div>
  )
}
