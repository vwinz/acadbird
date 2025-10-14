import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config
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
const db = getFirestore(app);

// Export or attach globally
window.db = db;

      const classesData = [
        {
          id: 'christine',
          name: 'Christine Rivera',
          class: 'Kinder Lily',
          teacher: 'Ms. Juana C. Obia',
          page: 'dashboard_parents.html',
        },
        {
          id: 'chelsea',
          name: 'Chelsea Rivera',
          class: 'Kinder Daisy',
          teacher: 'Ms. Delilah R. Romero',
          page: 'kinder_daisy.html',
        },
      ];

      const studentListContainer = document.getElementById(
        'student-list-container'
      );
      const classListContainer = document.getElementById(
        'class-list-container'
      );
      const modal = document.getElementById('modal');
      
      // Track the currently selected student/class ID
      let activeClassId = classesData.length > 0 ? classesData[0].id : null; 

      function showModal() {
        modal.style.display = 'flex';
      }

      function closeModal() {
        modal.style.display = 'none';
        document.getElementById('classCode').value = '';
      }
      
      // Function to handle class card and student card clicks
      function selectClass(classId) {
        const student = classesData.find((c) => c.id === classId);
        if (student) {
          activeClassId = classId;
          
          // RENDER LEFT PANEL: Display ONLY the selected student's class
          renderClassList();
          
          // 2. Update Student Cards to show active state
          document.querySelectorAll('.student-card').forEach((card) => {
            card.classList.remove('active');
          });
          const studentCard = document.getElementById(student.id); 
          if (studentCard) {
            studentCard.classList.add('active');
          }
          
          // Set up navigation onclick on the active card
          // We need to re-select the card element after renderClassList()
          const activeCard = document.getElementById('class-card-' + classId);
          if (activeCard) {
             activeCard.onclick = (e) => {
                e.preventDefault(); 
                window.location.href = student.page;
             };
          }
        }
      }

      // Function to create a class box (the box in the left panel)
      function createClassCard(student) {
        const card = document.createElement('div');
        card.id = 'class-card-' + student.id; 
        card.className = 'class-card active-class'; // It's always active because it's the ONLY one shown
        
        // Inject the child's name into the card content
        card.innerHTML = `
          <span class="child-name">${student.name}'s Class</span> 
          <h3>${student.class}</h3>
          <p>Teacher: ${student.teacher}</p>
        `;
        
        // This is primarily for the navigation click set in selectClass
        card.onclick = (e) => {
            e.preventDefault(); 
            // Do nothing here, as navigation is set in selectClass
        }
        return card;
      }
      
      // Function to create a student box (the boxes in the right panel)
      function createStudentCard(student) {
        const card = document.createElement('div');
        card.id = student.id;
        card.className = 'student-card';
        if (student.id === activeClassId) {
            card.classList.add('active');
        }
        
        card.innerHTML = `
          <i class="fas fa-user-circle"></i>
          <h4>${student.name}</h4>
        `;
        // Clicking the student card triggers the update of both panels
        card.onclick = () => selectClass(student.id);
        return card;
      }
      
      // MODIFIED: Only render the class for the currently active student
      function renderClassList() {
        classListContainer.innerHTML = ''; // Clear existing cards
        
        const student = classesData.find((c) => c.id === activeClassId);
        
        if (student) {
            const card = createClassCard(student);
            classListContainer.appendChild(card);
        }
      }

      function renderStudentList() {
        // Render right-side student cards (all students)
        studentListContainer.innerHTML = ''; 
        classesData.forEach((student) => {
          const card = createStudentCard(student);
          studentListContainer.appendChild(card);
        });
        
        // Render left-side class card (only the active one)
        renderClassList();
        
        // Ensure the initial class is selected and highlighted
        if (classesData.length > 0 && activeClassId) {
          selectClass(activeClassId);
        }
      }

     
     async function addStudent() {
  if (!window.db) {
    console.error("❌ Firestore is not initialized!");
    alert("Firestore is not initialized. Check Firebase setup.");
    return;
  }

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const gender = document.getElementById('gender').value;
  const age = parseInt(document.getElementById('age').value);

  if (!firstName || !lastName || !gender || !age) {
    alert("Please fill out all fields.");
    return;
  }

  const newStudent = {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    gender,
    age,
    class: "Unassigned",
    teacher: "",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(window.db, "students"), newStudent);
    console.log("✅ Student added with ID:", docRef.id);

    classesData.push({
      id: docRef.id,
      name: newStudent.fullName,
      class: newStudent.class,
      teacher: newStudent.teacher,
      page: "default_class.html",
    });

    activeClassId = docRef.id;
    closeModal();
    renderStudentList();

  } catch (error) {
    console.error("🔥 Firebase Error:", error);
    alert(`Failed to add student: ${error.message}`);
  }
}


      // Initial page load
      renderStudentList();
// Attach event listener to Add Student card
// Add Student modal button
const addStudentBtn = document.getElementById('add-student-btn');
addStudentBtn.addEventListener('click', addStudent);

// Add Student card in the right panel
const addStudentCard = document.getElementById('add-student-card');
addStudentCard.addEventListener('click', showModal);

// Optional: expose globally if needed
window.addStudent = addStudent;
window.showModal = showModal;
window.closeModal = closeModal;

