import { collection, getDocs } from "firebase/firestore";
import { fireApp } from "@important/firebase";

// Static routes that don't depend on user data
const staticRoutes= [
    {
        url: 'https://mylinks.fabiconcept.online',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://mylinks.fabiconcept.online/signup',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://mylinks.fabiconcept.online/login',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://mylinks.fabiconcept.online/freepalestine',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://mylinks.fabiconcept.online/fabiconcept',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
];

// Fetch usernames from Firebase
async function fetchUsernames() {
    const users= [];

    try {
        const collectionRef = collection(fireApp, "accounts");
        const querySnapshot = await getDocs(collectionRef);
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                username: String(data.username).toLowerCase(),
                lastModified: doc.updateTime?.toDate().toISOString() || new Date().toISOString(),
            });
        });
    } catch (error) {
        console.error('Error fetching usernames:', error);
    }
    return users;
}

// Generate sitemap
export default async function sitemap() {
    try {
        // Fetch user data
        const users = await fetchUsernames();

        // Generate dynamic routes for users
        const userRoutes = users.map((user) => ({
            url: `http://http://tagit-fr-profile-jonfdoe.duckdns.org//${user.username}`,
            lastModified: new Date(user.lastModified || new Date()),
            changeFrequency: 'daily',
            priority: 0.8,
        }));

        // Combine static and dynamic routes
        return [...staticRoutes, ...userRoutes, {
            url: `http://http://tagit-fr-profile-jonfdoe.duckdns.org//${users.length}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        }];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticRoutes;
    }
}