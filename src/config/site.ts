export const SITE = {
  name: 'liecheatorsteal.com',
  title: 'liecheatorsteal.com • Democrats in Power: Lie, Cheat, or Steal',
  description:
    'All Democrats do in places of power is lie, cheat, or steal. The corrosive record of the last decade. Accurate facts. No spin. Just the three deadly sins of governance.',
  url: 'https://liecheatorsteal.com',
  email: 'sales@desertrich.com',
  locale: 'en_US',
  publishedDate: '2026-07-02',
} as const;

export const CF_IMAGES = {
  accountHash: '-sPAUAWeA405NiWJ0SNIQA',
  heroImageId: '1fdf8ada-9d4b-482d-5d1d-702314b53200',
} as const;

export function cfImageUrl(imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${CF_IMAGES.accountHash}/${imageId}/${variant}`;
}

export const OG_IMAGE = cfImageUrl(CF_IMAGES.heroImageId);

export const ACQUISITION_MAILTO = `mailto:${SITE.email}?subject=${encodeURIComponent('liecheatorsteal.com Domain Acquisition Inquiry')}&body=${encodeURIComponent('Hello,\n\nI am interested in acquiring liecheatorsteal.com.\n\nIntended use:\nBudget range:\n\nThank you.')}`;
