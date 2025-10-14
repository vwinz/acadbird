// File: homepage-teachers.js

// Global variables initialized in the HTML script block
// window.auth = firebase.auth();
// window.db = firebase.firestore();
// window.hideModal = function(id) { ... };
console.log("LocalStorage user:", localStorage.getItem("user"));

// --- DOM References and Global State ---
const classGrid = document.getElementById('class-grid');
const newClassLink = document.getElementById('new-class-link');
const newClassNameInput = document.getElementById('new-class-name');
const addClassBtn = document.getElementById('add-class-btn');
const teacherNameHeader = document.getElementById('teacher-name-header');
const teacherNameProfile = document.getElementById('teacher-name');
const teacherRoleProfile = document.getElementById('teacher-role');
const schoolNameProfile = document.getElementById('school-name');
const teacherAvatar = document.getElementById('teacher-avatar'); 

const newClassModal = document.getElementById('new-class-modal');
const editModal = document.getElementById('edit-modal');
const confirmModal = document.getElementById('confirm-modal');
const confirmModalText = document.getElementById('confirm-modal-text');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');
const editClassNameInput = document.getElementById('edit-class-name');
const saveEditBtn = document.getElementById('save-edit-btn');

const mainContentWrapper = document.getElementById('main-content-wrapper');
const loadingSpinner = document.getElementById('loading-spinner');

let currentTeacherUid = null;
let currentClasses = [];

// --- Helper Functions ---

function showModal(modalElement) {
    modalElement?.classList.add('show');
}

// Function to get a random class color
const CLASS_COLORS = ['yellow', 'green', 'blue', 'pink'];
function getRandomColor() {
    return CLASS_COLORS[Math.floor(Math.random() * CLASS_COLORS.length)];
}

// Function to create a class card element
async function createClassCard(classObj) {
    const card = document.createElement('div');
    card.className = `class-card ${classObj.color || getRandomColor()}`;
    card.setAttribute('data-class-id', classObj.id);

    // ✅ Get actual student count from Firestore
    const studentCount = await getStudentCountForClass(classObj.id);
    console.log(`Class "${classObj.name}" has ${studentCount} students.`); // Debug

    card.innerHTML = `
        <div class="card-icons">
            <a href="#" class="card-icon archive-icon"><i class="fas fa-archive"></i></a>
            <a href="#" class="card-icon edit-icon"><i class="fas fa-pencil-alt"></i></a>
            <a href="#" class="card-icon trash-icon"><i class="fas fa-trash-alt"></i></a>
        </div>
        <div class="class-name">${classObj.name}</div>
        <div class="student-count">${studentCount} students</div>
    `;

    card.addEventListener('click', (e) => {
        if (e.target.closest('.card-icons')) return;
        localStorage.setItem('selectedClassId', classObj.id);
        localStorage.setItem('selectedClassName', classObj.name);
        window.location.href = "homepage-classroom_teacher.html";
    });

    return card;
}


async function getStudentCountForClass(classId) {
    try {
        const snapshot = await db.collection('students')
                                 .where('classroomId', '==', classId)
                                 .get();
        return snapshot.size; // number of students in this class
    } catch (err) {
        console.error("Failed to count students for class", classId, err);
        return 0;
    }
}


// Function to render all classes
async function renderClasses() {
    const newClassCard = classGrid.querySelector('.new-class-card');
    classGrid.innerHTML = '';

    for (const c of currentClasses) {
        const card = await createClassCard(c); // ✅ wait for async student count
        classGrid.appendChild(card);
    }

    if (newClassCard) classGrid.appendChild(newClassCard);
}



// --- Firebase Data Functions ---

// Function to load and display teacher profile data
async function loadTeacherProfile(uid) {
    const userRef = db.collection('users').doc(uid);
    let data;

    try {
        const doc = await userRef.get();
        
        if (doc.exists) {
            data = doc.data();
        } else {
            // Create a placeholder profile if the teacher doesn't exist yet
            const placeholderData = {
                firstName: 'Your',
                lastName: 'Name',
                name: 'Your Name', 
                photoURL: '../../main/img/teacher.png',   // ✅ default teacher photo
                role: 'Teacher',
                school: 'Your School'
            };
            await userRef.set(placeholderData);
            data = placeholderData; 
        }

        // ✅ Build full name (firstName + lastName)
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const teacherName = (firstName + ' ' + lastName).trim() || 'Your Name';

        const teacherRole = data.role || 'Teacher';
        const schoolName = data.school || 'Your School';
        const photoURL = data.photoURL || '../../main/img/teacher.png';  // ✅ fallback

        // ✅ Update UI
        teacherNameHeader.textContent = `${teacherName}'s Classes`;
        teacherNameProfile.textContent = teacherName;
        teacherRoleProfile.textContent = teacherRole;
        schoolNameProfile.textContent = schoolName;
        teacherAvatar.src = photoURL;
        
        // Hide spinner and show the main content
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        if (mainContentWrapper) {
            mainContentWrapper.style.display = 'flex';
        }

    } catch (error) {
        console.error("Error fetching user profile:", error);
        alert("Failed to load profile data. Check console and security rules.");
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (mainContentWrapper) mainContentWrapper.style.display = 'flex';
    }
}


