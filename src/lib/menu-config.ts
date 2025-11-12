
import { Home, Rocket, Users, Settings } from 'lucide-react';

export const menuConfig = {
  tenant: [
    { title: 'Dashboard', icon: Home, href: '/dashboard' },
    { title: 'Projects', icon: Rocket, href: '/dashboard/projects' },
    { title: 'Clients', icon: Users, href: '/dashboard/clients' },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ],
  client: [
    { title: 'Dashboard', icon: Home, href: '/dashboard' },
    { title: 'Projects', icon: Rocket, href: '/dashboard/projects' },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ],
};
