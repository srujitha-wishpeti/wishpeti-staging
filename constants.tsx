
import { Creator, WishlistItem } from './types';

export const MOCK_CREATOR: Creator = {
  id: 'c1',
  name: 'Ananya Sharma',
  username: 'ananya_vlogs',
  bio: 'Lifestyle & Tech Creator | Sharing my journey across India. 🇮🇳',
  avatar: 'https://picsum.photos/id/64/200/200',
  banner: 'https://picsum.photos/id/10/1200/400',
};

export const MOCK_ITEMS: WishlistItem[] = [
  {
    id: 'w1',
    name: 'Sony ZV-E10 Camera',
    price: 65000,
    description: 'Perfect for my upcoming travel vlogs!',
    imageUrl: 'https://picsum.photos/id/250/400/400',
    category: 'Tech',
    priority: 'high',
    isFulfilled: false,
    fulfillmentStatus: 'active',
  },
  {
    id: 'w2',
    name: 'Nanlite PavoTube II 6C',
    price: 8500,
    description: 'Portable lighting for late-night streams.',
    imageUrl: 'https://picsum.photos/id/201/400/400',
    category: 'Production',
    priority: 'medium',
    isFulfilled: true,
    fulfillmentStatus: 'fulfilled',
  },
  {
    id: 'w3',
    name: 'Herman Miller Embody Chair',
    price: 145000,
    description: 'Saving up for some ergonomic comfort.',
    imageUrl: 'https://picsum.photos/id/445/400/400',
    category: 'Home Office',
    priority: 'low',
    isFulfilled: false,
    fulfillmentStatus: 'partial',
  }
];