// Function to load and display classrooms using a real-time listener
function setupClassListener(uid) {
    const classesRef = db.collection('classrooms')
                         .where('teacherId', '==', uid)
                         .where('status', '==', 'active');

    // In setupClassListener
    classesRef.onSnapshot(snapshot => {
        currentClasses = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            currentClasses.push({
                id: doc.id,
                name: data.classroomName || "Unnamed Class"
            });
        });

        console.log("Classes loaded:", currentClasses); // Debug
        renderClasses(); // Will now fetch student count per class
    });
} // ✅ Added missing closing brace



// --- Firebase Authentication & Initialization ---

const currentUser = JSON.parse(localStorage.getItem("user"));

if (!currentUser || currentUser.role !== "teacher") {
  window.location.href = "../../main/html/login.html";
} else {
  currentTeacherUid = currentUser.id;   // ✅ Set the global UID
  loadTeacherProfile(currentUser.id);
  setupClassListener(currentUser.id);
}



// --- EVENT LISTENERS (CRUD Operations) ---

// 1. Open New Class Modal
newClassLink.addEventListener('click', e => {
    e.preventDefault();
    showModal(newClassModal);
});


// 2. Add new class
// 2. Add new class
addClassBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const name = newClassNameInput.value.trim();

    if (!name || !currentTeacherUid) {
        return alert('Please wait for the application to load before adding a class.');
    }

const newClassData = {
    teacherId: currentTeacherUid,   // 👈 change here
    classroomName: name,
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    status: "active"
};

    try {
        await db.collection('classrooms').add(newClassData);
        window.hideModal('new-class-modal');
        newClassNameInput.value = '';
        console.log(`Class "${name}" added successfully with status "active".`);
    } catch (error) {
        console.error("Error adding class:", error);
        alert("Failed to add class. Check console for details.");
    }
});



// 3. Edit, Archive, Delete listeners (Delegated event handling)
classGrid.addEventListener('click', e => {
    const classCard = e.target.closest('.class-card');
    if (!classCard) return;

    const classId = classCard.dataset.classId;
    const classObj = currentClasses.find(c => c.id === classId);

    if (!classId || !classObj) return;

    const cardIcon = e.target.closest('.card-icon');

    if (cardIcon) {
        // Handle icon clicks
        e.preventDefault();
        e.stopPropagation();

        if (cardIcon.classList.contains('edit-icon')) {
            editClassNameInput.value = classObj.name;
            saveEditBtn.dataset.classId = classId;
            showModal(editModal);
        } else if (cardIcon.classList.contains('archive-icon')) {
            confirmModalText.textContent = `Are you sure you want to archive "${classObj.name}"?`;
            showModal(confirmModal);
            confirmYesBtn.onclick = () => archiveClass(classId);
            confirmNoBtn.onclick = () => window.hideModal('confirm-modal');
        } else if (cardIcon.classList.contains('trash-icon')) {
            confirmModalText.textContent = `Are you sure you want to permanently delete "${classObj.name}"? This action cannot be undone.`;
            showModal(confirmModal);
            confirmYesBtn.onclick = () => deleteClass(classId);
            confirmNoBtn.onclick = () => window.hideModal('confirm-modal');
        }

    } else {
        // Clicked the card itself, not an icon → select class
        localStorage.setItem('selectedClassId', classId);
        window.location.href = "homepage-classroom_teacher.html";
    }
});


// 4. Save edited class name
saveEditBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const classId = saveEditBtn.dataset.classId;
    const newName = editClassNameInput.value.trim();
    
    if (!classId || !newName) return;

    try {
        const classRef = db.collection('classrooms').doc(classId);
        console.log("Updating path:", classRef.path); // 🔍 check which collection
        await classRef.update({ classroomName: newName });
        console.log(`Class ${classId} renamed to "${newName}".`);
        window.hideModal('edit-modal');
    } catch (error) {
        console.error("Error updating class name:", error);
        alert("Failed to save changes. Check console for details.");
    }
});


// 5. Archive class
async function archiveClass(classId) {
    if (!classId) return;
    
    try {
        await db.collection('classrooms').doc(classId).update({
            status: "archived", // ✅ use the same `status` field as add
            archivedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Class ${classId} archived successfully.`);
        window.hideModal('confirm-modal');
    } catch (error) {
        console.error("Error archiving class:", error);
        alert("Failed to archive class. Check console for details.");
    }
}

// 6. Permanently delete class
async function deleteClass(classId) {
    if (!classId) return;
    
    try {
        await db.collection('classrooms').doc(classId).delete();
        console.log(`Class ${classId} permanently deleted.`);
        window.hideModal('confirm-modal');
    } catch (error) {
        console.error("Error deleting class:", error);
        alert("Failed to delete class. Check console for details.");
    }
}
