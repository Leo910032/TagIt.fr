//updateSocial.jsx
import { fireApp } from "@/important/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { testForActiveSession } from "../authentication/testForActiveSession";

export async function updateSocials(arrayOfSocials) {
    const username = testForActiveSession();
    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const previousData = docSnap.data();
                // Only update if we have data to update with
                if (arrayOfSocials && arrayOfSocials.length > 0) {
                    const objectToUpdate = {...previousData, socials: arrayOfSocials};
                    await setDoc(docRef, objectToUpdate);
                }
                return;
            }

            // Only create if we have data
            if (arrayOfSocials && arrayOfSocials.length > 0) {
                await setDoc(docRef, {socials: arrayOfSocials});
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}

export async function updateSocialPosition(position) {
    const username = testForActiveSession();
    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const previousData = docSnap.data();
                const objectToUpdate = {...previousData, socialPosition: position};
                await setDoc(docRef, objectToUpdate);
                return;
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}
// Fix the addDoc calls in functions like updateSupportBanner
export async function updateSupportBanner(choice) {
    const username = testForActiveSession();
    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const previousData = docSnap.data();
                const objectToUpdate = {...previousData, supportBanner: choice};
                await setDoc(docRef, objectToUpdate);
                return;
            }

            // Changed from addDoc to setDoc since we already have the docRef
            await setDoc(docRef, {supportBanner: choice});
        } catch (error) {
            throw new Error(error);
        }
    }
}

export async function updateSupportBannerStatus(status) {
    const username = testForActiveSession();
    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const previousData = docSnap.data();
                const objectToUpdate = {...previousData, supportBannerStatus: status};
                await setDoc(docRef, objectToUpdate);
                return;
            }

            await addDoc(docRef, {supportBannerStatus: status});
        } catch (error) {
            throw new Error(error);
        }
    }
}

export async function updateSensitiveType(type) {
    const username = testForActiveSession();
    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const previousData = docSnap.data();
                const objectToUpdate = {...previousData, sensitivetype: type};
                await setDoc(docRef, objectToUpdate);
                return;
            }

            await addDoc(docRef, {sensitivetype: type});
        } catch (error) {
            throw new Error(error);
        }
    }
}

export async function updateSensitiveStatus(status) {
    const username = testForActiveSession();
    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const previousData = docSnap.data();
                const objectToUpdate = {...previousData, sensitiveStatus: status};
                await setDoc(docRef, objectToUpdate);
                return;
            }

            await addDoc(docRef, {sensitiveStatus: status});
        } catch (error) {
            throw new Error(error);
        }
    }
}

export async function updateCustomMetaData(metadata) {
    const username = testForActiveSession();
    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const previousData = docSnap.data();
                const objectToUpdate = {...previousData, metaData: metadata};
                await setDoc(docRef, objectToUpdate);
                return;
            }

            await addDoc(docRef, {metaData: metadata});
        } catch (error) {
            throw new Error(error);
        }
    }
}