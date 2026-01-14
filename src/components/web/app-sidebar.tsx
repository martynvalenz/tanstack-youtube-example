import * as React from 'react'
import { BookmarkIcon, ChevronsLeftRightEllipsis, Import } from 'lucide-react'

import { NavUser } from '@/components/web/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link, linkOptions } from '@tanstack/react-router'
import { NavPrimary } from './nav-primary'
import { NavPrimaryProps } from '@/lib/types'

const navItems: NavPrimaryProps['items'] = linkOptions([
  // {
  //   title: 'Items',
  //   to: '/dashboard/items',
  //   icon: BookmarkIcon,
  //   activeOptions: { exact: false },
  // },
  // {
  //   title: 'Import',
  //   to: '/dashboard/import',
  //   icon: Import,
  //   activeOptions: { exact: false },
  // },
  // {
  //   title: 'Discover',
  //   to: '/dashboard/discover',
  //   icon: Compass,
  //   activeOptions: { exact: false },
  // },
  {
    title: 'Import JSON',
    to: '/dashboard/import-json',
    icon: Import,
    activeOptions: { exact: false },
  },
  {
    title: 'Imported JSON',
    to: '/dashboard/imported-json',
    icon: Import,
    activeOptions: { exact: false },
  },
  {
    title: 'Scrape link',
    to: '/dashboard/scrape-link',
    icon: ChevronsLeftRightEllipsis,
    activeOptions: { exact: false },
  },
])

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-md p-2">
                  <BookmarkIcon />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium">Recall</span>
                  <span className="text-muted-foreground text-xs">
                    Your AI knowledge base
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPrimary items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
