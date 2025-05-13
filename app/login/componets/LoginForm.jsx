'use client';

// app/login/LoginForm.js
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FaCheck, FaEye, FaEyeSlash, FaX } from 'react-icons/fa6';
import { useDebounce } from '@LocalHooks/useDebounce.js';
import { fireApp } from '@important/firebase';
import { loginAccount } from '@lib/authentication/login';
import { setSessionCookie } from '@lib/authentication/session';
import { collection, onSnapshot } from 'firebase/firestore';
import AuthRedirector from '../../components/AuthRedirector';
import { isFromRedirect } from '@utils/auth-utils';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const step = searchParams.get('step');

    const [seePassword, setSeePassword] = useState(true);
    const [username, setUsername] = useState("");
    const [existingUsernames, setExistingUsernames] = useState([]);
    const [password, setPassword] = useState("");
    const [canProceed, setCanProceed] = useState(false);

    const debounceUsername = useDebounce(username, 500);
    const debouncePassword = useDebounce(password, 500);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loopDetected, setLoopDetected] = useState(false);
    
    const [hasError, setHasError] = useState({
        username: 0,
        password: 0,
    });

    // Check if we're in a redirect loop
    useEffect(() => {
        if (isFromRedirect()) {
            console.warn("Redirect loop detected in login form");
            setLoopDetected(true);
            // Force break the loop by clearing any redirect params
            if (redirect) {
                const cleanPath = window.location.pathname;
                router.replace(cleanPath);
            }
        }
    }, [redirect, router]);

    // Check if user is already logged in, but don't auto-redirect
    useEffect(() => {
        try {
            // Check cookie directly
            const cookies = document.cookie.split(';');
            const adminLinkerCookie = cookies.find(c => c.trim().startsWith('adminLinker='));
            const userId = adminLinkerCookie ? adminLinkerCookie.split('=')[1] : null;
            
            if (userId) {
                // User is already logged in, but let them choose whether to redirect
                setIsLoading(false);
                if (!loopDetected) {
                    toast.success("You're already logged in!");
                }
            }
        } catch (error) {
            console.error("Session check error:", error);
        }
    }, [loopDetected]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canProceed && isLoading) return;
        setIsLoading(true);
        
        const data = {
            log_username: (debounceUsername).trimEnd(),
            log_password: debouncePassword,
        }
        
        const promise = loginAccount(data);

        toast.promise(promise, {
            error: "Invalid Login credentials!",
            success: "Login Successful",
            loading: "Validating credentials..."
        }).then((response) => {
            const userId = response;
            
            setSessionCookie("adminLinker", `${userId}`, (60 * 24));

            setTimeout(() => {
                setCanProceed(false);
                // Redirect based on context
                if (redirect) {
                    // Use the redirect parameter to go back to where the user came from
                    if (step) {
                        router.push(`${redirect}?step=${step}`);
                    } else {
                        router.push(redirect);
                    }
                } else {
                    // Default fallback if no redirect specified
                    router.push('/dashboard');
                }
            }, 1000);
        }).catch((error) => {
            console.error("Login error:", error);
            setHasError({ ...hasError, password: 1 });
            setIsLoading(false);
            setPassword("");
            setErrorMessage("You entered an incorrect password!");
        })
    }

    useEffect(() => {
        function fetchExistingUsername() {
            const existingUsernames = [];
        
            const collectionRef = collection(fireApp, "accounts");
            
            onSnapshot(collectionRef, (querySnapshot) => {
                querySnapshot.forEach((credential) => {
                    const data = credential.data();
                    const { username } = data;
                    existingUsernames.push(username);
                });
                
                setExistingUsernames(existingUsernames);
            });
        }

        fetchExistingUsername();
    }, []);

    useEffect(() => {
        if(debounceUsername !== "") {
            if(!existingUsernames.includes(String(debounceUsername).toLowerCase())){
                setHasError((prevData) => ({...prevData, username: 1}));
                setErrorMessage("This username is not registered to any user.");
                return;
            }
            
            setHasError((prevData) => ({...prevData, username: 2}));
            return;

        } else {
            setHasError((prevData) => ({...prevData, username: 0}));
        }
    }, [debounceUsername, existingUsernames]);

    useEffect(() => {
        if(debouncePassword !== "") {
            setHasError((prevData) => ({...prevData, password: 2}));
            return;
        } else {
            setHasError((prevData) => ({...prevData, password: 0}));
        }

    }, [debouncePassword]);

    useEffect(() => {
        if (hasError.username <= 1) {
            setCanProceed(false);
            return;
        }
        
        if (hasError.password <= 1) {
            setCanProceed(false);
            return;
        }

        setCanProceed(true);
        setErrorMessage("");
    }, [hasError]);
    
    return (
        <div className="flex-1 sm:p-12 px-4 py-8 flex flex-col overflow-y-auto">
            <Link href={'/'} className="sm:p-0 p-3 w-fit">
                <Image src="/my-logo.png" alt="logo" height={150} width={150} className="w-[7.05rem]" />
            </Link>
            <section className="mx-auto py-10 w-full sm:w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 flex-1 flex flex-col justify-center">
                <p className="text-2xl sm:text-5xl font-extrabold text-center">Log in to your Linktree</p>
                {redirect && !loopDetected && (
                    <p className="text-center mt-4 text-gray-600 bg-gray-100 p-3 rounded-lg">
                        {step === 'checkout' 
                            ? 'Please sign in to complete your order'
                            : 'Sign in to continue'
                        }
                    </p>
                )}
                <form className="py-8 sm:py-12 flex flex-col gap-4 sm:gap-6 w-full" onSubmit={handleSubmit}>
                    <div className={`flex items-center py-2 sm:py-3 px-2 sm:px-6 rounded-md myInput ${hasError.username === 1 ? "hasError" : hasError.username === 2 ? "good" : ""} bg-black bg-opacity-5 text-base sm:text-lg w-full`}>
                        <label className="opacity-40">mylinktree/</label>
                        <input
                            type="text"
                            placeholder="username"
                            className="outline-none border-none bg-transparent ml-1 py-3 flex-1 text-sm sm:text-base"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        {hasError.username === 1 ?
                            <FaX className="text-red-500 text-sm cursor-pointer" onClick={() => setUsername("")} />
                            :
                            hasError.username === 2 ?
                                <FaCheck className="text-themeGreen cursor-pointer" />
                                :
                                ""
                        }
                    </div>
                    <div className={`flex items-center relative py-2 sm:py-3 px-2 sm:px-6 rounded-md ${hasError.password === 1 ? "hasError": hasError.password === 2 ? "good" : ""} bg-black bg-opacity-5 text-base sm:text-lg myInput`}>
                        <input
                            type={`${seePassword ? "password": "text"}`}
                            placeholder="Password"
                            className="peer outline-none border-none bg-transparent py-3 ml-1 flex-1 text-sm sm:text-base"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {seePassword && <FaEyeSlash className="opacity-60 cursor-pointer" onClick={() => setSeePassword(!seePassword)} />}
                        {!seePassword && <FaEye className="opacity-60 cursor-pointer text-themeGreen" onClick={() => setSeePassword(!seePassword)} />}
                    </div>

                    <Link href={"/forgot-password"} className="w-fit hover:rotate-2 hover:text-themeGreen origin-left">Forgot your password?</Link>

                    <button type="submit" className={
                        `rounded-md py-4 sm:py-5 grid place-items-center font-semibold ${canProceed ? "cursor-pointer active:scale-95 active:opacity-40 hover:scale-[1.025] bg-themeGreen mix-blend-screen" : "cursor-default opacity-50 "}`
                    }>
                        {!isLoading && <span className="nopointer">Sign In</span>}
                        {isLoading && <Image src={"https://linktree.sirv.com/Images/gif/loading.gif"} width={25} height={25} alt="loading" className="mix-blend-screen" />}
                    </button>

                    {!isLoading && <span className="text-sm text-red-500 text-center">{errorMessage}</span>}
                </form>
                <p className="text-center sm:text-base text-sm">
                <span className="opacity-60">Don&apos;t have an account?</span> 
                <Link 
                        href={redirect && !loopDetected ? `/signup?redirect=${encodeURIComponent(redirect)}${step ? `&step=${step}` : ''}` : "/signup"} 
                        className="text-themeGreen ml-2"
                    >
                        Sign up
                    </Link>
                </p>
                
                {/* Back to store link */}
                <p className="text-center mt-4">
                    <Link href="/store" className="text-gray-600 hover:text-themeGreen">
                        ← Back to store
                    </Link>
                </p>
            </section>
        </div>
    );
}