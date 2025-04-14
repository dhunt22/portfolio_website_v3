import React from 'react';
import { cn } from '@/lib/utils';

// These are the icon names available in our icon system
export type IconName = 'book' | 'document' | 'lightbulb' | 'database' | 'geometry' | 'github';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/**
 * Icon component that renders SVG icons from the sprite sheet
 * 
 * @example
 * <Icon name="book" size={24} className="text-blue-500" />
 */
const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 18, 
  className = ''
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      className={cn('inline-block', className)}
      aria-hidden="true"
    >
      <use href={`/icons/sprite.svg#icon-${name}`} />
    </svg>
  );
};

export default Icon;
