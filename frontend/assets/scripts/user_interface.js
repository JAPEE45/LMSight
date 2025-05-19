// === DOM Elements grouped by functionality ===

// Tables
const tables = {
  approved: document.querySelector(".approved_table"),
  rejected: document.querySelector(".rejected_table"),
  pending: document.querySelector(".pending_table"),
};

// Buttons
const buttons = {
  approve: document.querySelector(".approve-btn"),
  pending: document.querySelector(".pending-btn"),
  reject: document.querySelector(".reject-btn"),
  edit: document.getElementById("edit_btn"),
  delete: document.getElementById("delete_btn"),
  closeModal: document.getElementById("close-edit-modal"),
  flipBack: document.getElementById("flipToBack"),
  flipFront: document.getElementById("flipToFront"),
  notif: document.getElementById("notification-btn"),
  submitLeave: document.querySelector(".submit_leave"),
};

// Modals
const modals = {
  edit: document.querySelector(".edit-modal"),
  delete: document.querySelector(".delete-modal"),
};

// Containers
const containers = {
  applyLeave: document.querySelector(".apply-leave-cont"),
  table: document.querySelector(".table-cont"),
  nav: document.querySelector(".table-nav"),
  flip1: document.getElementById("flipContainer"),
  flip2: document.getElementById("flipContainer2"),
  notifPopup: document.querySelector(".notification-popup-cont"),
};

// Form checkbox
const omnibus_rules = document.getElementById("omnibus-rules");

// === Event Listeners ===

// Notification popup toggle
buttons.notif.addEventListener("click", (e) => {
  e.stopPropagation();
  containers.notifPopup.classList.toggle("active");
});

// Close popup on outside click
window.addEventListener("click", (e) => {
  if (!containers.notifPopup.contains(e.target) && e.target !== buttons.notif) {
    containers.notifPopup.classList.remove("active");
  }
});

// Flip animations
buttons.flipBack.addEventListener("click", () => containers.flip2.classList.add("flipped"));
buttons.flipFront.addEventListener("click", () => containers.flip2.classList.remove("flipped"));

containers.flip1.addEventListener("click", () => {
  containers.flip1.classList.toggle("flipped");
  containers.applyLeave.classList.toggle("active");
  containers.table.classList.toggle("active");
  containers.nav.classList.toggle("active");
});

// Toggle leave status tables
function toggleTable(type) {
  Object.entries(tables).forEach(([key, table]) => {
    table.classList.toggle("active", key === type);
  });
}

buttons.approve.addEventListener("click", () => toggleTable("approved"));
buttons.pending.addEventListener("click", () => toggleTable("pending"));
buttons.reject.addEventListener("click", () => toggleTable("rejected"));

// Edit modal logic
buttons.edit.addEventListener("click", () => modals.edit.classList.add("active"));
buttons.closeModal.addEventListener("click", () => modals.edit.classList.remove("active"));

// Delete modal logic
buttons.delete.addEventListener("click", () => modals.delete.classList.add("active"));
document.querySelectorAll(".delete-modal-btn").forEach((btn) =>
  btn.addEventListener("click", () => modals.delete.classList.remove("active"))
);

// Clock
function updateClock() {
  const now = new Date();
  const pad = (n) => (n < 10 ? "0" + n : n);
  const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById("clock").textContent = timeString;
}
updateClock();
setInterval(updateClock, 1000);

// Enable/disable leave submission based on checkbox
function updateSubmitLeaveState() {
  buttons.submitLeave.disabled = !omnibus_rules.checked;
}

omnibus_rules.addEventListener("change", updateSubmitLeaveState);

// Set initial state on page load
updateSubmitLeaveState();
