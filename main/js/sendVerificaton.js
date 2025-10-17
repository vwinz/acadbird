import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Initialize
const db = getFirestore();
const auth = getAuth();

async function sendVerificationCode(email, verificationCode) {
  try {
    // Step 1: Find the user document with this email
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No user found with that email!");
      return;
    }

    // Step 2: Update the found user doc with verifCode
    querySnapshot.forEach(async (userDoc) => {
      const userRef = doc(db, "users", userDoc.id);
      await updateDoc(userRef, {
        verifCode: verificationCode
      });
      console.log("Verification code saved in Firestore for:", email);
    });

  } catch (error) {
    console.error("Error saving verification code:", error);
  }
}
