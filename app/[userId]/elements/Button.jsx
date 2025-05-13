"use client"
import { fireApp } from "@important/firebase";
import { fetchUserData } from "@lib/fetch data/fetchUserData";
import { hexToRgba, makeValidUrl } from "@lib/utilities";
import { collection, doc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import IconDiv from "./IconDiv";
import "./style/3d.css";
import { getCompanyFromUrl } from "@lib/BrandLinks";
import { availableFonts_Classic } from "@lib/FontsList";
import ButtonText from "./ButtonText";
import { FaCopy } from "react-icons/fa6";
import { toast } from "react-hot-toast";

export default function Button({ url, content, userId }) {
    const [modifierClass, setModifierClass] = useState("");
    const [specialElements, setSpecialElements] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState('');
    const [btnType, setBtnType] = useState(0);
    const [btnShadowColor, setBtnShadowColor] = useState('');
    const [btnFontColor, setBtnFontColor] = useState('');
    const [themeTextColour, setThemeTextColour] = useState("");
    const [btnColor, setBtnColor] = useState('');
    const [accentColor, setAccentColor] = useState([]);
    const [btnFontStyle, setBtnFontStyle] = useState(null);
    const [selectedFontClass, setSelectedFontClass] = useState("");
    const router = useRouter();

    const [isHovered, setIsHovered] = useState(false);
    const [linkId, setLinkId] = useState('');

    const urlRef = useRef(null);

    const [modifierStyles, setModifierStyles] = useState({
        backgroundColor: "",
        color: "",
        boxShadow: "",
    });

    // Function to record the click event
 // Function to record the click event with geolocation
// Function to record the click event with geolocation
// Function to record the click event with geolocation
const recordClick = async (e) => {
    try {
        // Get device type
        const deviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            ? "Mobile" 
            : "Desktop";
        
        // Get referrer
        const referrer = document.referrer ? new URL(document.referrer).hostname : "Direct";
        
        // First get the actual userId (database ID) using the fetchUserData function
        const actualUserId = await fetchUserData(userId);
        
        // Make sure we have a valid userId
        if (!actualUserId) {
            console.error("Could not determine user ID for analytics");
            return;
        }
        
        // Initialize default click data
        let clickData = {
            linkId: linkId || url, // Use linkId if available, otherwise use URL
            userId: actualUserId, // Use the actual user ID from the database
            userIdStr: String(actualUserId), // Add string version for reliable equality checks
            timestamp: serverTimestamp(),
            deviceType: deviceType,
            countryName: "Unknown", // Default value
            linkTitle: content,
            referrer: referrer,
            url: url,
            eventType: "link_click",
            hasContactInfo: false, // Track if contact info has been added later
            dateCreated: serverTimestamp() // Additional timestamp for easier querying
        };
        
        // Try to get geolocation data
        try {
            // Fetch geolocation data from a free API service
            const geoResponse = await fetch('https://ipapi.co/json/');
            
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                
                // Add geolocation data to clickData if available
                if (geoData) {
                    clickData = {
                        ...clickData,
                        countryName: geoData.country_name || "Unknown",
                        country: geoData.country || "Unknown",
                        city: geoData.city || "Unknown",
                        region: geoData.region || "Unknown",
                        ip: geoData.ip || "Unknown",
                        latitude: geoData.latitude || 0,
                        longitude: geoData.longitude || 0
                    };
                }
            }
        } catch (geoError) {
            console.error("Error fetching geolocation:", geoError);
            // Continue with the default "Unknown" location if geo lookup fails
        }
        
        // Add to Firebase analytics collection
        const clicksCollection = collection(fireApp, "analytics");
        const docRef = await addDoc(clicksCollection, clickData);
        
        // Store the analytics ID in localStorage for potential later use
        // This allows us to add contact info later if the user returns to the site
        try {
            // Keep a small history of recent clicks
            const recentClicks = JSON.parse(localStorage.getItem('recentClicks') || '[]');
            recentClicks.unshift({
                analyticsId: docRef.id,
                linkId: clickData.linkId,
                timestamp: new Date().toISOString(),
                url: clickData.url
            });
            
            // Keep only the last 5 clicks
            localStorage.setItem('recentClicks', JSON.stringify(recentClicks.slice(0, 5)));
        } catch (storageError) {
            console.error("Error storing click in localStorage:", storageError);
        }
        
        // No need to prevent default as we still want the link to open
        return docRef.id; // Return the analytics document ID
    } catch (error) {
        console.error("Error recording click:", error);
        // Still allow the link to open even if tracking fails
        return null;
    }
};
    /**
     * The `handleCopy` function copies a given URL to the clipboard and displays a success toast
     * notification.
     */
    const handleCopy = (myUrl) => {
        if (myUrl) {
            navigator.clipboard.writeText(myUrl);
            toast.success(
                "Link copied",
                {
                    style: {
                        border: '1px solid #6fc276',
                        padding: '16px',
                        color: '#6fc276',
                    },
                    iconTheme: {
                        primary: '#6fc276',
                        secondary: '#FFFAEE',
                    },
                }
            );
        }
    };

    /**
     * The function `getRootNameFromUrl` takes a URL as input and returns the root name (hostname) of
     * the URL.
     * @returns the root name of the given URL.
     */
    function getRootNameFromUrl(url) {
        try {
            const urlObj = new URL(makeValidUrl(url));
            const rootName = urlObj.hostname;
            return rootName;
        } catch (error) {
            console.log(error.message, url);
            throw new Error(error);
        }
    }


    useEffect(() => {
        async function fetchInfo() {
            // Get the actual user ID from the database
            const currentUser = await fetchUserData(userId);

            if (!currentUser) {
                router.push("/");
                return;
            }

            const collectionRef = collection(fireApp, "AccountData");
            const docRef = doc(collectionRef, `${currentUser}`);

            onSnapshot(docRef, (docSnapshot) => {
                if (!docSnapshot.exists()) {
                    return;
                }
                const { btnType, btnShadowColor, btnFontColor, themeFontColor, btnColor, selectedTheme, fontType, links } = docSnapshot.data();
                const fontName = availableFonts_Classic[fontType ? fontType - 1 : 0];
                setSelectedFontClass(fontName.class);
                setThemeTextColour(themeFontColor ? themeFontColor : "");
                setBtnColor(btnColor ? btnColor : "#fff");
                setSelectedTheme(selectedTheme);
                setBtnFontColor(btnFontColor ? btnFontColor : "#000");
                setBtnShadowColor(btnShadowColor ? btnShadowColor : "#000");
                setBtnType(btnType);

                // Find the corresponding link ID for this url and content
                if (links && Array.isArray(links)) {
                    const link = links.find(l => l.url === url && l.title === content);
                    if (link) {
                        setLinkId(link.id);
                    }
                }
            });
        }

        fetchInfo();
    }, [router, userId, url, content]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            const rootName = getRootNameFromUrl(url);
            setModifierClass(`
                relative after:absolute after:h-2 after:w-[100.5%] after:bg-black bg-white
                after:-bottom-2 after:left-[1px] after:skew-x-[57deg] after:ml-[2px]
                before:absolute before:h-[107%] before:w-3 before:bg-[currentColor]
                before:top-[1px] before:border-2 before:border-black before:-right-3 before:skew-y-[30deg]
                before:grid before:grid-rows-2
                border-2 border-black inset-2
                ml-[-20px]
                btn
            `);
            setSpecialElements(null);
            setBtnFontStyle({
                color: "#fff"
            });

            switch (String(getCompanyFromUrl(rootName)).toLocaleLowerCase()) {
                case 'tiktok':
                    setAccentColor(["#ff0050", "#00f2ea"]);
                    break;
                case 'audiomack':
                    setAccentColor(["#ffa200", "#2a2a2a"]);
                    break;
                case 'twitter':
                    setAccentColor(["#1DA1F2", "#657786"]);
                    break;
                case 'linkedin':
                    setAccentColor(["#0077b5", "#0077b5"]);
                    break;
                case 'spotify':
                    setAccentColor(["#1DB954", "#1DB954"]);
                    break;
                case 'youtube':
                    setAccentColor(["#FF0000", "#FF0000"]);
                    break;
                case 'reddit':
                    setAccentColor(["#ff4500", "#5f99cf"]);
                    break;
                case 'paypal':
                    setAccentColor(["#003087", "#009cde"]);
                    break;
                case 'instagram':
                    setAccentColor(["#E1306C", "#833AB4"]);
                    break;
                case 'facebook':
                    setAccentColor(["#4267B2", "#898F9C"]);
                    break;
                case 'linktree':
                    setAccentColor(["#43E660", "#657786"]);
                    break;
                case 'pornhub':
                    setAccentColor(["#ffa31a", "#1b1b1b"]);
                    break;
                case 'xvideos':
                    setAccentColor(["#C9221E", "#ffffff"]);
                    break;
                case 'xnxx':
                    setAccentColor(["#5D9FFF", "#000092"]);
                    break;
                case 'whatsapp':
                    setAccentColor(["#25d366", "#075e54"]);
                    break;
                case 'pinterest':
                    setAccentColor(["#BB0F23", "#F8F9FC"]);
                    break;
                case 'fabiconcept':
                    setAccentColor(["#fea02f", "#de6600"]);
                    break;

                default:
                    setAccentColor(["#191414", "#14171A"]);
                    break;
            }
            return;
        }

        switch (btnType) {
            case 0:
                setModifierClass("");
                setSpecialElements(null);
                break;
            case 1:
                setModifierClass("rounded-lg");
                setSpecialElements(null);
                break;
            case 2:
                setModifierClass("rounded-3xl");
                setSpecialElements(null);
                break;
            case 3:
                setModifierClass("border border-black bg-opacity-0");
                setSpecialElements(null);
                break;
            case 4:
                setModifierClass("border border-black rounded-lg bg-opacity-0");
                setSpecialElements(null);
                break;
            case 5:
                setModifierClass("border border-black rounded-3xl bg-opacity-0");
                setSpecialElements(null);
                break;
            case 6:
                setModifierClass(`bg-white border border-black`);
                setSpecialElements(null);
                break;
            case 7:
                setModifierClass(`bg-white border border-black rounded-lg`);
                setSpecialElements(null);
                break;
            case 8:
                setModifierClass(`bg-white border border-black rounded-3xl`);
                setSpecialElements(null);
                break;
            case 9:
                setModifierClass(`bg-white`);
                setSpecialElements(null);
                break;
            case 10:
                setModifierClass(`bg-white rounded-lg`);
                setSpecialElements(null);
                break;
            case 11:
                setModifierClass(`bg-white rounded-3xl`);
                setSpecialElements(null);
                break;
            case 12:
                setModifierClass("relative border border-black bg-black");
                setSpecialElements(
                    <>
                        <span className="w-full absolute left-0 bottom-0 translate-y-[6px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/torn.svg"} alt="ele" width={1000} height={100} priority className="w-full scale-[-1]" />
                        </span>
                        <span className="w-full absolute left-0 top-0 -translate-y-[6px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/torn.svg"} alt="ele" width={1000} height={1000} priority className="w-full" />
                        </span>
                    </>
                );
                break;
            case 13:
                setModifierClass("relative border border-black bg-black");
                setSpecialElements(
                    <>
                        <span className="w-full absolute left-0 bottom-0 translate-y-[4px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/jiggy.svg"} style={{ fill: modifierStyles.backgroundColor }} alt="ele" width={1000} height={8} priority className="w-full" />
                        </span>
                        <span className="w-full absolute left-0 top-0 -translate-y-[3px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/jiggy.svg"} style={{ fill: modifierStyles.backgroundColor }} alt="ele" width={1000} height={8} priority className="w-full scale-[-1]" />
                        </span>
                    </>
                );
                break;
            case 14:
                setModifierClass("border border-black relative after:-translate-y-1/2 after:-translate-x-1/2 after:top-1/2 after:left-1/2 after:h-[88%] after:w-[104%] after:absolute after:border after:border-black after:mix-blend-difference");
                setSpecialElements(null);
                break;
            case 15:
                setModifierClass("border border-black bg-black rounded-3xl");
                setSpecialElements(null);
                break;
            case 16:
                setModifierClass("relative border border-black bg-black");
                setSpecialElements(
                    <>
                        <div className={"h-2 w-2 border border-black bg-white absolute -top-1 -left-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -top-1 -right-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -bottom-1 -left-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -bottom-1 -right-1"}></div>
                    </>
                );
                break;
            default:
                setModifierClass("");
                setSpecialElements(null);
                break;
        }
    }, [btnType, selectedTheme, modifierStyles.backgroundColor, url]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            return;
        }

        function getShadow() {
            switch (btnType) {
                case 6:
                    return `4px 4px 0 0 ${hexToRgba(btnShadowColor)}`;
                case 7:
                    return `4px 4px 0 0 ${hexToRgba(btnShadowColor)}`;
                case 8:
                    return `4px 4px 0 0 ${hexToRgba(btnShadowColor)}`;
                case 9:
                    return `0 4px 4px 0 ${hexToRgba(btnShadowColor, 0.16)}`;
                case 10:
                    return `0 4px 4px 0 ${hexToRgba(btnShadowColor, 0.16)}`;
                case 11:
                    return `0 4px 4px 0 ${hexToRgba(btnShadowColor, 0.16)}`;

                default:
                    return '';
            }
        }

        const shadowStyle = getShadow();

        setModifierStyles((previewsStyles) => ({
            ...previewsStyles,
            boxShadow: shadowStyle,
        }));
    }, [btnShadowColor, btnType, selectedTheme]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            return;
        }

        function getBtnColor() {
            switch (btnType) {
                case 12:
                    return ``;
                case 13:
                    return ``;

                default:
                    return `${btnColor}`;
            }
        }

        const backgroundStyle = getBtnColor();

        setModifierStyles((previewsStyles) => ({
            ...previewsStyles,
            backgroundColor: `${backgroundStyle}`,
        }));
    }, [btnColor, btnType, selectedTheme]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            return;
        }

        function getBtnFontColor() {
            switch (btnType) {
                case 12:
                    return `#fff`;
                case 13:
                    return `#fff`;

                default:
                    return `${btnFontColor}`;
            }
        }

        const fontColorStyle = getBtnFontColor();

        setBtnFontStyle((previewsStyles) => ({
            ...previewsStyles,
            color: `${fontColorStyle}`,
        }));
    }, [btnFontColor, btnType, selectedTheme]);

    useEffect(() => {
        if (accentColor.length > 0) {
            setModifierStyles({
                backgroundColor: `${accentColor[0]}`,
                color: `${accentColor[1]}`
            });
        }
    }, [accentColor]);

    return (
        selectedTheme !== "New Mario" ? (
        <div
            className={`${modifierClass} userBtn relative justify-between items-center flex hover:scale-[1.025] md:w-[35rem] sm:w-[30rem] w-clamp`}
            style={{...modifierStyles, borderColor: selectedTheme === "Matrix" ? `${themeTextColour}` : ""}}
        >
            <Link
                className={`cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1`}
                href={makeValidUrl(url)}
                target="_blank"
                onClick={recordClick}
            >
                {specialElements}
                <IconDiv url={url} />
                <ButtonText btnFontStyle={btnFontStyle} content={content} fontClass={selectedFontClass} />
            </Link>
            <div onClick={()=>handleCopy(url)} className="absolute p-2 h-9 right-3 grid place-items-center aspect-square rounded-full border border-white group cursor-pointer bg-black text-white hover:scale-105 active:scale-90">
                <FaCopy className="rotate-10 group-hover:rotate-0" />
            </div>
        </div>)
        :
        (
        <div className="userBtn relative overflow-x-hidden overflow-y-hidden flex justify-between items-center h-16 md:w-[35rem] sm:w-[30rem] w-clamp">
            {Array(9).fill("").map((_, brick_index) => (
                <Image
                    src={"https://linktree.sirv.com/Images/Scene/Mario/mario-brick.png"}
                    alt="Mario Brick"
                    width={650}
                    key={brick_index}
                    onClick={()=>urlRef.current?.click()}
                    onMouseEnter={()=>setIsHovered(true)}
                    onMouseLeave={()=>setIsHovered(false)}
                    height={660}
                    className="h-16 w-auto object-contain hover:-translate-y-2 cursor-pointer"
                />
            ))}
            <Link
                className={` absolute top-0 left-0 z-30 pointer-events-none cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1`}
                href={makeValidUrl(url)}
                target="_blank"
                ref={urlRef}
                onClick={recordClick}
            >
                <div className="grid place-items-center">
                    <Image
                        src={"https://linktree.sirv.com/Images/Scene/Mario/mario-box.png"}
                        alt="Mario Box"
                        width={650}
                        height={660}
                                className={`h-12 w-auto object-contain hover:-translate-y-2 ${isHovered ? "rotate-2" : ""}`}
                    />

                    <div className={`${isHovered ? "rotate-2" : ""} absolute`}>
                        <IconDiv url={url} unique="Mario" />
                    </div>
                </div>
                <ButtonText btnFontStyle={btnFontStyle} content={(<SuperFont text={content} isHovered={isHovered} />)} fontClass={"MariaFont"} />
            </Link>
            <div onClick={() => handleCopy(url)} className="absolute p-2 h-9 right-3 grid place-items-center aspect-square rounded-full border border-white group cursor-pointer bg-black text-white hover:scale-105 active:scale-90">
                <FaCopy className="rotate-10 group-hover:rotate-0" />
            </div>
        </div>
        )
    );
}

const SuperFont = ({ text, isHovered }) => {
    const colors = ['#fff', '#fff', '#fff', '#fff', '#fff'];

    const coloredText = text.split('').map((char, index) => (
        <span className="md:text-2xl sm:text-xl text-lg drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-transparent" key={index} style={{ color: isHovered ? "#3b82f6" : colors[index % colors.length] }}>
            {char}
        </span>
    ));

    return <div>{coloredText}</div>;
};