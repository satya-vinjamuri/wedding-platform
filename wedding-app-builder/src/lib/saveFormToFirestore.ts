import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import { FormState, PartyMember } from "@/types/FormState";
import { User } from "firebase/auth";

export async function saveFormToFirestore(user: User, form: FormState) {
    if (!user) return;

    const formCopy: any = { ...form };

    // Upload Save the Date Image
    if (form.saveTheDateImage instanceof File) {
        try {
            const imageRef = ref(storage, `weddingApps/${user.uid}/saveTheDateImage.jpg`);
            await uploadBytes(imageRef, form.saveTheDateImage);
            const downloadURL = await getDownloadURL(imageRef);
            formCopy.saveTheDateImageUrl = downloadURL;
        } catch (error) {
            console.error("Save The Date image upload failed:", error);
        }
    }
    formCopy.saveTheDateImage = null;

    // Upload Story Section Images
    if (form.storySections) {
        formCopy.storySections = await Promise.all(form.storySections.map(async (section, index) => {
            let imageUrl = null;

            if (section.image instanceof File) {
                try {
                    const imageRef = ref(storage, `weddingApps/${user.uid}/storySection_${index}.jpg`);
                    await uploadBytes(imageRef, section.image);
                    imageUrl = await getDownloadURL(imageRef);
                } catch (error) {
                    console.error(`Story section ${index} image upload failed:`, error);
                }
            }

            return {
                ...section,
                image: null,
                imageUrl,
            };
        }));
    }

    // Upload Wedding Party Images
    const uploadPartyImages = async (members: PartyMember[], role: "bride" | "groom") =>
        Promise.all(members.map(async (member, index) => {
            let imageUrl = null;

            if (member.image instanceof File) {
                try {
                    const imageRef = ref(storage, `weddingApps/${user.uid}/party_${role}_${index}.jpg`);
                    await uploadBytes(imageRef, member.image);
                    imageUrl = await getDownloadURL(imageRef);
                } catch (error) {
                    console.error(`${role} member ${index} image upload failed:`, error);
                }
            }

            return {
                ...member,
                image: null,
                imageUrl,
            };
        }));

    formCopy.weddingParty = {
        bride: await uploadPartyImages(form.weddingParty.bride, "bride"),
        groom: await uploadPartyImages(form.weddingParty.groom, "groom"),
    };

    // Upload Background Image
    if (form.backgroundImage instanceof File) {
        try {
            const imageRef = ref(storage, `weddingApps/${user.uid}/backgroundImage.jpg`);
            await uploadBytes(imageRef, form.backgroundImage);
            const downloadURL = await getDownloadURL(imageRef);
            formCopy.backgroundImageUrl = downloadURL;
        } catch (error) {
            console.error("Background image upload failed:", error);
        }
        formCopy.backgroundImage = null;
    }

    // Timestamp
    formCopy.updatedAt = new Date().toISOString();

    // Final save to Firestore
    await setDoc(doc(db, "weddingApps", user.uid), formCopy, { merge: true });
}

