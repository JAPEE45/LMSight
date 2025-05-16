const approved_table = document.querySelector(".approved_table");
const rejected_table = document.querySelector(".rejected_table");
const pending_table = document.querySelector(".pending_table");

const approve_btn = document.querySelector(".approve-btn");
const pending_btn = document.querySelector(".pending-btn");
const reject_btn = document.querySelector(".reject-btn");

const applyLeaveCont = document.querySelector(".apply-leave-cont");
const tableContainer = document.querySelector(".table-cont");
const table_nav = document.querySelector(".table-nav");

const flipContainer = document.getElementById('flipContainer');
const flipContainer2 = document.getElementById('flipContainer2');
const edit_btn = document.getElementById("edit_btn");
const edit_modal = document.querySelector(".edit-modal");
const close_modal = document.getElementById("close-edit-modal");
const delete_modal = document.querySelector(".delete-modal");
const delete_btn = document.getElementById("delete_btn");

const delete_modal_btn = document.querySelectorAll(".delete-modal-btn");

const flipToBack = document.getElementById("flipToBack");
const flipToFront = document.getElementById("flipToFront");

const notif_btn = document.getElementById("notification-btn");
const notification_popup = document.querySelector(".notification-popup-cont");

notif_btn.addEventListener("click", (e) => {
  e.stopPropagation();
  notification_popup.classList.toggle("active");
});


flipToBack.addEventListener("click", () => {
    flipContainer2.classList.add("flipped");
});

flipToFront.addEventListener("click", () => {
    flipContainer2.classList.remove("flipped");
});

flipContainer.addEventListener('click', () => {
    flipContainer.classList.toggle('flipped');
  applyLeaveCont.classList.toggle("active");
  tableContainer.classList.toggle("active");
  table_nav.classList.toggle("active");
});


approve_btn.addEventListener("click", () => {
    approved_table.classList.add("active");
    rejected_table.classList.remove("active");
    pending_table.classList.remove("active");
})
pending_btn.addEventListener("click", () => {
    pending_table.classList.add("active");
    rejected_table.classList.remove("active");
    approved_table.classList.remove("active");
})
reject_btn.addEventListener("click", () => {
    rejected_table.classList.add("active");
    approved_table .classList.remove("active");
    pending_table.classList.remove("active");
})

edit_btn.addEventListener("click", () => {
    edit_modal.classList.add("active");
})

close_modal.addEventListener("click", () => {
    edit_modal.classList.remove("active");
})

delete_btn.addEventListener("click", () => {
    delete_modal.classList.add("active");
})

delete_modal_btn.forEach((button) => {
    button.addEventListener("click", () => {
        delete_modal.classList.remove("active");
    })
})

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  const timeString = `${hours}:${minutes}:${seconds}`;
  document.getElementById("clock").textContent = timeString;
}


window.addEventListener("click", (e) => {
  if (!notification_popup.contains(e.target) && e.target !== notif_btn) {
    notification_popup.classList.remove("active");
  }
});

updateClock();
setInterval(updateClock, 1000);

