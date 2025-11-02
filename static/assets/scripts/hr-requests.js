let selectedReasons = [];
let getData;

function getStringDate(...dates) {
  // dates can be passed as arguments: getStringDate("2025-09-29", "2025-09-30", "2025-10-01")

  const formatted = dates.map((dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  return formatted.join(", ");
}

function storeID(id) {
  console.log(id);
  localStorage.setItem("selected", id);
}

async function showLeaveModal(id) {
  const data = await fetch(`/api/hr/leave?id=${id}`);
  const json = await data.json();
  console.log(json);
  getData = json;
  console.log("get data: ",getData);

  const dateStr = json.leave.date_of_request;
  const date = new Date(dateStr);

  const date_of_req = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format inclusive date

  const node = document.getElementById("leaveModal");
  document.getElementById("dateOfReqModal").textContent = date_of_req;
  document.getElementById("user_fullname").textContent = json.leave.fullname;
  document.getElementById("jobTitleModal").textContent =
    json.leave.job_title.toUpperCase();
  document.getElementById("salaryModal").textContent =
    json.leave.salary;
  document.getElementById("departmentModal").textContent =
    json.leave.department.toUpperCase();
  document.getElementById("leaveTypeModal").value = json.leave.leave_type;
  document.getElementById(
    "detailsLeaveModal"
  ).value = `${json.leave.leave_details} - ${json.leave.specify}`;
  document.getElementById("commutationModal").value = json.leave.commutation;
  document.getElementById("numberOfDaysModal").value =
    json.leave.number_of_days_applied;
  document.getElementById("inclusiveDatesModal").value = getStringDate(
    json.leave.start_date,
    json.leave.end_date
  );
  document.getElementById("user_image").src = `${json.leave.picture}`;
  document.getElementById("creditModal").textContent =
    json.leave.credit.remaining;
  localStorage.setItem("selected", id);

  if (document.getElementById("leaveTypeModal").value === "Sick Leave") {
    document.getElementById("attachedDocCont").style.display = "block";
  } else {
    document.getElementById("attachedDocCont").style.display = "none";
  }

  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.onclick = function () {
      const fileUrl = window.location.origin + json.leave.attached_file;
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileUrl.split("/").pop(); // extract filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  console.log(node);
  const modal = new bootstrap.Modal(node);

  modal.show();
}

document.getElementById("actionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("leaveModal")
  );

  const id = localStorage.getItem("selected");
  const action = document.querySelector("input[name='actionOnLeave']:checked").value;

  const disapprovalReason1 = document.getElementById("disapprovalReason1").value;
  const disapprovalReason2 = document.getElementById("disapprovalReason2").value;

  const approvedForDaysWithPay = document.getElementById("approvedForDaysWithPay");
  const approvedForDaysWithoutPay = document.getElementById("approvedForDaysWithoutPay");
  const approvedForOthers = document.getElementById("approvedForOthers");

  let string = "";

  if (approvedForDaysWithPay.value.trim() != "") string = `${approvedForDaysWithPay.value} day/s with pay`
  if (approvedForDaysWithoutPay.value.trim() != "") string = `${approvedForDaysWithoutPay.value} days without pay`
  if (approvedForOthers.value.trim() != "") string = approvedForOthers.value
  
  const today = new Date().toISOString().split("T")[0];
  
  const formData = new FormData();
  formData.append('id', id)
  formData.append('actionOnLeave', action);
  formData.append('disapprovalReason1', disapprovalReason1.trim());
  formData.append('disapprovalReason2', disapprovalReason2.trim());
  formData.append('approved_disapproved_days', string);
  formData.append('date_of_action', getStringDate(today));


  const d = await fetch(`/api/hr/action`, {
    method: "POST",
    body: formData
  });

  const status = await d.json();
  console.log("json status: ", status.status)
  if (status.status) {
    const action = document.querySelector(
      'input[name="actionOnLeave"]:checked'
    ).value;
    const detailsOfAction = {
      asOfDate: document.getElementById("asOfDate").innerText,
      totalEarnedVl: document
        .getElementById("total_earned_vl")
        .innerText.trim(),
      totalEarnedSl: document
        .getElementById("total_earned_sl")
        .innerText.trim(),
      lessThisApplicationVl: document
        .getElementById("less_this_application_vl")
        .innerText.trim(),
      lessThisApplicationSl: document
        .getElementById("less_this_application_sl")
        .innerText.trim(),
      balanceVl: document.getElementById("balance_vl").innerText.trim(),
      balanceSl: document.getElementById("balance_sl").innerText.trim(),

      leaveAction: action,
      disapprovalReason: document.getElementById("disapprovalReason1").value,

      approvedForDaysWithPay: document.getElementById("approvedForDaysWithPay")
        .value,
      approvedForDaysWithoutPay: document.getElementById(
        "approvedForDaysWithoutPay"
      ).value,
      approvedForOthers: document.getElementById("approvedForOthers").value,
      disapprovalReason2: document.getElementById("disapprovalReason2").value,
    };

    downloadPDF(detailsOfAction);
    modal.hide();
    window.location.reload();
    return;
  }
  alert("Fail to approve");
  alert(status.message);
});


const rejectionModal = document.getElementById("rejectionModal");

rejectionModal.addEventListener("hidden.bs.modal", () => {
  getData = null;
  rejectionModal
    .querySelectorAll('input[type="text"], input[type="radio"], textarea')
    .forEach((el) => {
      if (el.type === "radio") {
        el.checked = false;
      } else {
        el.value = "";
      }
    });

  rejectionModal
    .querySelectorAll("td[id], span[id]")
    .forEach((el) => (el.textContent = ""));
});

// async function hideRejectionModal() {
//   const modal = bootstrap.Modal.getInstance(
//     document.getElementById("rejectionModal")
//   );
//   const id = localStorage.getItem("selected");
//   const d = await fetch(`/api/hr/reject?id=${id}`, {
//     method: "GET",
//   });
//   const status = await d.json();
//   if (status.status) {
//     modal.hide();
//     window.location.reload();
//     return;
//   }

//   alert(status.message);
// }

function showRejectionModal() {
  const leaveModal = bootstrap.Modal.getInstance(
    document.getElementById("leaveModal")
  );
  leaveModal.hide();

  const today = new Date().toISOString().split("T")[0];

  document.getElementById("asOfDate").innerText = getStringDate(today);

  setTimeout(() => {
    const rejectionModal = new bootstrap.Modal(
      document.getElementById("rejectionModal")
    );
    rejectionModal.show();
  }, 300);
  const approved = document.getElementById("approved");
  const disapproved = document.getElementById("disapproved");
  const disapprovalReason1 = document.getElementById("disapprovalReason1");

  // Function to toggle textarea
  function toggleReason() {
    if (disapproved.checked) {
      disapprovalReason1.disabled = false; // enable
    } else {
      disapprovalReason1.disabled = true; // disable
      disapprovalReason1.value = ""; // optional: clear text
    }
  }

  // Run once immediately
  toggleReason();

  // Remove any existing listeners before adding new ones
  approved.onchange = toggleReason;
  disapproved.onchange = toggleReason;
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
function selectReason(button) {
  const reason = button.textContent;

  if (button.classList.contains("active")) {
    button.classList.remove("active");
    selectedReasons = selectedReasons.filter((r) => r !== reason);
  } else {
    button.classList.add("active");
    selectedReasons.push(reason);
  }
}
function formatShortDate(dateString) {
  const date = new Date(dateString);
  const mm = date.getMonth() + 1; // months are 0-based
  const dd = date.getDate();
  const yy = String(date.getFullYear()).slice(-2); // last 2 digits of year

  return `${mm}/${dd}/${yy}`;
}

const resultContainer = document.getElementById("resultContainer");
function showResult(data) {
  resultContainer.innerHTML = "";
  data.request.forEach((e) => {
    const node = document.createElement("tr");
    node.innerHTML = `<td>
                  <div class="employee-info">
                    <div class="employee-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <a href="./emp_profile.html">
                      ${e.users__firstname} ${e.users__middlename} ${
      e.users__lastname
    }
                    </a>
                  </div>
                </td>
                <td>${formatShortDate(e.createdAt)}</td>
                <td>${e.start_date}</td>
                <td>${e.end_date}</td>
                <td>${e.leave_type}</td>
      
                <td>
                  <button
                    class="btn btn-view-details"
                    onclick="showLeaveModal(${e.id})"
                  >
                    <i class="fas fa-eye me-1"></i>View Details
                  </button>
                </td>`;
    resultContainer.appendChild(node);
  });
}

function downloadPDF(details) {
  console.log("Details: ", details);
  const {
    asOfDate,
    totalEarnedVl,
    totalEarnedSl,
    lessThisApplicationVl,
    lessThisApplicationSl,
    balanceVl,
    balanceSl,
    leaveAction,
    disapprovalReason,
    approvedForDaysWithPay,
    approvedForDaysWithoutPay,
    approvedForOthers,
    disapprovalReason2,
  } = details;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Utility for justified text with auto height
  function addParagraph(text, x, y, width) {
    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, x, y, { align: "justify" });
    return lines.length * 5; // line height ~5mm
  }

  // === HEADER ===
  doc.setFont("helvetica", "normal").setFontSize(8);
  doc.text("Civil Service Form No. 6 (Revised 2020)", margin, yPosition); // left side
  doc.text("ANNEX A", pageWidth - margin, yPosition, { align: "right" }); // right side
  yPosition += 8;

  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.text("Republic of the Philippines", pageWidth / 2, yPosition, {
    align: "center",
  });
  doc.text("LOCAL GOVERNMENT UNIT OF VIRAC", pageWidth / 2, yPosition + 6, {
    align: "center",
  });
  doc.text("VIRAC - CATANDUANES", pageWidth / 2, yPosition + 12, {
    align: "center",
  });
  yPosition += 24;

  // === TITLE ===
  doc.setFontSize(13);
  doc.text("APPLICATION FOR LEAVE", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  // === EMPLOYEE INFO ===
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(
    `1. OFFICE/DEPARTMENT: ${getData.leave.department}`,
    margin,
    yPosition
  );
  doc.text(`2. NAME: ${getData.leave.fullname}`, pageWidth / 2, yPosition);
  yPosition += 6;

  doc.text(
    `3. DATE OF FILING: ${getData.leave.date_of_request}`,
    margin,
    yPosition
  );
  doc.text(
    `4. POSITION: ${getData.leave.job_title || ""}`,
    pageWidth / 2,
    yPosition
  );
  yPosition += 6;

  doc.text(`5. SALARY: ${getData.leave.salary || ""}`, margin, yPosition);
  yPosition += 10;

  // === DETAILS OF APPLICATION ===
  doc.setFont("helvetica", "bold");
  doc.text("6. DETAILS OF APPLICATION", margin, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "normal");
  doc.text(
    `6.A TYPE OF LEAVE TO BE AVAILED OF: ${getData.leave.leave_type}`,
    margin,
    yPosition
  );
  yPosition += 7;

  doc.text(
    `6.B DETAILS OF LEAVE: ${getData.leave.leave_details} - ${getData.leave.specify}`,
    margin,
    yPosition
  );
  yPosition += 7;

  doc.text(
    `6.C NUMBER OF WORKING DAYS APPLIED FOR: ${getData.leave.number_of_days_applied}`,
    margin,
    yPosition
  );
  yPosition += 7;
  doc.text(
    `INCLUSIVE DATES: ${getStringDate(
      getData.leave.start_date,
      getData.leave.end_date
    )}`,
    margin,
    yPosition
  );
  yPosition += 7;

  doc.text(`6.D COMMUTATION: ${getData.leave.commutation}`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.text("_________________________", margin, yPosition);
  doc.text("Signature of Applicant", margin, yPosition + 5);
  yPosition += 20;

  // === DETAILS OF ACTION ===
  doc.setFont("helvetica", "bold");
  doc.text("7. DETAILS OF ACTION ON APPLICATION", margin, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "normal");
  const today = new Date().toISOString().split("T")[0];
  doc.text(`7.A CERTIFICATION OF LEAVE CREDITS`, margin, yPosition);
  yPosition += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`(As of ${getStringDate(today)})`, margin + 63, yPosition);
  yPosition += 5;

  // Table
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Vacation Leave", margin + 70, yPosition);
  doc.text("Sick Leave", margin + 120, yPosition);
  yPosition += 5;

  doc.text("Total Earned", margin, yPosition);
  doc.text(String(totalEarnedVl), margin + 80, yPosition);
  doc.text(String(totalEarnedSl), margin + 130, yPosition);
  yPosition += 5;

  doc.text("Less this application", margin, yPosition);
  doc.text(
    String(lessThisApplicationVl),
    margin + 80,
    yPosition
  );
  doc.text(
    String(lessThisApplicationSl),
    margin + 130,
    yPosition
  );
  yPosition += 5;

  doc.text("Balance", margin, yPosition);
  doc.text(String(balanceVl), margin + 80, yPosition);
  doc.text(String(balanceSl), margin + 130, yPosition);
  yPosition += 12;

  doc.setFontSize(10);
  doc.text("_________________________", margin, yPosition);
  doc.text("Authorized Officer", margin, yPosition + 5);
  yPosition += 15;

  // === RECOMMENDATION ===
  const recommendation = document.querySelector(
    'input[name="actionOnLeave"]:checked'
  );

  let recommendationText = "";
  if (recommendation) {
    if (recommendation.id === "approved") {
      recommendationText = "approval";
    } else if (recommendation.id === "disapproved") {
      recommendationText = "disapproval due to:";
    }
  }

  // get textarea value directly by id
  // === RECOMMENDATION ===
  // const recommendation = document.querySelector(
  //   'input[name="actionOnLeave"]:checked'
  // );
  // const recommendationText = recommendation
  //   ? recommendation.id === "approved"
  //     ? "approval"
  //     : "disapproval"
  //   : "";

  const disapprovalReasons = document.getElementById("disapprovalReason1").value;

  doc.text("7.B RECOMMENDATION", margin, yPosition);
  yPosition += 7;

  if (recommendationText) {
    doc.text(`For ${recommendationText}`, margin, yPosition);
    yPosition += 6;

    if (
      recommendationText === "disapproval due to:" &&
      disapprovalReasons.trim() !== ""
    ) {
      yPosition += addParagraph(
        disapprovalReason,
        margin + 8,
        yPosition,
        pageWidth - 2 * margin
      );
    }
    console.log(disapprovalReason);
  } else {
    doc.text("For approval", margin + 8, yPosition);
    yPosition += 5;
    doc.text("For disapproval due to:", margin + 8, yPosition);
    yPosition += 7;
  }

  doc.text("_________________________", margin, yPosition + 5);
  doc.text("Authorized Officer", margin, yPosition + 10);
  yPosition += 15;

  // === APPROVAL/DISAPPROVAL ===
  doc.text("7.C APPROVED FOR:", margin, yPosition + 5);
  doc.text("7.D DISAPPROVED DUE TO:", pageWidth / 2, yPosition + 5);
  yPosition += 10;

  const approvalLines = [];

  if (approvedForDaysWithPay.trim()) {
    approvalLines.push(
      `${approvedForDaysWithPay} days with pay`
    );
  }
  if (approvedForDaysWithoutPay.trim()) {
    approvalLines.push(
      `${approvedForDaysWithoutPay} days without pay`
    );
  }
  if (approvedForOthers.trim()) {
    approvalLines.push(`${approvedForOthers} others (specify)`);
  }

  doc.text(`${disapprovalReason2}`, pageWidth / 2, yPosition, {
    maxWidth: pageWidth / 2 - margin,
  });

  if (approvalLines.length > 0) {
    doc.text(approvalLines, margin, yPosition);
  }

  yPosition += 20;

  doc.text("Authorized Officer", margin, yPosition + 5);
  doc.text("Authorized Officer", pageWidth / 2, yPosition + 5);
  doc.text("_________________________", margin, yPosition);
  doc.text("_________________________", pageWidth / 2, yPosition);

  doc.save(
    `Leave_Application_${getData.leave.fullname.replace(/\s+/g, "_")}.pdf`
  );
}

const textareas = document.querySelectorAll(".reasons-disapproval");
const maxWords = 20;

textareas.forEach((textarea) => {
  textarea.addEventListener("input", () => {
    let words = textarea.value.trim().split(/\s+/);
    if (words[0] === "") words = [];

    if (words.length > maxWords) {
      textarea.value = words.slice(0, maxWords).join(" ");
    }
  });
});
