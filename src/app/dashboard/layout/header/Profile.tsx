'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import * as profileData from './Data'
import SimpleBar from 'simplebar-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

const Profile = () => {
  const { isLoading, logout, activeProfile, activeProfileImage, profileName } = useAuth(); // Updated useAuth hook
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  return (
    <div className='relative group/menu ps-15 shrink-0'>
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
        <DropdownMenuContent align="end" className='w-screen sm:w-[200px] pb-4 pt-2 rounded-sm'>
        <Avatar className='text-center mx-auto mb-4 mt-4'>
              <AvatarImage
                src={activeProfileImage || `https://ui-avatars.com/api/?name=${(profileName || activeProfile || '').replace(/\s/g, '+')}&background=random`}
                alt={activeProfile || 'Profile'}
              />
              <AvatarFallback>{profileName ? getInitials(profileName) : ''}</AvatarFallback>
            </Avatar>
          <DropdownMenuLabel className='text-center mx-auto'>{activeProfile || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuLabel className='text-center mx-auto mb-4'>{profileName || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <SimpleBar>
            <DropdownMenuItem asChild>
              <Link
                href="/images/svgs/icon-account.svg"
                className='px-4 py-2 flex justify-between items-center group/link w-full hover:bg-lightprimary hover:text-primary'>
                <div className='flex items-center gap-3 w-full'>
                  <Icon
                    icon="tabler:user"
                    className='text-lg group-hover/link:text-primary'
                  />
                  <h5 className='mb-0 text-sm  group-hover/link:text-primary'>
                    Switch Profile
                  </h5>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="#"
                onClick={logout}
                className="px-4 py-2 flex justify-between items-center group/link w-full hover:bg-lightprimary hover:text-primary"
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon
                    icon="tabler:logout"
                    className="text-lg group-hover/link:text-primary"
                  />
                  <h5 className="mb-0 text-sm group-hover/link:text-primary">
                    Logout
                  </h5>
                </div>
              </Link>
            </DropdownMenuItem>
          </SimpleBar>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Profile
