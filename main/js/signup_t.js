document.addEventListener('DOMContentLoaded', function() {
    // Select the form and the back button using the IDs added in the previous step
    // NOTE: This setup assumes your HTML form uses id="teacherSignupForm" and the button uses id="signupButton"
    // and the button is set to type="button" to prevent native reload.
    const form = document.getElementById('teacherSignupForm');
    const backButton = document.getElementById('backButton');
    const signupButton = document.getElementById('signupButton'); // Select the button too

    // Check if Firebase objects are available globally (initialized in the HTML)
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error("Firebase 'auth' or 'db' object is not defined. Check your script loading order and Firebase config in HTML.");
        alert("Sign Up Service Error: Firebase services are not initialized. Please check console for details.");
        return;
    }

    // --- Event Listeners ---
    // If the HTML button is type="button", use the click listener on the button.
    // If the HTML button is type="submit", use the submit listener on the form.
    
    // We'll use the button click as it's the most reliable way to prevent the reload issue (the '?')
    if (signupButton) { 
        signupButton.addEventListener('click', handleTeacherSignup);
    }
    // Keeping the form listener as a fallback if the button type isn't changed in HTML
    else if (form) {
        form.addEventListener('submit', handleTeacherSignup);
    }


    if (backButton) {
        // Handle "Back" button navigation
        backButton.addEventListener('click', () => {
            // ⚠️ CHANGE 'index.html' to the page the user should return to (e.g., role selection)
            window.location.href = 'index.html'; 
        });
    }

    // --- Sign Up Function ---
    async function handleTeacherSignup(event) {
        // 1. CRITICAL: Prevent the form from submitting and reloading the page
        // event.preventDefault() is needed if attached to form submit, or if the button is type="submit"
        event.preventDefault(); 
        
        // 2. Get Form Values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 3. Local Validation Checks
        if (password !== confirmPassword) {
            alert("The password and confirmation password do not match.");
            return;
        }

        // 4. Firebase Registration and Firestore Storage
        try {
            // Step 4a: Create user in Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log("Teacher authentication successful. UID:", user.uid);

            // Step 4b: Save Additional User Data to Firestore
            // Creates a document in the 'users' collection using the user's UID as the document ID
            await db.collection("users").doc(user.uid).set({
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                userType: 'teacher', // <--- 🎉 UPDATED FIELD NAME TO 'userType' 
                                     // (Matches your successful Firestore document/login expectation)
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log("User data saved to Firestore successfully. Redirecting to teacher homepage...");
            
            // 5. Success and Redirection
            alert("Account created successfully! Welcome to AcadBird.");
            
            // ⚠️ CHECK THE REDIRECT PATH CAREFULLY! 
            // This is the path to your teacher's main dashboard after successful signup
            window.location.href = 'teachers/homepage-teachers.html'; // <--- Using the path you provided

        } catch (error) {
            // Handle specific Firebase errors
            console.error("Firebase Sign Up Error:", error);
            
            let message = "Sign up failed.";
            
            if (error.code === 'auth/email-already-in-use') {
                message = "This email address is already in use. Try logging in.";
            } else if (error.code === 'auth/weak-password') {
                message = "The password must be 6 characters or longer.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Please enter a valid email address.";
            } else if (error.code === 'permission-denied') {
                message = "Sign up succeeded, but saving profile data failed (Permission Denied). Check Firestore Security Rules.";
            }
            
            alert("Registration Failed: " + message);
        }
    }
});