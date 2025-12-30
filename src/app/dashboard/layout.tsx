'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  UserPlus,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { useUserRole } from "@/hooks/use-user-role";
import { menuConfig } from "@/lib/menu-config";
import { SettingsProvider } from "@/providers/SettingsProvider";

const quickLinks = [
  {
    title: "Add New Client",
    icon: UserPlus,
    href: "/dashboard/clients/add",
  },
  {
    title: "Add New Project",
    icon: Briefcase,
    href: "/dashboard/projects/add",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, logout, activeProfile, activeProfileImage, profileName } = useAuth(); // Updated useAuth hook
  const pathname = usePathname();
  const role = useUserRole();

  const navItems = role ? menuConfig[role] : [];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const activeItem = (() => {
    if (pathname.includes('/projects')) {
      return navItems.find((item) => item.href === '/dashboard/projects');
    }
    return navItems
      .slice()
      .reverse()
      .find((item) => pathname.startsWith(item.href));
  })();

  if (isLoading || !role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <SidebarProvider>
        <Sidebar role={role}>
          <SidebarHeader>
            <div className="p-2">
              <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <React.Fragment key={item.href}>
                  <SidebarMenuItem>
                    <Link href={item.href} passHref>
                      <SidebarMenuButton
                        isActive={activeItem?.href === item.href}
                        tooltip={item.title}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <ModeToggle />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Logout">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-background sm:px-6 sm:py-4 shadow-md">
            <SidebarTrigger className="sm:hidden" />
            <div>
              <h1 className="text-lg font-semibold">Hello, {profileName}</h1>
              <p className="text-sm text-muted-foreground">Welcome back, let's get to work!</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {activeProfile == "tenant" &&
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="link">Quick Link</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {activeProfile == "tenant" && quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <DropdownMenuItem key={link.title} asChild>
                          <Link href={link.href}>
                            <Icon className="h-4 w-4 mr-2" />
                            {link.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                    <Avatar>
                      <AvatarImage
                        src={activeProfileImage || `https://ui-avatars.com/api/?name=${(profileName || activeProfile || '').replace(/\s/g, '+')}&background=random`}
                        alt={activeProfile || 'Profile'}
                      />
                      <AvatarFallback>{profileName ? getInitials(profileName) : ''}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{activeProfile || 'My Account'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/switch-profile">Switch Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SettingsProvider>
  );
}
