import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB7gwN-3GVlJ-a_MTBxqVnc7Oltq5wSvHQ",
    authDomain: "acadbird-379e3.firebaseapp.com",
    projectId: "acadbird-379e3",
    storageBucket: "acadbird-379e3.firebasestorage.app",
    messagingSenderId: "575491576951",
    appId: "1:575491576951:web:70f86aba1e33b871f8a272",
    measurementId: "G-N6Z672SXWJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Persist login across page reloads
await setPersistence(auth, browserLocalPersistence);


// ---------------------
// 2. DOM Elements
// ---------------------
const classroomTitle = document.getElementById("classroom-title");
const studentCountElement = document.querySelector('.data-card-green .data-number');


// ---------------------
// 3. Load Class Data Function
// ---------------------
async function loadClassData() {
    const classId = localStorage.getItem('selectedClassId');
    const className = localStorage.getItem('selectedClassName');

    if (!classId || !className) {
        classroomTitle.textContent = "No class selected.";
        alert("No class selected.");
        return;
    }

    classroomTitle.textContent = className;
    studentCountElement.textContent = "--";

    try {
        const classRef = doc(db, "classrooms", classId);
        const classSnap = await getDoc(classRef);

        if (classSnap.exists()) {
            const data = classSnap.data();
            classroomTitle.textContent = data.classroomName || className;
            studentCountElement.textContent = data.students ? data.students.length : 0;
        } else {
            classroomTitle.textContent = className;
            studentCountElement.textContent = 0;
        }
    } catch (err) {
        console.error("Failed to load class:", err);
        classroomTitle.textContent = className + " (offline/fallback)";
        studentCountElement.textContent = 0;
    }
}

function attachStudentCardListeners() {
    document.querySelectorAll('.student-card').forEach(card => {
        card.addEventListener('click', () => {
            const studentId = card.dataset.studentId;
            const classId = localStorage.getItem('selectedClassId'); // keep context
            // Redirect to student info page with query params
            window.location.href = `studentlistpage_studentinfo.html?studentId=${studentId}&classId=${classId}`;
        });
    });
}

// ---------------------
// 4. Auth State Listener (put your block here)
// ---------------------
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("Auth state changed: no user yet"); // normal first call
        return; // don't redirect
    }

    console.log("Logged-in user detected:", user.uid);

    try {
        const teacherRef = doc(db, "users", user.uid);
        const teacherSnap = await getDoc(teacherRef);

        if (!teacherSnap.exists() || teacherSnap.data().role !== "teacher") {
            alert("Please log in as a teacher.");
            window.location.href = "../../main/html/login.html";
            return;
        }

        // ✅ Auth + role verified
        loadClassData();
    } catch (err) {
        console.error("Error verifying teacher role:", err);
    }
    console.log("Current user (auth.currentUser):", auth.currentUser);

});
console.log("Current user (auth.currentUser):", auth.currentUser);

// ---------------------
// 5. Other page code here (calendar, posts, etc.)
// ---------------------
students.forEach(student => createStudentCard(student));
attachStudentCardListeners();
