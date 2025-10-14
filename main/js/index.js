// Get modal
const modal = document.getElementById("signupModal");

// Get signup button
const signupBtn = document.querySelector(".signup-btn a");

// Get close button
const closeBtn = document.querySelector(".modal .close");

// Open modal when clicking Sign Up
signupBtn.addEventListener("click", function(event) {
  event.preventDefault(); // stop link navigation
  modal.style.display = "flex";
});

// Close modal
closeBtn.addEventListener("click", function() {
  modal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
