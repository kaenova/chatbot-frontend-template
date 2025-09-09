'use client'

import { usePathname } from 'next/navigation'
import { getNavigationItems, getPageTitle, NavigationItem } from '@/lib/site-config'

export function useNavigation() {
  const pathname = usePathname()

  const getSidebarItems = (): NavigationItem[] => {
    return getNavigationItems('sidebar')
  }

  const getMenuItems = (): NavigationItem[] => {
    return getNavigationItems('menu')
  }

  const getCurrentPageTitle = (): string => {
    return getPageTitle(pathname)
  }

  const isActivePage = (itemPath: string): boolean => {
    if (itemPath === '/chat') {
      return pathname === '/chat' || pathname === '/' || pathname.startsWith('/chat/')
    }
    return pathname.startsWith(itemPath)
  }

  const getActiveNavItem = (): NavigationItem | undefined => {
    const allItems = [...getSidebarItems(), ...getMenuItems()]
    return allItems.find(item => isActivePage(item.path))
  }

  return {
    pathname,
    getSidebarItems,
    getMenuItems,
    getCurrentPageTitle,
    isActivePage,
    getActiveNavItem,
  }
}
