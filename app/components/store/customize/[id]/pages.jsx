// app/store/customize/[id]/page.jsx

import StorePage from '../../../components/store/StorePage';

export default function CustomizeProductPage({ params }) {
  return <StorePage />;
}

// Optional: Add metadata for SEO
export const metadata = {
  title: 'Customize Your Card - TagIt Store',
  description: 'Design your NFC business card with our customization tools',
};
