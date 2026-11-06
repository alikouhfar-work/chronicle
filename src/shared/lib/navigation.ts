import {
  IconBookmark,
  IconDeviceTv,
  IconLayoutDashboard,
  IconNotes,
} from '@tabler/icons-react';

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
  {
    href: '/notes',
    id: 'notes',
    title: 'Notes',
    icon: IconNotes,
  },
];