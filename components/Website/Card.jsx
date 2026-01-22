import React from 'react'
import {ShoppingBag} from "lucide-react"

const Card = () => {
  return (
    <button type='button'>
        <ShoppingBag size={25} className='cursor-pointer'/>
    </button>
  )
}

export default Card