"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResetPasswordPage() {
    const router = useRouter();
    
    useEffect(() => {
        // Only redirect on the client side
        router.push("/login");
    }, [router]);
    
    // Show loading state while redirecting
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-themeGreen mx-auto mb-4"></div>
                <p>Redirecting to login...</p>
            </div>
        </div>
    )
}