import React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { LucideChevronRight } from "lucide-react"
import { FaWindowClose } from "react-icons/fa"

import { IMAGES } from "@/lib/images"
import { adminAppSidebarMenu } from "@/lib/adminSidebarMenu"

const AppSidebar = () => {
  return (
    <Sidebar className='z-50'>
      {/* ================= HEADER ================= */}
      <SidebarHeader className="border-b h-14 p-0">
        <div className="flex justify-between items-center px-4 h-full">
          {/* Light logo */}
          <img
            src={IMAGES.logo}
            alt="Logo"
            width={140}
            height={40}
            className="block dark:hidden w-auto h-10"
          />

          {/* Dark logo */}
          <Image
            src={IMAGES.logoWhite}
            alt="Logo Dark"
            width={140}
            height={40}
            className="hidden dark:block w-auto h-10"
          />

          <Button type="button" size="icon" className="md:hidden">
            <FaWindowClose />
          </Button>
        </div>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}
      <SidebarContent className='p-3 '>
        <SidebarMenu>
          {adminAppSidebarMenu.map((menu, index) => (
            <Collapsible key={index} className="group/collapsible">
              <SidebarMenuItem>
                {/* ===== Main Menu Button ===== */}
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild className='font-semibold px-2 py-5 '>
                    <Link href={menu.url ?? "#"} className="flex items-center gap-2">
                      <menu.icon className="h-4 w-4" />
                      <span>{menu.title}</span>

                      {menu.submenu?.length > 0 && (
                        <LucideChevronRight
                          className="ml-auto transition-transform duration-200 
                          group-data-[state=open]/collapsible:rotate-90"
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {/* ===== Sub Menu ===== */}
                {menu.submenu?.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {menu.submenu.map((submenuItem, subIndex) => (
                        <SidebarMenuSubItem key={subIndex}>
                          <SidebarMenuSubButton asChild className='px-2 py-5 '>
                            <Link href={submenuItem.url}>
                              {submenuItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
