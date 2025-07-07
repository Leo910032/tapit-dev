import { collection, getDocs } from "firebase/firestore";
import { fireApp } from "@/important/firebase";

const staticRoutes= [
    {
        url: 'https://www.tapit.fr',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://www.tapit.fr/signup',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://www.tapit.fr/login',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://www.tapit.fr/freepalestine',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
    {
        url: 'https://www.tapit.fr/fabiconcept',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
    },
];

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

export default async function sitemap() {
    try {
        const users = await fetchUsernames();

        const userRoutes = users.map((user) => ({
            url: `https://www.tapit.fr/${user.username}`,
            lastModified: new Date(user.lastModified || new Date()),
            changeFrequency: 'daily',
            priority: 0.8,
        }));

        return [...staticRoutes, ...userRoutes, {
            url: `https://www.tapit.fr/${users.length}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        }];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticRoutes;
    }
}
