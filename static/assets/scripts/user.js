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
  // Populate 7.A Certification (HR Data)
  document.getElementById("asOfDate").innerText = json.leave.hr_certification_as_of || json.leave.date_of_action || "";
  document.getElementById("total_earned_vl").innerText = json.leave.hr_total_earned_vl || "";
  document.getElementById("total_earned_sl").innerText = json.leave.hr_total_earned_sl || "";
  document.getElementById("less_this_application_vl").innerText = json.leave.hr_less_this_application_vl || "";
  document.getElementById("less_this_application_sl").innerText = json.leave.hr_less_this_application_sl || "";
  document.getElementById("balance_vl").innerText = json.leave.hr_balance_vl || "";
  document.getElementById("balance_sl").innerText = json.leave.hr_balance_sl || "";

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

// Date Validation
const startDateInput = document.getElementById("start_date");
const endDateInput = document.getElementById("end_date");

if (startDateInput && endDateInput) {
  startDateInput.addEventListener("change", function() {
    if (this.value) {
      endDateInput.min = this.value; // Prevent picking date before start
    }
    validateDates();
  });

  endDateInput.addEventListener("change", validateDates);

  function validateDates() {
    if (startDateInput.value && endDateInput.value) {
      if (endDateInput.value < startDateInput.value) {
        alert("End date cannot be earlier than start date.");
        endDateInput.value = "";
      }
    }
  }
}

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

// Trigger default filter
document.addEventListener("DOMContentLoaded", function() {
    const activeTab = document.querySelector(".filters.active");
    if (activeTab) {
        activeTab.click();
    }
});

