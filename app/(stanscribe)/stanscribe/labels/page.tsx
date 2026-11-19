// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/stanscribe/labels/page.tsx
// Labels and Markings: the page App Store Connect links from each app's listing in the European Union, under
// the Digital Services Act. One page covers both apps, and Light's address is this page at #light. Its words
// are written in this repo (content/stanscribe-site/labels.html), because the apps do not show them.

import { LegalWords, legalPageMetadata } from '@/components/stanscribe/LegalPage';
import { labelsUrl } from '@/lib/stanscribe';
import { labelsParts } from '@/lib/stanscribe-legal';

export const metadata = legalPageMetadata({
  title: 'Labels and Markings · Stan Scribe',
  description: 'Labels and markings for Stan Scribe and Stan Scribe Light under European Union law.',
  url: labelsUrl('scribe'),
});

export default function Page() {
  return <LegalWords app="scribe" {...labelsParts()} />;
}
