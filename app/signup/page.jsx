'use client';

import { Suspense } from 'react';
import SignupForm from './componets/SignupForm.jsx';

// Simple skeleton loader component that matches your form layout
function SignupFormSkeleton() {
  return (
    <div className="flex-1 sm:p-12 py-8 p-2 flex flex-col overflow-y-auto">
      <div className="w-[7.05rem] h-[2.8rem] bg-gray-200 animate-pulse rounded-md"></div>
      <section className="mx-auto py-10 w-full sm:w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 flex-1 flex flex-col justify-center">
        <div className="h-10 sm:h-14 bg-gray-200 animate-pulse rounded-md w-3/4 mx-auto"></div>
        <div className="py-8 sm:py-12 flex flex-col gap-4 sm:gap-6 w-full">
          <div className="h-14 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-14 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-14 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-14 bg-gray-200 animate-pulse rounded-md"></div>
        </div>
        <div className="h-6 w-60 bg-gray-200 animate-pulse rounded-md mx-auto"></div>
      </section>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}