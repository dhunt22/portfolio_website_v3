import React from 'react';
import Icon, { IconProps, IconName } from './Icon';

// Export the base Icon component
export { default as Icon } from './Icon';
export type { IconProps, IconName } from './Icon';

// Create and export individual icon components for easier imports
export const BookIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="book" {...props} />
);

export const DocumentIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="document" {...props} />
);

export const LightbulbIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="lightbulb" {...props} />
);

export const DatabaseIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="database" {...props} />
);

export const GeometryIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="geometry" {...props} />
);

export const GitHubIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="github" {...props} />
);

// Export all icons as a collection for dynamic usage
export const icons: Record<IconName, React.FC<Omit<IconProps, 'name'>>> = {
  book: BookIcon,
  document: DocumentIcon,
  lightbulb: LightbulbIcon,
  database: DatabaseIcon,
  geometry: GeometryIcon,
  github: GitHubIcon
};

export default icons;
