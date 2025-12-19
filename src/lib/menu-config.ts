import { Home, Rocket, Users, Settings, LayoutTemplate, MessageSquare } from 'lucide-react';

export const menuConfig = {
  tenant: [
    { title: 'Dashboard', icon: Home, href: '/dashboard' },
    { title: 'Projects', icon: Rocket, href: '/dashboard/projects' },
    { title: 'Clients', icon: Users, href: '/dashboard/clients' },
    { title: 'Messages', icon: MessageSquare, href: '/dashboard/chat' },
    { title: 'Templates', icon: LayoutTemplate, href: '/dashboard/templates' },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ],
  client: [
    { title: 'Dashboard', icon: Home, href: '/dashboard' },
    { title: 'Projects', icon: Rocket, href: '/dashboard/projects' },
    { title: 'Messages', icon: MessageSquare, href: '/dashboard/chat' },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ],
};
