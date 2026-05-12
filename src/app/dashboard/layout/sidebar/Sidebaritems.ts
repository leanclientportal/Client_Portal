import { uniqueId } from 'lodash'

export interface ChildItem {
  id?: number | string
  name?: string
  icon?: any
  children?: ChildItem[]
  item?: any
  url?: any
  color?: string
  disabled?: boolean
  subtitle?: string
  badge?: boolean
  badgeType?: string
  isPro?: boolean
}

export interface MenuItem {
  heading?: string
  name?: string
  icon?: any
  id?: number
  to?: string
  items?: MenuItem[]
  children?: ChildItem[]
  url?: any
  disabled?: boolean
  subtitle?: string
  badgeType?: string
  badge?: boolean
  isPro?: boolean
}

const SidebarContent: MenuItem[] = [
  {
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-2-linear',
        id: uniqueId(),
        url: '/',
      },
      {
        name: 'Clients',
        icon: 'solar:users-group-rounded-linear',
        id: uniqueId(),
        url: '/dashboard/clients',
      },
      {
        name: 'Projects',
        icon: 'solar:rocket-linear',
        id: uniqueId(),
        url: '/dashboard/projects',
      },
      {
        name: 'Chats',
        icon: 'solar:dialog-linear',
        id: uniqueId(),
        url: '/dashboard/chat',
      },
      {
        name: 'Templates',
        icon: 'solar:notes-minimalistic-outline',
        id: uniqueId(),
        url: '/dashboard/templates',
      },
      {
        name: 'Settings',
        icon: 'solar:settings-minimalistic-linear',
        id: uniqueId(),
        url: '/dashboard/settings',
      }
    ],
  },
  {
    heading: 'Plan Management',
    children: [
      {
        name: 'Free Plan',
        icon: 'solar:tag-linear',
        id: uniqueId(),
        url: '/dashboard/plan/free',
        badge: true,
        badgeType: 'success',
      },
      {
        name: 'Upgrade Plan',
        icon: 'solar:medal-ribbon-linear',
        id: uniqueId(),
        url: '/dashboard/plan/upgrade',
        isPro: true,
      },
    ],
  },
]

export default SidebarContent
