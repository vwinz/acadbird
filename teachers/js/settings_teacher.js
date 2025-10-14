document.addEventListener('DOMContentLoaded', function () {
    // ⚠️ IMPORTANT: 'auth' and 'db' objects are now defined in a <script> tag 
    // in the HTML BEFORE this file is loaded.

    // --- Element Selections ---
    const accountMenu = document.querySelector('.account-menu');
    const dropdown = document.querySelector('.dropdown-content');
    const settingsView = document.getElementById('settings-view');
    const passwordView = document.getElementById('password-view');
    const backToDashboardBtn = document.getElementById('back-to-dashboard');
    
    // Header elements
    const mainNavMenu = document.getElementById('main-nav-menu');
    const passwordHeaderTitle = document.getElementById('password-header-title');
    
    // Buttons for switching views
    const goToPasswordBtn = document.getElementById('change-password-btn');
    const submitPasswordBtn = document.querySelector('#password-view .action-button'); // The submit button in the password view

    // Logout Button Selections (RE-ADDED)
    const dropdownLogoutLink = document.getElementById('logout-link');
    const mainLogoutButton = document.getElementById('logout-btn-main'); 

    // Profile Form Fields (RE-ADDED)
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email'); 
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');

    // --- Utility Functions ---

    /**
     * Fetches user profile data from Firestore and updates the form.
     * This function requires the 'db' (Firestore) object to be defined.
     * @param {string} uid The Firebase User ID.
     */
    async function loadUserProfile(uid) {
        if (typeof db === 'undefined') {
            console.error("Firestore 'db' object is not defined. Cannot load profile data.");
            return;
        }
        
        try {
            // Fetch the document from the 'users' collection using the UID
            const doc = await db.collection("users").doc(uid).get();
            
            if (doc.exists) {
                const data = doc.data();
                
                // Populate the form fields
                firstNameInput.value = data.firstName || '';
                lastNameInput.value = data.lastName || '';
                usernameInput.value = data.username || '';
                
                // Update avatar placeholder 
                if (data.firstName) {
                    avatarPlaceholder.textContent = data.firstName.charAt(0).toUpperCase();
                } else {
                    avatarPlaceholder.textContent = 'A';
                }

                console.log("Profile data loaded from Firestore successfully.");
            } else {
                console.warn("No user data found in Firestore for UID:", uid);
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
        }
    }


    function showSettingsPage() {
        // Hide password view and show settings view
        passwordView.classList.add('hidden');
        settingsView.classList.remove('hidden');
        
        // Hide password header and show main nav menu
        passwordHeaderTitle.classList.add('hidden');
        mainNavMenu.classList.remove('hidden');

        // Show the back button (to go to dashboard)
        backToDashboardBtn.style.visibility = 'visible';
        backToDashboardBtn.onclick = () => {
             // Change this to the actual dashboard/home page URL
             window.location.href = 'homepage-teachers.html'; 
        };
    }

    function showPasswordPage() {
        // Hide settings view and show password view
        settingsView.classList.add('hidden');
        passwordView.classList.remove('hidden');
        
        // Hide main nav menu and show password header
        mainNavMenu.classList.add('hidden');
        passwordHeaderTitle.classList.remove('hidden');

        // Hide the back button on the password page, and assign its function to go back to settings
        backToDashboardBtn.style.visibility = 'visible';
        backToDashboardBtn.onclick = showSettingsPage; // Pressing 'back' now returns to settings
    }

    /**
     * Handles user sign-out using Firebase Auth.
     */
    async function handleLogout(event) {
        event.preventDefault(); 
        if (typeof auth === 'undefined') {
             console.error("Firebase Auth not initialized. Cannot log out.");
             return;
        }

        try {
            await auth.signOut();
            console.log("User successfully signed out. Redirecting to login.");
            // Redirect to the login page
            window.location.href = '../login.html'; 
        } catch (error) {
            console.error("Sign out error:", error);
            alert("Failed to sign out. Please try again. Error: " + error.message);
        }
    }


    // --- Event Listeners ---

    // 1. Toggle Dropdown Menu
    accountMenu.addEventListener('click', function (event) {
        event.stopPropagation();
        // Check if dropdown element exists before toggling
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    });

    // 2. Close dropdown if clicked outside
    window.addEventListener('click', function () {
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    });

    // 3. Switch to Change Password view
    if (goToPasswordBtn) {
        goToPasswordBtn.addEventListener('click', showPasswordPage);
    }
    
    // 4. Handle "Change Password" submission (Placeholder for Firebase Auth update)
    if (submitPasswordBtn) {
        submitPasswordBtn.addEventListener('click', function() {
            // ⚠️ TODO: Add logic here to validate old/new passwords and call 
            // the Firebase Auth function to update the password.
            console.log("Password change submitted! (Firebase update logic goes here)");
            
            // For now, just switch back to the main settings view
            showSettingsPage();
        });
    }

    // 5. Logout Button Event Listeners (RE-ADDED)
    if (dropdownLogoutLink) {
        dropdownLogoutLink.addEventListener('click', handleLogout);
    }
    if (mainLogoutButton) {
        mainLogoutButton.addEventListener('click', handleLogout);
    }
    
    // 6. Authentication Check (Core logic for security and data loading) (RE-ADDED)
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                console.log("No user found. Redirecting to login.");
                // ⚠️ Uncomment this line when ready to enforce login
                // window.location.href = '../login.html'; 
            } else {
                console.log("User is logged in as:", user.email, "UID:", user.uid);
                
                // 1. Set email field from Firebase Auth object
                emailInput.value = user.email; 
                
                // 2. Fetch and load additional profile data from Firestore
                loadUserProfile(user.uid);
            }
        });
    } else {
        console.error("Firebase Auth not initialized. Check your HTML script order.");
    }


    // Initialize the page view
    showSettingsPage();

});