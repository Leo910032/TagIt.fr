// app/admin/page.jsx

import InitializeDatabase from '../admin/initDb.jsx';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <InitializeDatabase />
    </div>
  );
}

// This protects the route from being indexed by search engines
export const metadata = {
  robots: 'noindex, nofollow',
};