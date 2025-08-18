const view_apply_leave_header = document.getElementById("view-apply-leave-header");

const details_of_leave = document.getElementById("details-of-leave");
const specify_container = document.getElementById("specify-container");
const illness_p = document.querySelector(".illness-p");
const specify_input = document.getElementById("specify-input");
const specify_error = document.querySelector(".specify-error");

details_of_leave.addEventListener("change", () => {
  if (
      details_of_leave.value === "Within the Philippines" ||
      details_of_leave.value === "Abroad" ||
      details_of_leave.value === "In Hospital" ||
      details_of_leave.value === "Out Patient" ||
      details_of_leave.value === "Other Purpose"
     )
  {
    specify_container.classList.add("active");
  } else {
    specify_container.classList.remove("active");
  }

  details_of_leave.value === "Out Patient" ? illness_p.classList.add("active") : illness_p.classList.remove("active");   buttons.omnibusRules.classList.add("active");
});

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
  omnibusRules: document.getElementById("omnibus-rules")
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

containers.flip1.addEventListener("click", () => {
  containers.flip1.classList.toggle("flipped");
  containers.applyLeave.classList.toggle("active");
  containers.table.classList.toggle("active");
  containers.nav.classList.toggle("active");
  containers.flip1.classList.contains("flipped") ? view_apply_leave_header.textContent = "Apply Leave" : view_apply_leave_header.textContent = "Leave History";
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

function updateSubmitLeaveState() {
  buttons.submitLeave.disabled = !buttons.omnibusRules.checked;
}

buttons.omnibusRules.addEventListener("change", updateSubmitLeaveState);
buttons.submitLeave.addEventListener("click", () => {
  if (specify_container.classList.contains("active")) {
    specify_input.value.trim() === "" ? specify_error.classList.add("active") : specify_error.classList.remove("active");
  } else {
    alert("Leave Submitted");
    specify_error.classList.remove("active");
  }
})

updateSubmitLeaveState();
