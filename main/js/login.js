import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7gwN-3GVlJ-a_MTBxqVnc7Oltq5wSvHQ",
  authDomain: "acadbird-379e3.firebaseapp.com",
  projectId: "acadbird-379e3",
  storageBucket: "acadbird-379e3.appspot.com",
  messagingSenderId: "575491576951",
  appId: "1:575491576951:web:70f86aba1e33b871f8a272",
  measurementId: "G-N6Z672SXWJ"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMessageDisplay = document.getElementById("errorMessage");

  loginButton.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailInput.value.trim(),
        passwordInput.value.trim()
      );

      const user = userCredential.user;

      // get Firestore user profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) throw new Error("No profile found");

      const userData = userDoc.data();
      localStorage.setItem("user", JSON.stringify({ id: user.uid, ...userData }));

      // Redirect based on role
      switch (userData.role) {
        case "teacher":
          window.location.href = "../../teachers/html/homepage-teachers.html";
          break;
        case "parent":
          window.location.href = "../../parents/html/homepage_parents.html";
          break;
        case "admin":
          window.location.href = "../../admin/html/dashboard_admin.html";
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      errorMessageDisplay.textContent = "Invalid email or password.";
    }
  });
});
