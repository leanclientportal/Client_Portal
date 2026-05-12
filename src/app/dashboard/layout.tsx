'use client'

import Header from './layout/header/Header'
import Sidebar from './layout/sidebar/Sidebar'
import { useIsMobile } from '@/hooks/use-mobile';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className='flex w-full min-h-screen bg-lightgray dark:bg-dark'>
        <div className='page-wrapper flex w-full'>
          {/* Header/sidebar */}
          {!isMobile && (
            <div className='xl:block hidden'>
              <Sidebar />
            </div>
          )}

          <div className={`body-wrapper w-full transition-all duration-300`}>
            {/* Top Header  */}
            <Header />
            {/* Body Content  */}
            <div className={`container mx-auto px-6 py-1`}>{children}</div>
          </div>
        </div>
      </div>
    </>
  )
}