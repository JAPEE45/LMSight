let selectedReasons = [];
let getData;

function getStringDate(...dates) {
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

  const dateStr = json.leave.date_of_request;
  const date = new Date(dateStr);

  const date_of_req = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const node = document.getElementById("leaveModal");
  document.getElementById("dateOfReqModal").textContent = date_of_req;
  document.getElementById("user_fullname").textContent = json.leave.fullname;
  document.getElementById("jobTitleModal").textContent = json.leave.job_title.toUpperCase();
  document.getElementById("salaryModal").textContent = json.leave.salary;
  document.getElementById("departmentModal").textContent = json.leave.department.toUpperCase();
  document.getElementById("leaveTypeModal").value = json.leave.leave_type;
  document.getElementById("detailsLeaveModal").value = `${json.leave.leave_details} - ${json.leave.specify}`;
  document.getElementById("commutationModal").value = json.leave.commutation;
  document.getElementById("numberOfDaysModal").value = json.leave.number_of_days_applied;
  document.getElementById("inclusiveDatesModal").value = getStringDate(json.leave.start_date, json.leave.end_date);
  document.getElementById("user_image").src = `${json.leave.picture}`;
  document.getElementById("creditModal").textContent = json.leave.credit.remaining;
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
      link.download = fileUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  console.log(node);
  const modal = new bootstrap.Modal(node);
  modal.show();
}

// Auto Computation Logic
const calcInputs = document.querySelectorAll('.calc-input');
calcInputs.forEach(input => {
    input.addEventListener('input', calculateBalances);
});

function calculateBalances() {
    const totalVl = parseFloat(document.getElementById('total_earned_vl').value) || 0;
    const lessVl = parseFloat(document.getElementById('less_this_application_vl').value) || 0;
    const balanceVl = totalVl - lessVl;
    document.getElementById('balance_vl').value = balanceVl.toFixed(2);

    const totalSl = parseFloat(document.getElementById('total_earned_sl').value) || 0;
    const lessSl = parseFloat(document.getElementById('less_this_application_sl').value) || 0;
    const balanceSl = totalSl - lessSl;
    document.getElementById('balance_sl').value = balanceSl.toFixed(2);
}

async function submitHRAction(actionType) {
  const modal = bootstrap.Modal.getInstance(document.getElementById("rejectionModal"));
  const id = localStorage.getItem("selected");
  const today = new Date().toISOString().split("T")[0];

  const formData = new FormData();
  formData.append('id', id);
  formData.append('actionOnLeave', actionType);
  formData.append('disapprovalReason1', ""); 
  formData.append('disapprovalReason2', "");
  formData.append('approved_disapproved_days', "");
  formData.append('date_of_action', getStringDate(today));

  // HR Certification Fields
  formData.append('hr_total_earned_vl', document.getElementById('total_earned_vl').value);
  formData.append('hr_total_earned_sl', document.getElementById('total_earned_sl').value);
  formData.append('hr_less_this_application_vl', document.getElementById('less_this_application_vl').value);
  formData.append('hr_less_this_application_sl', document.getElementById('less_this_application_sl').value);
  formData.append('hr_balance_vl', document.getElementById('balance_vl').value);
  formData.append('hr_balance_sl', document.getElementById('balance_sl').value);

  const d = await fetch(`/api/hr/action`, {
    method: "POST",
    body: formData
  });

  const status = await d.json();
  if (status.status) {
    modal.hide();
    window.location.reload();
    return;
  }
  alert("Action failed: " + status.msg);
}

const rejectionModal = document.getElementById("rejectionModal");

rejectionModal.addEventListener("hidden.bs.modal", () => {
  getData = null;
  rejectionModal.querySelectorAll('input').forEach((el) => {
      el.value = "";
  });
  rejectionModal.querySelectorAll("td[id], span[id]").forEach((el) => (el.textContent = ""));
});

function showRejectionModal() {
  const leaveModal = bootstrap.Modal.getInstance(document.getElementById("leaveModal"));
  leaveModal.hide();

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("asOfDate").innerText = getStringDate(today);

  setTimeout(() => {
    const rejectionModal = new bootstrap.Modal(document.getElementById("rejectionModal"));
    rejectionModal.show();
  }, 300);
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function formatShortDate(dateString) {
  const date = new Date(dateString);
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const yy = String(date.getFullYear()).slice(-2);
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
                      ${e.users__firstname} ${e.users__middlename} ${e.users__lastname}
                    </a>
                  </div>
                </td>
                <td>${formatShortDate(e.createdAt)}</td>
                <td>${e.start_date}</td>
                <td>${e.end_date}</td>
                <td>${e.leave_type}</td>
                <td>
                  <button class="btn btn-view-details" onclick="showLeaveModal(${e.id})">
                    <i class="fas fa-eye me-1"></i>View Details
                  </button>
                </td>`;
    resultContainer.appendChild(node);
  });
}