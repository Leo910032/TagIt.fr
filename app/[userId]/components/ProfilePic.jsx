"use client"
import { fireApp } from "@important/firebase";
import { fetchUserData } from "@lib/fetch data/fetchUserData";
import { collection, doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { useRef, useState } from "react";
import { useEffect } from "react";
import Head from "next/head";

export default function ProfilePic({userId}) {
    const [profilePicture, setProfilePicture] = useState(null);
    const [hasProfilePic, setHasProfilePic] = useState(false);
    const [isElementVisible, setIsElementVisible] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const profilePicRef = useRef();

    useEffect(() => {
        async function fetchProfilePicture() {
            const currentUser = await fetchUserData(userId);;
            const collectionRef = collection(fireApp, "AccountData");
            const docRef = doc(collectionRef, `${currentUser}`);

            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const { profilePhoto, displayName } = docSnap.data();

                    setProfileImageUrl(profilePhoto)

                    if (profilePhoto !== '') {
                        setProfilePicture(
                            <Image
                                src={`${profilePhoto}`}
                                alt="profile"
                                height={10}
                                width={10}
                                className="min-w-full h-full object-contain pointer-events-none"
                                priority
                            />
                        );

                        setHasProfilePic(true);
                    } else {
                        setHasProfilePic(false);
                        setProfilePicture(
                            <div className="h-[15%] aspect-square w-[15%] rounded-full bg-gray-300 border grid place-items-center">
                                <span className="text-3xl font-semibold uppercase">
                                    {displayName === '' ? "" :displayName.split('')[0]}
                                </span>
                            </div>
                        );
                    }
                }
            });
        }
        fetchProfilePicture();
    }, [userId]);

    const intersectionCallback = (entries) => {
        const entry = entries[0];
        setIsElementVisible(entry.isIntersecting);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(intersectionCallback, {
            threshold: 0.5,
        });

        if (profilePicRef.current) {
            observer.observe(profilePicRef.current);
        }

        return () => {
            if (profilePicRef.current) {
                observer.unobserve(profilePicRef.current);
            }
        };
    }, [profilePicRef]);
    
    return (
        <>
            {profileImageUrl && <Head>
                <meta property="og:image" content={`${profileImageUrl}`} />
                <meta property="og:image:width" content="300" />
                <meta property="og:image:height" content="300" />
                <meta name="twitter:image" content={`${profileImageUrl}`} />
                <meta name="twitter:image:width" content="300" />
                <meta name="twitter:image:height" content="300" />
            </Head>}
           
        </>
    )
}
