'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { FilePlus } from 'lucide-react'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import ViewAction from '@/components/Application/Admin/ViewAction'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { DT_ORDER_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import {
  ADMIN_DASHBOARD,
  ADMIN_MANUAL_ORDERS_ADD,
  ADMIN_TRASH, // fallback for trash
} from '@/routes/AdminPanelRoute'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Manual Orders' },
]

const ShowManualOrders = () => {
  // Columns for manual orders table
  const manualColumns = useMemo(() => columnConfig(DT_ORDER_COLUMN), [])

  // Actions for each row
  const manualAction = useCallback((row, deleteType, handleDelete) => {
    const manualId = row?.original?._id || '#' // safe fallback
    return [
      <ViewAction
        key="view"
        href={manualId !== '#' ? `/admin/manual-orders/${manualId}` : '#'}
      />,
      <DeleteAction
        key="delete"
        handleDelete={handleDelete}
        row={row}
        deleteType={deleteType}
      />,
    ]
  }, [])

  return (
    <div>
      {/* Breadcrumb */}
      <BreadCrumb breadcrumbData={breadcrumbData} />

      {/* Manual Orders Table */}
      <div className="py-4">
        <Card className="py-0 max-w-300 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b pb-2 flex justify-between items-center">
            <h4 className="text-xl font-semibold">Manual Orders</h4>

            <Button className="bg-[#fff0ea] text-orange-400 hover:bg-orange-500 hover:text-white flex items-center gap-2">
              <FilePlus />
              <Link href={ADMIN_MANUAL_ORDERS_ADD || '#'}>Add Manual Order</Link>
            </Button>
          </CardHeader>

          <CardContent className="pb-5 px-0 pt-0">
            <DatatableWrapper
              querykey="manual-orders-data"
              fetchUrl="/api/orders/manual"
              initialPageSize={10}
              columnsConfig={manualColumns}
              deleteEndpoint="/api/orders/manual/delete"
              deleteType="SD"
              createAction={manualAction}
              trashView={`${ADMIN_TRASH}?trashof=manual-orders`} // safe fallback
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShowManualOrders