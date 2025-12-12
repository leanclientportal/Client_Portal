'use client';

import { FC, MouseEvent } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

interface ActionButtonProps {
  onClick: (e: MouseEvent) => void;
  children: React.ReactNode;
  label: string;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({ onClick, children, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/action relative flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition-all duration-300 ease-in-out",
        "hover:w-24",
        className
      )}
    >
      <div className="absolute opacity-0 group-hover/action:opacity-100 transition-opacity duration-300">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          {label}
        </span>
      </div>
      <div className="absolute opacity-100 group-hover/action:opacity-0 transition-opacity duration-300">
        {children}
      </div>
    </button>
  );
};

export { ActionButton };