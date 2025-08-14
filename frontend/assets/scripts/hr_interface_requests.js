const edit_btn = document.querySelectorAll(".details-btn");
const edit_modal = document.querySelector(".edit-modal");
const close_modal = document.getElementById("close-edit-modal");

const submit_leave = document.querySelector(".submit_leave.reject");
const approve_leave = document.querySelector(".submit_leave.approve");
const cancel_reject_btn = document.getElementById("cancel_reject_btn");
const submit_reject_btn = document.getElementById("submit_reject_btn");
const rejection_reason_modal = document.querySelector(".rejection-reason-modal");

const notifPopup = document.querySelector(".notification-popup-cont");
const notif = document.getElementById("notification-btn");

edit_btn.forEach(btn => {
  btn.addEventListener("click", () => {
    toggleModal(edit_modal);
  });
});

close_modal.addEventListener("click" , () => {
  toggleModal(edit_modal, false);
});

submit_leave.addEventListener("click", () => {
  toggleModal(rejection_reason_modal);
});

submit_reject_btn.addEventListener("click", () => {
  toggleModal(edit_modal, false);
  toggleModal(rejection_reason_modal, false);
})

cancel_reject_btn.addEventListener("click", () => {
  toggleModal(rejection_reason_modal, false);
})

approve_leave.addEventListener("click", () => {
  toggleModal(edit_modal, false);
});

notif.addEventListener("click", (e) => {
  e.stopPropagation()
  notifPopup.classList.toggle("active");
})

window.addEventListener("click", (e) => {
  if (!notifPopup.contains(e.target) && e.target !== notif) {
    notifPopup.classList.remove("active");
  }
});

function toggleModal(modal, show = true) {
  modal.classList.toggle("active", show);
}

 function downloadReport(filename) {
  const link = document.createElement('a');
  link.href = `/path/to/reports/${filename}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}