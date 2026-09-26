export const APP_NAME = 'Music Creator Platform';
export const APP_TAGLINE = 'Collaborate. Create. Get paid.';
export const DEMO_MODE = true;

export const PLANS = {
  free: {
    key: 'free',
    label: 'Free Creator',
    price: 0,
    uploads: 5,
    commission: 20,
    analytics: 'Basic',
  },
  pro: {
    key: 'pro',
    label: 'Pro Creator',
    price: 299,
    uploads: 50,
    commission: 15,
    analytics: 'Detailed',
  },
  studio: {
    key: 'studio',
    label: 'Studio Creator',
    price: 799,
    uploads: Infinity,
    commission: 10,
    analytics: 'Full',
  },
  free_listener: {
    key: 'free_listener',
    label: 'Free Listener',
    price: 0,
    uploads: 0,
    commission: 0,
    analytics: 'None',
  },
  premium_listener: {
    key: 'premium_listener',
    label: 'Premium Listener',
    price: 99,
    uploads: 0,
    commission: 0,
    analytics: 'None',
  },
  brand: {
    key: 'brand',
    label: 'Brand / Advertiser',
    price: 0,
    uploads: 0,
    commission: 0,
    analytics: 'Detailed',
  },
  label: {
    key: 'label',
    label: 'Label / Studio',
    price: 0,
    uploads: Infinity,
    commission: 10,
    analytics: 'Full',
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    price: 0,
    uploads: Infinity,
    commission: 0,
    analytics: 'Full',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const LICENSE_TYPES = {
  open_collab: { key: 'open_collab', icon: '🤝', name: 'Open Collab' },
  credit_only: { key: 'credit_only', icon: '📝', name: 'Credit Only' },
  non_commercial: { key: 'non_commercial', icon: '🚫💰', name: 'Non-Commercial' },
  commercial: { key: 'commercial', icon: '💰', name: 'Commercial' },
  all_rights: { key: 'all_rights', icon: '🔒', name: 'All Rights Reserved' },
  custom: { key: 'custom', icon: '⚙️', name: 'Custom' },
} as const;

export type LicenseKey = keyof typeof LICENSE_TYPES;