const tables = {
  approved: document.querySelector(".approved_table"),
  rejected: document.querySelector(".rejected_table"),
  pending: document.querySelector(".pending_table"),
};

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

const modals = {
  edit: document.querySelector(".edit-modal"),
  delete: document.querySelector(".delete-modal"),
};

const containers = {
  applyLeave: document.querySelector(".apply-leave-cont"),
  table: document.querySelector(".table-cont"),
  nav: document.querySelector(".table-nav"),
  flip1: document.getElementById("flipContainer"),
  flip2: document.getElementById("flipContainer2"),
  notifPopup: document.querySelector(".notification-popup-cont"),
};

const omnibus_rules = document.getElementById("omnibus-rules");


buttons.notif.addEventListener("click", (e) => {
  e.stopPropagation();
  containers.notifPopup.classList.toggle("active");
  console.log("hi")
});

window.addEventListener("click", (e) => {
  if (!containers.notifPopup.contains(e.target) && e.target !== buttons.notif) {
    containers.notifPopup.classList.remove("active");
  }
});

buttons.flipBack.addEventListener("click", () => containers.flip2.classList.add("flipped"));
buttons.flipFront.addEventListener("click", () => containers.flip2.classList.remove("flipped"));

containers.flip1.addEventListener("click", () => {
  containers.flip1.classList.toggle("flipped");
  containers.applyLeave.classList.toggle("active");
  containers.table.classList.toggle("active");
  containers.nav.classList.toggle("active");
});

function toggleTable(type) {
  Object.entries(tables).forEach(([key, table]) => {
    table.classList.toggle("active", key === type);
  });
}

buttons.approve.addEventListener("click", () => toggleTable("approved"));
buttons.pending.addEventListener("click", () => toggleTable("pending"));
buttons.reject.addEventListener("click", () => toggleTable("rejected"));

buttons.edit.addEventListener("click", () => modals.edit.classList.add("active"));
buttons.closeModal.addEventListener("click", () => modals.edit.classList.remove("active"));


buttons.delete.addEventListener("click", () => modals.delete.classList.add("active"));
document.querySelectorAll(".delete-modal-btn").forEach((btn) =>
  btn.addEventListener("click", () => modals.delete.classList.remove("active"))
);

function updateClock() {
  const now = new Date();
  const pad = (n) => (n < 10 ? "0" + n : n);
  const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById("clock").textContent = timeString;
}
updateClock();
setInterval(updateClock, 1000);


function updateSubmitLeaveState() {
  buttons.submitLeave.disabled = !omnibus_rules.checked;
}

omnibus_rules.addEventListener("change", updateSubmitLeaveState);

updateSubmitLeaveState();
