// content/_types.ts
// Hand-written shape that content/generated/*.ts conform to via `satisfies PageContent`.

export interface Link { label: string; href: string }
export interface Img { alt: string; src: string; caption?: string }
export interface Quote { text: string; author?: string }

export interface Block {
  id: string;
  title: string;
  fields: Record<string, string>;
  body: string[];
  items: string[];
  links: Link[];
  image?: Img;
  quote?: Quote;
  children: Block[];
}

// A page = its level-2 sections keyed by camelCased id.
export type PageContent = Record<string, Block>;
