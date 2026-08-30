import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useQueryString = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string | Record<string, string | number>, value?: string | number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (typeof name === 'string') {
        if (value === '' || value === undefined) {
          params.delete(name);
        } else {
          params.set(name, String(value));
        }
      } else {
        Object.entries(name).forEach(([key, val]) => {
          if (val === '') {
            params.delete(key);
          } else {
            params.set(key, String(val));
          }
        });
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return {searchParams, createQueryString};
}