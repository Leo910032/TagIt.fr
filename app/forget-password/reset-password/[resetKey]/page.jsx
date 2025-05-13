"use client"

import Link from "next/link";
import { verifyResetKey } from "@lib/authentication/verifyResetKey";
import ResetPasswordForm from "./components/ResetPassword";
import { Toaster } from "react-hot-toast";
import { Suspense, useState, useEffect } from "react";

// Loading skeleton component
function ResetFormSkeleton() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="h-8 bg-gray-200 animate-pulse rounded-md w-2/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded-md mt-6"></div>
      </div>
    </div>
  );
}

// Client component to handle the async verification
function ResetPasswordClient({ resetKey }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    userId: null
  });

  useEffect(() => {
    async function verifyKey() {
      try {
        const [userId, timePassed] = await verifyResetKey(resetKey);
        setState({
          loading: false,
          error: null,
          userId
        });
      } catch (error) {
        setState({
          loading: false,
          error,
          userId: null
        });
      }
    }

    verifyKey();
  }, [resetKey]);

  if (state.loading) {
    return <ResetFormSkeleton />;
  }

  if (state.error) {
    if (state.error.known) {
      return (
        <div className="p-8">
          {state.error.known} <Link href={"/login"} className="font-semibold text-themeGreen">Go back to login</Link>
        </div>
      );
    }
    return (
      <div className="p-8">
        An error Occurred <Link href={"/"} className="font-semibold text-themeGreen">Go to homepage</Link>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <ResetPasswordForm user={state.userId} resetKey={resetKey} />
    </>
  );
}

export default function ResetPasswordPage({ params }) {
  return (
    <Suspense fallback={<ResetFormSkeleton />}>
      <ResetPasswordClient resetKey={params.resetKey} />
    </Suspense>
  );
}