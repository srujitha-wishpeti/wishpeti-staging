
export interface Creator {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  banner: string;
  shadowAddress?: string;
}

export type FulfillmentStatus = 'active' | 'partial' | 'fulfilled';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isFulfilled: boolean; // Legacy support
  fulfillmentStatus: FulfillmentStatus;
}

export interface GiftTransaction {
  id: string;
  itemId: string;
  senderName: string;
  message: string;
  amount: number;
  status: 'pending' | 'completed' | 'shipped';
  timestamp: string;
}

export enum AppRoute {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  PUBLIC_WISH_PETI = 'public-wish-peti',
  EXPLORE = 'explore',
  AUTH = 'auth'
}

export interface User {
  id: string;
  username: string;
  email: string;
  isCreator: boolean;
}
