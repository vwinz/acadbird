// =======================
// Modal & Note Handling
// =======================
const noteModal = document.getElementById('note-modal');
const codeModal = document.getElementById('code-modal');
const noteTextArea = document.getElementById('note-text');
const shareExpired = document.getElementById('share-expired');

const saveNoteBtn = document.getElementById('save-note-btn');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const okCodeBtn = document.getElementById('code-ok-btn');

let currentNoteCell = null;

// Select close buttons dynamically
const closeNoteBtn = noteModal ? noteModal.querySelector('.close-button') : null;
const closeCodeBtn = codeModal ? codeModal.querySelector('.close-button') : null;

// ---------- Note Modal ----------
// Open note modal when plus icon is clicked
function attachAddNoteListeners() {
  document.querySelectorAll('.add-note-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      currentNoteCell = e.target.closest('td');
      noteTextArea.value = currentNoteCell.getAttribute('data-note') || '';
      if (noteModal) noteModal.style.display = 'flex';
    });
  });
}


function attachParentAutocomplete() {
  const parentInput = document.getElementById("parents-name");
  const suggestionsBox = document.getElementById("parent-suggestions");

  parentInput.addEventListener("input", () => {
  const query = parentInput.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";

  if (!query) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = parentUsers.filter(p => p.name.toLowerCase().includes(query));
  console.log("Matches found:", matches); // <-- debug

  matches.forEach(parent => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = parent.name;

    div.addEventListener("mousedown", () => {
      parentInput.value = parent.name;
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
    });

    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = matches.length ? "block" : "none";
});


  // Hide suggestions when clicking outside
  document.addEventListener("click", e => {
    if (!parentInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
    }
  });
}


// Initial attachment
attachAddNoteListeners();

// Close note modal
if (closeNoteBtn) closeNoteBtn.addEventListener('click', () => { noteModal.style.display = 'none'; });
if (cancelNoteBtn) cancelNoteBtn.addEventListener('click', () => { noteModal.style.display = 'none'; });

// Save note and update cell
if (saveNoteBtn) {
  saveNoteBtn.addEventListener('click', () => {
    if (!currentNoteCell) return;
    const note = noteTextArea.value.trim();
    currentNoteCell.setAttribute('data-note', note);
    if (note) {
      currentNoteCell.innerHTML = `<i class="fas fa-sticky-note"></i>`;
      currentNoteCell.title = note;
    } else {
      currentNoteCell.innerHTML = `<i class="fas fa-plus add-note-icon"></i>`;
    }
    if (noteModal) noteModal.style.display = 'none';
    attachAddNoteListeners(); // reattach listeners
  });
}

// ---------- Code Modal ----------
const generateBtn = document.getElementById('generate-code-btn');
const shareBtn = document.getElementById('share-code-btn');
const parentCodeText = document.getElementById('parent-code-text');

if (generateBtn) {
  generateBtn.addEventListener('click', () => {
    if (shareExpired) shareExpired.style.display = 'none';
    const words = ['cheeky','jolly','happy','bright','smart','witty','brave'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const newCode = `${randomWord}-${randomNum}`;
    const generatedCodeEl = document.getElementById('generated-code');
    if (generatedCodeEl) generatedCodeEl.textContent = newCode;
    if (parentCodeText) parentCodeText.textContent = newCode;
    if (codeModal) codeModal.style.display = 'flex';
  });
}

if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    const generatedCodeEl = document.getElementById('generated-code');
    if (!generatedCodeEl) return;
    const codeToShare = generatedCodeEl.textContent;
    navigator.clipboard.writeText(codeToShare).then(() => {
      alert('Code copied to clipboard: ' + codeToShare);
      if (shareExpired) shareExpired.style.display = 'block';
    }).catch(() => {
      alert('Failed to copy code.');
    });
  });
}

if (okCodeBtn) okCodeBtn.addEventListener('click', () => { if (codeModal) codeModal.style.display = 'none'; });
if (closeCodeBtn) closeCodeBtn.addEventListener('click', () => { if (codeModal) codeModal.style.display = 'none'; });

// ---------- Close modal when clicking outside ----------
window.addEventListener('click', (e) => {
  if (e.target === noteModal) noteModal.style.display = 'none';
  if (e.target === codeModal) codeModal.style.display = 'none';
});

// =======================
// Checkbox Toggling (optional, keep if needed)
// =======================
document.querySelectorAll('.activity-table td > div').forEach(checkbox => {
  checkbox.addEventListener('click', (e) => {
    const clickedCell = e.target.closest('td');
    const row = clickedCell.parentElement;
    row.querySelectorAll('div').forEach(box => box.classList.remove('checked'));
    e.target.classList.add('checked');
  });
});
