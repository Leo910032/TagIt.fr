// This file should go in app/store/layout.jsx to apply specific
// layout settings to the store section without redirecting

'use client';

import { Suspense } from 'react';
import NavBar from '../../components/general/NavBar.jsx';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'TagIt Store - Smart NFC Business Cards',
  description: 'Shop for smart NFC business cards that connect to your digital profile. Customizable design, eco-friendly materials, and instant digital connection.',
}

export default function StoreLayout({ children }) {
  return (
    <>
      <Toaster position="bottom-right" />
      <div className='w-screen min-h-screen overflow-y-auto bg-gray-50'>
        {children}
      </div>
    </>
  );
}