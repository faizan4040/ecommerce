'use client'

import { use } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { HeaderButton, PageHeader } from '@/components/Application/Admin/product/AdminUI'
import CategoryForm from '@/components/Application/Admin/product/CategoryForm'
import useFetch from '@/hooks/useFetch'
import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { FolderPen, FolderPlus } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Edit Category' },
]

export default function EditCategory({ params }) {
  const { id } = use(params)
  const { data, loading } = useFetch(`/api/category/get/${id}`)
  const category = data?.success ? data.data : null

  return (
    <div className="pb-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="mt-4">
        <PageHeader
          icon={FolderPen}
          eyebrow="Catalog"
          title={category ? `Edit: ${category.name}` : 'Edit category'}
          subtitle="Rename the category or change its URL slug."
          actions={<HeaderButton href={ADMIN_CATEGORY_ADD}><FolderPlus className="h-4 w-4" /> New category</HeaderButton>}
        />
      </div>
      {loading || !data ? (
        <div className="mt-6 h-64 animate-pulse rounded-3xl bg-muted" />
      ) : category ? (
        <CategoryForm mode="edit" initial={category} />
      ) : (
        <div className="mt-6 rounded-3xl border bg-card p-10 text-center text-muted-foreground">Category not found.</div>
      )}
    </div>
  )
}
