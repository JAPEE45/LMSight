const main_title = document.querySelector(".main-title");

const approved_table = document.querySelector(".approved_table");
const rejected_table = document.querySelector(".rejected_table");
const pending_table = document.querySelector(".pending_table");

const approve_btn = document.querySelector(".approve-btn");
const pending_btn = document.querySelector(".pending-btn");
const reject_btn = document.querySelector(".reject-btn");

const edit_btn = document.getElementById("edit_btn");
const edit_modal = document.querySelector(".edit-modal");
const close_modal = document.getElementById("close-edit-modal");

const view_analytics_dets = document.querySelectorAll(".view-analytics-dets");
const analytics_modal = document.querySelector(".analytics-modal");
const close_analytic_modal_btn = document.querySelector(".close-analytic-modal");

const show_more_btn = document.querySelector(".show-more-btn");
const employee_most_leave_modal = document.querySelector(".employee-most-leave-modal");
const employee_most_leave_close_btn = document.querySelector(".employee-most-leave-close-btn");

const dashboard_nav = document.getElementById("dashboard_nav");
const analytics_nav = document.getElementById("analytics_nav");
const manage_users_nav = document.getElementById("manage_users_nav");
const attendance_maintenance_nav = document.getElementById("attendance_maintenance_nav");

const dashboard_btn = document.querySelector("#dashboard_nav i");
const analytics_btn = document.querySelector("#analytics_nav i");
const manage_users_btn = document.querySelector("#manage_users_nav i");

const dashboard_page = document.querySelector(".dashboard");
const analytics_page = document.querySelector(".analytics");
const manage_users_page = document.querySelector(".manage-users");
const attendance_maintenance_page = document.querySelector(".attendance-management");

const emp_id_cont = document.getElementById("emp-id-cont");
const save_user_btn = document.getElementById("save-user-btn");
const show_saved = document.querySelector(".show-saved");
const show_not_saved = document.querySelector(".show-not-saved");
const add_user_btn = document.getElementById("add-user-btn");
const manage_user_table = document.querySelector(".bottom-section-attendance .table-container");
const add_edit_user_cont = document.querySelector(".add-edit-user-cont");
const flipContainer3 = document.getElementById('flip-container3');
const cancelBtn = document.getElementById('cancel-user-btn');

const submit_leave = document.querySelector(".submit_leave.reject");
const approve_leave = document.querySelector(".submit_leave.approve");
const cancel_reject_btn = document.getElementById("cancel_reject_btn");
const submit_reject_btn = document.getElementById("submit_reject_btn");
const rejection_reason_modal = document.querySelector(".rejection-reason-modal");

const checkboxes = document.querySelectorAll('.user-checkbox');
const delete_select_cont = document.querySelector('.delete-select-cont');
const select_all_chbx = document.querySelector('.select-all');

const edit_delete_btn = document.querySelectorAll(".edit_delete_btn");
const options = document.querySelectorAll(".options");
const edit_user_btn = document.querySelectorAll(".edit_user_btn");

const notifPopup = document.querySelector(".notification-popup-cont");
const notif = document.getElementById("notification-btn");

edit_btn.addEventListener("click", () => {
  toggleModal(edit_modal);
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

function toggleActiveClass(elements, target) {
  if (target) target.classList.add("active");
}

function setNavigation(activeBtn, activePage) {
  toggleActiveClass([dashboard_btn, analytics_btn, manage_users_btn], activeBtn);
  toggleActiveClass([dashboard_page, analytics_page, manage_users_page], activePage);
}

function toggleModal(modal, show = true) {
  modal.classList.toggle("active", show);
}

function toggleTables(activeTable) {
  toggleActiveClass([approved_table, pending_table, rejected_table], activeTable);
}

dashboard_nav.addEventListener("click", () => setNavigation(dashboard_btn, dashboard_page));


checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    const anyChecked = [...checkboxes].some(c => c.checked);
    delete_select_cont.classList.toggle('active', anyChecked);
  });
});

edit_delete_btn.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const option = btn.nextElementSibling;
    const isActive = option.classList.contains("active");
    options.forEach(opt => opt.classList.remove("active"));
    if (!isActive) option.classList.add("active");
  });
});
document.addEventListener("click", () => options.forEach(opt => opt.classList.remove("active")));

[...edit_user_btn].forEach(btn => {
  btn.addEventListener("click", () => {
    emp_id_cont.classList.add("active");
    add_edit_user_cont.classList.add("active");
    manage_user_table.classList.remove("active");
    flipContainer3.classList.add("flipped");
    delete_select_cont.classList.remove("active");
  });
});
