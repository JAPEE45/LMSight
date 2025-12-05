// Apply Leave and Back to Table functionality
const applyLeaveBtn = document.querySelectorAll(".applyLeaveBtn");
const dashboardSection = document.getElementById("dashboardSection");
const applyLeaveSection = document.getElementById("applyLeaveSection");
const attached_file = document.getElementById("attached-file");

async function clicked(id){
  alert(id)
  const d = await fetch(`/api/user/delete?id=${id}`)
  const c = await d.json()
  if(c.status){
    alert("Deleted!")
    window.location.reload()
    return 
  }
}

async function showLeaveModal(id) {
  const data = await fetch(`/api/hr/leave?id=${id}`);
  const json = await data.json();
  console.log(json);

  // const dateStr = json.leave.date_of_request;
  // const date = new Date(dateStr);

  // const date_of_req = date.toLocaleDateString("en-US", {
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // });

  // Format inclusive date
  const recommendationAction = json.leave.recommendation_for;

  const node = document.getElementById("leaveModal");
  document.getElementById("asOfDate").innerText = json.leave.date_of_action;
  const radio = document.querySelector(`input[name='actionOnLeave'][value='${recommendationAction}']`)
  if (radio) radio.checked = true;
  document.getElementById("disapprovalReason1").value = json.leave.recommendation_for_disapproval_due_to
  document.getElementById("approvedDays").value = json.leave.approved_for;
  document.getElementById("disapprovalReason2").value = json.leave.disapproved_due_to;

  localStorage.setItem("selected", id);

  console.log(node);
  const modal = new bootstrap.Modal(node);

  modal.show();
}


applyLeaveBtn.forEach((btn) => btn.addEventListener("click", function () {
  dashboardSection.classList.add("hidden");
  applyLeaveSection.classList.remove("hidden");
  applyLeaveSection.classList.add("show");
  applyLeaveBtn.forEach((btn) => btn.classList.add("active"));
  document.getElementById("dashboard_nav").classList.remove("active");
}));

// Filter tabs functionality
document.querySelectorAll(".filters").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Remove active class from all tabs
    document
      .querySelectorAll(".filters")
      .forEach((t) => t.classList.remove("active"));

    // Add active class to clicked tab
    this.classList.add("active");

    // Get filter value
    const filterValue = this.getAttribute("data-filter");

    // Show/hide rows based on filter
    document.querySelectorAll("#leaveTableBody tr").forEach((row) => {
      const rowStatus = row.getAttribute("data-status");
      if (rowStatus === filterValue) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
});

document
  .getElementById("pendingRequests")
  .addEventListener("click", function () {
    document.querySelectorAll(".filter-tab").forEach((row) => {
      row.classList.remove("active");
    });
    document.getElementById("pending").classList.add("active");
  });

// Form validation and submission
const applyLeaveForm = document.getElementById("applyLeaveForm");
const agreeTermsCheckbox = document.getElementById("agreeTerms");
const submitBtn = document.getElementById("submitBtn");

// Enable/disable submit button based on checkbox
agreeTermsCheckbox.addEventListener("change", function () {
  submitBtn.disabled = !this.checked;
});

// // Date validation - end date should be after start date
// const startDateInput = document.querySelector(
//   'input[type="date"]:first-of-type'
// );
// const endDateInput = document.querySelector('input[type="date"]:last-of-type');

// startDateInput.addEventListener("change", function () {
//   endDateInput.min = this.value;
//   if (endDateInput.value && endDateInput.value < this.value) {
//     endDateInput.value = this.value;
//   }
// });

// endDateInput.addEventListener("change", function () {
//   if (startDateInput.value && this.value < startDateInput.value) {
//     alert("End date cannot be before start date");
//     this.value = startDateInput.value;
//   }
// });


// const today = new Date().toISOString().split("T")[0];
// startDateInput.min = today;
// endDateInput.min = today;

let currentDetails = []
async function getLeaveTypeDetails(id){
    const r = await fetch(`/api/user/getDetails?id=${id}`)
    const j =  await r.json()
    currentDetails = j
    currentDetails.dt.forEach(e=>{
    const node = document.createElement("option")
    node.value = e.id
    node.textContent = e.details
    details.appendChild(node)
  })
}
const details = document.getElementById("details")
document.getElementById("leave_type").addEventListener("change",(e)=>{
  details.innerHTML = "<option selected disabled>-- Select Details--</option>"
  getLeaveTypeDetails(e.target.value)
  console.log(document.getElementById("leave_type").value)
  if (document.getElementById("leave_type").value === "19") {
    console.log("low")
    attached_file.style.display = "block";
  } else {
    attached_file.style.display = "none";
  }
 
})
details.addEventListener("change", function () {
  document.getElementById("specify-input").value = "";
  if (details.value == "3") {
    
    document.querySelector(".specify-cont").classList.remove("show");
  }
  else {
    document.querySelector(".specify-cont").classList.add("show");
  }
  console.log(details.value);
});
