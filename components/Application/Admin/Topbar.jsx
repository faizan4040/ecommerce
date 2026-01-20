'use client'

import React from 'react'
import ThemeSwitch from './ThemeSwitch'
import UserDropdown from './UserDropdown'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { BsBlockquoteLeft } from "react-icons/bs";

const Topbar = () => {
  const {toggleSidebar} = useSidebar()

  return (
    <div className='fixed border h-14 w-full top-0 left-0 z-30 md:ps-72 md:pe-8 px-5
    flex justify-between items-center bg-stone-100 dark:bg-card'>
    
    <div>
        searchbar 
    </div>

    <div className='flex items-center gap-2'>
         <ThemeSwitch/>
         <UserDropdown/>
         <Button onClick={toggleSidebar} type='button' size='icon' className='ms-2 md:hidden bg-orange-500'>
          <BsBlockquoteLeft />
         </Button>
    </div>    



    </div>
  )
}

export default Topbar