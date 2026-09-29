export type PlanKey =
  | 'free'
  | 'pro'
  | 'studio'
  | 'free_listener'
  | 'premium_listener'
  | 'brand'
  | 'label'
  | 'admin';

export type LicenseKey =
  | 'open_collab'
  | 'credit_only'
  | 'non_commercial'
  | 'commercial'
  | 'all_rights'
  | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  plan: PlanKey;
  bio: string;
  headline: string;
  location: string;
  skills: string[];
  genres: string[];
  rating: number;
  agreedToTerms: boolean;
  agreedAt?: number;
  createdAt: number;
  suspended?: boolean;
}

export interface Track {
  id: string;
  userId: string;
  title: string;
  url: string;
  coverUrl: string;
  plays: number;
  genre: string;
  bpm: number;
  license: LicenseKey;
  price: number;
  description: string;
  createdAt: number;
  promoted?: boolean;
  promoType?: 'featured' | 'sponsored' | 'promoted';
}

export interface Collaboration {
  id: string;
  trackId: string;
  initiatorId: string;
  contributorId: string;
  role: string;
  status: 'pending' | 'active' | 'completed' | 'declined';
  createdAt: number;
}

export interface License {
  id: string;
  trackId: string;
  creatorId: string;
  licenseeId: string;
  type: LicenseKey;
  signedAt: number;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  trackId: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'refunded';
  createdAt: number;
}

export interface Subscription {
  plan: PlanKey;
  startDate: number;
  endDate: number;
}

export interface Conversation {
  id: string;
  participants: Record<string, true>;
  lastMessage: string;
  updatedAt: number;
}

export interface Message {
  id: string;
  from: string;
  text: string;
  createdAt: number;
  read: boolean;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Promotion {
  id: string;
  userId: string;
  trackId: string;
  type: 'featured' | 'sponsored' | 'promoted';
  impressions: number;
  clicks: number;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  type:
    | 'message'
    | 'payment'
    | 'collab'
    | 'review'
    | 'system'
    | 'promo'
    | 'connection_request'
    | 'connection_accepted';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: number;
  meta?: Record<string, unknown>;
}

export interface Dispute {
  id: string;
  filedBy: string;
  against: string;
  status: 'filed' | 'mediating' | 'resolved' | 'appealed';
  evidence: string;
  deadline: number;
  createdAt: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConnectionRequest {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export interface Connection {
  userId: string;
  connectedAt: number;
}