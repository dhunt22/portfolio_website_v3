// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/stanscribe-light/[page]/page.tsx
// Stan Scribe Light's Privacy Policy, Terms of Use and Acknowledgements, at the slash URLs the app and App Store
// Connect use (scripts/stanscribe-index.mjs moves each to <page>/index.html).

import { LegalPage, legalMetadata, legalParams, type LegalRouteProps } from '@/components/stanscribe/LegalPage';

export const dynamicParams = false;
export const generateStaticParams = legalParams;
export const generateMetadata = (props: LegalRouteProps) => legalMetadata('light', props);

export default function Page(props: LegalRouteProps) {
  return LegalPage({ app: 'light', ...props });
}
