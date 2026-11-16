'use client'

import { useCallback, useMemo } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { columnConfig } from '@/lib/helperfunction'
import { HeaderButton, PageHeader } from './AdminUI'

/**
 * Shared layout for the "All Products", "Product Variants" and "All Category" tables.
 */
export default function AdminListPage({
  breadcrumbData,
  icon,
  eyebrow,
  title,
  subtitle,
  actions = [],
  columns: rawColumns,
  queryKey,
  fetchUrl,
  exportEndpoint,
  deleteEndpoint,
  trashView,
  editHref,
}) {
  const columns = useMemo(() => columnConfig(rawColumns), [rawColumns])

  const action = useCallback(
    (row, deleteType, handleDelete) => [
      <EditAction key="edit" href={editHref(row.original._id)} />,
      <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
    ],
    [editHref]
  )

  return (
    <div className="pb-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="mt-4">
        <PageHeader
          icon={icon}
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          actions={actions.map((a, i) => (
            <HeaderButton key={i} href={a.href} variant={a.variant}>
              {a.icon && <a.icon className="h-4 w-4" />} {a.label}
            </HeaderButton>
          ))}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border bg-card shadow-sm">
        <DatatableWrapper
          querykey={queryKey}
          fetchUrl={fetchUrl}
          initialPageSize={10}
          columnsConfig={columns}
          exportEndpoint={exportEndpoint}
          deleteEndpoint={deleteEndpoint}
          deleteType="SD"
          trashView={trashView}
          createAction={action}
        />
      </div>
    </div>
  )
}
