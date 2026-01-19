import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { IMAGES } from "@/lib/images";
import { Button } from '@/components/ui/button'
import { BsReverseLayoutSidebarInsetReverse } from "react-icons/bs";
import { FaWindowClose } from "react-icons/fa";


const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div>
            <img src={IMAGES.src} height={50} className="block dark:hidden" alt="logo dark"/>
            <img src={IMAGES.src} height={50} className="hidden dark:block" alt="logo white"/>
            <Button type="button" size="icon" className="md-hidden">
              <FaWindowClose/>
            </Button>
        </div>
      </SidebarHeader>
     
    </Sidebar>
  )
}

export default AppSidebar