'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import ViewAction from '@/components/Application/Admin/ViewAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_ORDER_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import { ADMIN_COUPON_ADD, ADMIN_DASHBOARD, ADMIN_ORDER_DETAILS, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { FilePlus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'

const breadcrumbData = [
  {href: ADMIN_DASHBOARD, label: 'Home'},
  {href: "", label: 'Orders'},
]

  const ShowOrders = () => {

    const columns = useMemo(()=>{
    return columnConfig(DT_ORDER_COLUMN)
    },[])
   
    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        actionMenu.push(<ViewAction key="edit" href={ADMIN_ORDER_DETAILS(row.original.order_id)}/>)
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType}/>)
        return actionMenu
    }, [])



  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData}/>
        <div className='py-4'>
        <Card className="py-0 max-w-302.5 rounded-3xl shadow-sm gap-0">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
        <div className='flex justify-between items-center'>
          <h4 className='text-xl font-semibold'>Orders</h4>
          
        <Button className='bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white'>
          <FilePlus/>
          <Link href={ADMIN_COUPON_ADD} >New Coupon</Link>
        </Button>

        </div>
        </CardHeader>
        <CardContent className='pb-5 px-0 pt-0'>
           <DatatableWrapper
            querykey="orders-data"
            fetchUrl="/api/orders"
            initialPageSize={10}
            columnsConfig={columns}
            exportEndpoint="/api/orders/export"
            deleteEndpoint="/api/orders/delete"
            deleteType="SD"
            trashView={`${ADMIN_TRASH}?trashof=orders`}
            createAction={action}
           />
        </CardContent>
        </Card>
        </div>
    </div>
  )
}

export default ShowOrders