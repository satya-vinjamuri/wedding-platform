import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import { FormState, PartyMember } from "@/types/FormState";
import { User } from "firebase/auth";

export async function saveFormToFirestore(user: User, form: FormState): Promise<boolean> {
    if (!user) return false;

    const formCopy: any = { ...form };

    try {
        // Save the Date image
        if (form.saveTheDateImage instanceof File) {
            const imageRef = ref(storage, `weddingApps/${user.uid}/saveTheDateImage.jpg`);
            await uploadBytes(imageRef, form.saveTheDateImage);
            const downloadURL = await getDownloadURL(imageRef);
            formCopy.saveTheDateImageUrl = downloadURL;
        }
        formCopy.saveTheDateImage = null;

        // Story section images
        if (form.storySections) {
            formCopy.storySections = await Promise.all(form.storySections.map(async (section, index) => {
                let imageUrl = null;

                if (section.image instanceof File) {
                    const imageRef = ref(storage, `weddingApps/${user.uid}/storySection_${index}.jpg`);
                    await uploadBytes(imageRef, section.image);
                    imageUrl = await getDownloadURL(imageRef);
                }

                return {
                    ...section,
                    image: null,
                    imageUrl,
                };
            }));
        }

        // Wedding party images
        const uploadPartyImages = async (members: PartyMember[], role: "bride" | "groom") =>
            Promise.all(members.map(async (member, index) => {
                let imageUrl = null;

                if (member.image instanceof File) {
                    const imageRef = ref(storage, `weddingApps/${user.uid}/party_${role}_${index}.jpg`);
                    await uploadBytes(imageRef, member.image);
                    imageUrl = await getDownloadURL(imageRef);
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

        // Background image
        if (form.backgroundImage instanceof File) {
            const imageRef = ref(storage, `weddingApps/${user.uid}/backgroundImage.jpg`);
            await uploadBytes(imageRef, form.backgroundImage);
            const downloadURL = await getDownloadURL(imageRef);
            formCopy.backgroundImageUrl = downloadURL;
        }
        formCopy.backgroundImage = null;

        // Timestamp
        formCopy.updatedAt = new Date().toISOString();

        // Save to Firestore
        await setDoc(doc(db, "weddingApps", user.uid), formCopy, { merge: true });

        return true;
    } catch (error) {
        console.error("Failed to save form:", error);
        return false;
    }
}

