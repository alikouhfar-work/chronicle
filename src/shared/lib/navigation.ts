import { IconBookmark, IconDeviceTv, IconLayoutDashboard } from '@tabler/icons-react';

export const navigation = [
  {
    href: '/',
    id: 'dashboard',
    title: 'Dashboard',
    icon: IconLayoutDashboard,
  },
  {
    href: '/library',
    id: 'library',
    title: 'Library',
    icon: IconBookmark,
  },
  {
    href: '/search',
    id: 'discover',
    title: 'Discover',
    icon: IconDeviceTv,
  },
];