import React from 'react'
import CountOverview from './CountOverview'
import OrderStatus from './OrderStatus'
import LatestOrder from './LatestOrder'

const AdminDashboard = () => {
  return (
    <div>
      <CountOverview/>


      <div className='py-18'>
        <OrderStatus/>
      </div>

       <div className='py-2'>
       <LatestOrder/>
      </div>


      </div>
  )
}

export default AdminDashboard