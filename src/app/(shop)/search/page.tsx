import { Suspense } from 'react';
import { SearchPage } from '@/components/pages/search-page';

export const metadata = {
  title: 'Search — RupNogor',
  description: 'Search for sarees, jewelry, fusion wear and more from RupNogor.',
};

export default function Page() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
