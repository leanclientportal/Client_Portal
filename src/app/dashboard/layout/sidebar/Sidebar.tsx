import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import SidebarContent from './Sidebaritems';
import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import FullLogo from '../shared/logo/FullLogo';
import {
  AMLogo,
  AMMenu,
  AMMenuItem,
  AMSidebar,
  AMSubmenu,
} from 'tailwind-sidebar';
import 'tailwind-sidebar/styles.css';

const renderSidebarItems = (
  items: any[],
  currentPath: string,
  onClose?: () => void,
  isSubItem: boolean = false
) => {
  return items.map((item, index) => {
    const isSelected = currentPath === item?.url;
    const IconComp = item.icon || null;

    const iconElement = IconComp ? (
      <Icon icon={IconComp} height={21} width={21} />
    ) : (
      <Icon icon={'ri:checkbox-blank-circle-line'} height={9} width={9} />
    );

    if (item.heading) {
      return (
        <div className='mb-1' key={item.heading}>
          <AMMenu
            subHeading={item.heading}
            ClassName='hide-menu leading-21 text-charcoal font-bold uppercase text-xs dark:text-darkcharcoal'
          />
        </div>
      );
    }

    if (item.children?.length) {
      return (
        <AMSubmenu
          key={item.id}
          icon={iconElement}
          title={item.name}
          ClassName='mt-0.5 text-link dark:text-darklink !rounded-3xl'>
          {renderSidebarItems(item.children, currentPath, onClose, true)}
        </AMSubmenu>
      );
    }

    const linkTarget = item.url?.startsWith('https') ? '_blank' : '_self';

    const itemClassNames = isSubItem
      ? `mt-0.5 text-link dark:text-darklink !hover:bg-transparent ${
          isSelected ? '!bg-transparent !text-primary' : ''
        } !px-1.5 `
      : `hover:bg-lightprimary! hover:text-primary! mt-0.5 text-link dark:text-darklink ${
          isSelected ? '!bg-lightprimary !text-primary !hover-bg-lightprimary' : ' '
        } !rounded-3xl`;

    return (
      <div onClick={onClose} key={index}>
        <AMMenuItem
          key={item.id}
          icon={iconElement}
          isSelected={isSelected}
          link={item.url || undefined}
          target={linkTarget}
          badge={!!item.isPro}
          badgeColor='bg-lightsecondary'
          badgeTextColor='text-secondary'
          disabled={item.disabled}
          badgeContent={item.isPro ? 'Pro' : undefined}
          component={Link}
          className={`${itemClassNames}`}>
          <span className='truncate flex-1'>{item.title || item.name}</span>
        </AMMenuItem>
      </div>
    );
  });
};

interface SidebarLayoutProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const SidebarLayout = ({ isCollapsed, onToggle, onClose }: SidebarLayoutProps) => {
  const pathname = usePathname();
  const { theme } = useTheme();

  const sidebarMode = theme === 'light' || theme === 'dark' ? theme : undefined;

  return (
    <AMSidebar
      collapsible='none'
      showTrigger={false}
      animation={true}
      showProfile={false}
      width={'270px'}
      mode={sidebarMode}
      className='fixed left-0 top-0 border-none shadow-boxShadow bg-background z-10 h-screen'>
      <div className='px-4 flex items-center brand-logo overflow-hidden mt-5 ml-3 mb-5'>
          <FullLogo height={100} width={160} />
        {/* <AMLogo component={Link} href='/'>
        </AMLogo>  */}
      </div>

      <SimpleBar className='h-[calc(100vh-100px)]'>
        <div className='px-6'>
          {SidebarContent.map((section, index) => (
            <div key={index}>
              {renderSidebarItems(
                [
                  ...(section.heading ? [{ heading: section.heading }] : []),
                  ...(section.children || []),
                ],
                pathname,
                onClose
              )}
            </div>
          ))}
        </div>
      </SimpleBar>
    </AMSidebar>
  );
};

export default SidebarLayout;