async function downloadApplicationForm() {
    const id = localStorage.getItem("selected");
    if (!id) {
        alert("No leave selected.");
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Please allow popups to download the form.");
        return;
    }
    printWindow.document.write("Loading form data...");

    try {
        const response = await fetch(`/api/hr/leave?id=${id}`);
        const json = await response.json();
        const data = json.leave;

        // Helper for checkboxes
        const check = (type) => (data.leave_type && data.leave_type.toLowerCase().includes(type.toLowerCase())) ? "X" : "";
        const checkCommutation = (val) => (data.commutation && data.commutation.toLowerCase() === val.toLowerCase()) ? "X" : "";
        const checkRec = (val) => (data.recommendation_for && data.recommendation_for.toLowerCase() === val.toLowerCase()) ? "X" : "";

        const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CS Form No. 6 - ${data.fullname}</title>
    <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body { font-family: Arial, sans-serif; font-size: 10pt; margin: 0; padding: 20px; }
        .page-container { width: 210mm; margin: 0 auto; background: white; padding: 10mm; border: 1px solid #ccc; }
        h1, h2, h3, h4, p { margin: 0; padding: 0; }
        .text-center { text-align: center; }
        .text-bold { font-weight: bold; }
        .text-italic { font-style: italic; }
        .text-uppercase { text-transform: uppercase; }
        .text-small { font-size: 8pt; }
        .text-xs { font-size: 7pt; }
        .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); border: 2px solid black; }
        .cell { padding: 4px 6px; border-right: 1px solid black; border-bottom: 1px solid black; position: relative; min-height: 45px; display: flex; flex-direction: column; justify-content: space-between; }
        .no-right-border { border-right: none; }
        .no-bottom-border { border-bottom: none; }
        .thick-bottom { border-bottom: 2px solid black; }
        .col-12 { grid-column: span 12; } .col-8 { grid-column: span 8; } .col-7 { grid-column: span 7; } .col-6 { grid-column: span 6; } .col-5 { grid-column: span 5; } .col-4 { grid-column: span 4; } .col-3 { grid-column: span 3; }
        .input-area { font-weight: bold; font-size: 11pt; padding-top: 5px; white-space: nowrap; overflow: hidden; }
        .checkbox-group { display: flex; flex-direction: column; gap: 2px; }
        .checkbox-item { display: flex; align-items: flex-start; margin-bottom: 2px; }
        .box { width: 12px; height: 12px; border: 1px solid black; margin-right: 6px; margin-top: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; }
        .cb-label { font-size: 8pt; line-height: 1.1; }
        .header-logo-left { position: absolute; left: 20px; top: 10px; width: 60px; height: 60px; border: 1px dashed #999; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; text-align: center; }
        .stamp-box { position: absolute; right: 0; top: 10px; width: 100px; height: 50px; border: 1px solid transparent; font-size: 8pt; text-align: right; }
        .credits-table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9pt; }
        .credits-table th, .credits-table td { border: 1px solid black; text-align: center; padding: 2px; }
        @media print { body { padding: 0; } .page-container { border: none; width: 100%; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: right; margin-bottom: 10px;">
        <button onclick="window.print()">Print / Save as PDF</button>
    </div>
    <div class="page-container">
        <div class="header-section" style="position: relative; margin-bottom: 10px;">
            <div style="position: absolute; top: 0; right: 0; font-style: italic; font-weight: bold;">ANNEX A</div>
            <div style="font-size: 8pt; font-style: italic;">Civil Service Form No. 6<br>Revised 2020</div>
            <div class="text-center">
                <div class="text-small">Republic of the Philippines</div>
                <div class="text-bold text-uppercase">LOCAL GOVERNMENT UNIT OF VIRAC</div>
                <div class="text-small">VIRAC, CATANDUANES</div>
                <br>
                <h2 class="text-uppercase text-bold" style="text-decoration: underline;">APPLICATION FOR LEAVE</h2>
            </div>
        </div>

        <div class="form-grid">
            <div class="cell col-4">1. OFFICE/DEPARTMENT<div class="input-area">${data.department || ""}</div></div>
            <div class="cell col-8 no-right-border">2. NAME (Last, First, Middle)<div class="input-area">${data.fullname || ""}</div></div>

            <div class="cell col-3">3. DATE OF FILING<div class="input-area">${data.date_of_request || ""}</div></div>
            <div class="cell col-5">4. POSITION<div class="input-area">${data.job_title || ""}</div></div>
            <div class="cell col-4 no-right-border">5. SALARY<div class="input-area">${data.salary || ""}</div></div>

            <div class="cell col-12 text-center text-bold thick-bottom no-right-border" style="background:#ddd;">6. DETAILS OF APPLICATION</div>

            <div class="cell col-7 no-bottom-border">
                <div class="text-bold">6.A TYPE OF LEAVE TO BE AVAILED OF</div>
                <div class="checkbox-group" style="margin-top: 5px;">
                    <div class="checkbox-item"><div class="box">${check("vacation")}</div> <span class="cb-label">Vacation Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("mandatory")}</div> <span class="cb-label">Mandatory/Forced Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("sick")}</div> <span class="cb-label">Sick Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("maternity")}</div> <span class="cb-label">Maternity Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("paternity")}</div> <span class="cb-label">Paternity Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("special privilege")}</div> <span class="cb-label">Special Privilege Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("solo parent")}</div> <span class="cb-label">Solo Parent Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("study")}</div> <span class="cb-label">Study Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("vawc")}</div> <span class="cb-label">10-Day VAWC Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("rehabilitation")}</div> <span class="cb-label">Rehabilitation Privilege</span></div>
                    <div class="checkbox-item"><div class="box">${check("special leave benefits")}</div> <span class="cb-label">Special Leave Benefits for Women</span></div>
                    <div class="checkbox-item"><div class="box">${check("special emergency")}</div> <span class="cb-label">Special Emergency (Calamity) Leave</span></div>
                    <div class="checkbox-item"><div class="box">${check("adoption")}</div> <span class="cb-label">Adoption Leave</span></div>
                    <div class="checkbox-item"><div class="box">${(!["vacation", "mandatory", "sick", "maternity", "paternity", "special privilege", "solo parent", "study", "vawc", "rehabilitation", "special leave benefits", "special emergency", "adoption"].some(t => data.leave_type && data.leave_type.toLowerCase().includes(t))) && data.leave_type ? "X" : ""}</div> <span class="cb-label">Others: ${(!["vacation", "mandatory", "sick", "maternity", "paternity", "special privilege", "solo parent", "study", "vawc", "rehabilitation", "special leave benefits", "special emergency", "adoption"].some(t => data.leave_type && data.leave_type.toLowerCase().includes(t))) ? data.leave_type : ""}</span></div>
                </div>
            </div>

            <div class="cell col-5 no-right-border no-bottom-border">
                <div class="text-bold">6.B DETAILS OF LEAVE</div>
                <div style="margin-top: 5px; font-size: 9pt;">
                    ${data.leave_details || ""} <br> ${data.specify || ""}
                </div>
            </div>

            <div class="cell col-7 thick-bottom">
                <div class="text-bold">6.C NUMBER OF WORKING DAYS APPLIED FOR</div>
                <div class="input-area">${data.number_of_days_applied || ""}</div>
                <br>
                <div class="text-bold">INCLUSIVE DATES</div>
                <div class="input-area">${data.start_date || ""} to ${data.end_date || ""}</div>
            </div>

            <div class="cell col-5 no-right-border thick-bottom">
                <div class="text-bold">6.D COMMUTATION</div>
                <div class="checkbox-group" style="margin-top: 5px;">
                    <div class="checkbox-item"><div class="box">${checkCommutation("not requested")}</div> <span class="cb-label">Not Requested</span></div>
                    <div class="checkbox-item"><div class="box">${checkCommutation("requested")}</div> <span class="cb-label">Requested</span></div>
                </div>
            </div>

            <div class="cell col-12 text-center text-bold thick-bottom no-right-border" style="background:#ddd;">7. DETAILS OF ACTION ON APPLICATION</div>

            <div class="cell col-7 no-bottom-border">
                <div class="text-bold">7.A CERTIFICATION OF LEAVE CREDITS</div>
                <div class="text-center">As of ${data.hr_certification_as_of || ""}</div>
                <table class="credits-table">
                    <tr><th></th><th>Vacation Leave</th><th>Sick Leave</th></tr>
                    <tr><td>Total Earned</td><td>${data.hr_total_earned_vl || ""}</td><td>${data.hr_total_earned_sl || ""}</td></tr>
                    <tr><td>Less this application</td><td>${data.hr_less_this_application_vl || ""}</td><td>${data.hr_less_this_application_sl || ""}</td></tr>
                    <tr><td>Balance</td><td>${data.hr_balance_vl || ""}</td><td>${data.hr_balance_sl || ""}</td></tr>
                </table>
                <div class="text-center" style="margin-top: 20px;"><div style="border-top: 1px solid black; width: 80%; margin: 0 auto;">Authorized Officer</div></div>
            </div>

            <div class="cell col-5 no-right-border no-bottom-border">
                <div class="text-bold">7.B RECOMMENDATION</div>
                <div class="checkbox-group" style="margin-top: 10px;">
                    <div class="checkbox-item"><div class="box">${checkRec("approval")}</div> <span class="cb-label">For approval</span></div>
                    <div class="checkbox-item"><div class="box">${checkRec("disapproval")}</div> <span class="cb-label">For disapproval due to: ${data.recommendation_for_disapproval_due_to || ""}</span></div>
                </div>
                <div class="text-center" style="margin-top: 20px;"><div style="border-top: 1px solid black; width: 90%; margin: 0 auto;">Authorized Officer</div></div>
            </div>

            <div class="cell col-6 no-right-border">
                <div class="text-bold">7.C APPROVED FOR:</div>
                <div style="margin-top: 5px; font-size: 9pt; padding-left: 10px;">
                    ${data.approved_for || ""}
                </div>
            </div>

            <div class="cell col-6 no-right-border">
                <div class="text-bold">7.D DISAPPROVED DUE TO:</div>
                <div style="margin-top: 5px; font-size: 9pt; padding-left: 10px;">
                    ${data.disapproved_due_to || ""}
                </div>
            </div>

            <div class="cell col-12 text-center no-right-border" style="padding-top: 40px; border-bottom: none;">
                <div style="width: 40%; margin: 0 auto; border-top: 1px solid black; font-weight: bold;">Authorized Officer</div>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    } catch (error) {
        console.error("Error generating PDF:", error);
        if (printWindow) printWindow.close();
        alert("Failed to generate form.");
    }
}
