import React from 'react'
import ThemeSwitch from './ThemeSwitch'
import UserDropdown from './UserDropdown'
import { Button } from '@/components/ui/button'

const Topbar = () => {
  return (
    <div className='fixed border h-14 w-full top-0 left-0 z-30 md:ps-72 md:pe-8 
    flex justify-between items-center bg-white dark:bg-card'>
    
    <div>
        searchbar 
    </div>

    <div className='flex items-center gap-2'>
         <ThemeSwitch/>
         <UserDropdown/>
         <Button type='button' size='icon' className='ms-2 '>

         </Button>
    </div>    



    </div>
  )
}

export default Topbar