// Leave types data - stored in memory (no localStorage used)
leave_Types = []
async function getLeaveTypes(){
  const res = await fetch("/api/admin/getLeaveType")
  const json = await res.json()
  console.log(json)
  leaveTypes = json.lt
  renderLeaveTypes(json.lt)
}

getLeaveTypes()

let nextId = 5;

// DOM elements
const addLeaveTypeForm = document.getElementById("addLeaveTypeForm");
const leaveTypeNameInput = document.getElementById("leaveTypeName");
const leaveTypesListContainer = document.getElementById("leaveTypesList");
const alertContainer = document.getElementById("alertContainer");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");

// Show alert message
function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
  alertContainer.appendChild(alertDiv);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Render leave types list
function renderLeaveTypes() {
  if (leaveTypes.length === 0) {
    leaveTypesListContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No Leave Types Found</h3>
                        <p>There are currently no leave types configured in the system. Add a new leave type using the form above to get started.</p>
                    </div>
                `;
  } else {
    let html = "";
    leaveTypes.forEach((leaveType) => {
      html += `
                        <div class="leave-type-item">
                            <div>
                                <h6 class="leave-type-name">${leaveType.leave_type}</h6>
                                <small id="id" style="display:none" class="text-muted">ID: ${leaveType.id}</small>
                            </div>
                            <div class="leave-type-actions">
                                <button class="btn btn-sm btn-danger" onclick="deleteLeaveType(${leaveType.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    `;
    });
    leaveTypesListContainer.innerHTML = html;
  }
}

// Add new leave type
addLeaveTypeForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = leaveTypeNameInput.value.trim();

  if (!name) {
    leaveTypeNameInput.classList.add("is-invalid");
    return;
  }

  // Check for duplicate names
  // const isDuplicate = leaveTypes.some(
  //   (lt) => lt.name.toLowerCase() === name.toLowerCase()
  // );
  // if (isDuplicate) {
  //   showAlert("A leave type with this name already exists!", "danger");
  //   return;
  // }

  // Add new leave type
  const newLeaveType = {
    id: nextId++,
    name: name,
  };
  alert(name)
  await fetch(`/api/admin/addLeaveType?leave_type=${name}`); 
  leaveTypes.push(newLeaveType);

  // Clear form
  leaveTypeNameInput.value = "";
  leaveTypeNameInput.classList.remove("is-invalid");

  // Show success message
  showAlert(`Leave type "${name}" has been added successfully!`);
  leaveTypes.push(newLeaveType)
  // Re-render list
  window.location.reload()
  // renderLeaveTypes();
});

// Delete leave type
async function deleteLeaveType(id) {
  const leaveType = leaveTypes.find((lt) => lt.id == id);
  if (
    leaveType &&
    confirm(`Are you sure you want to delete "${id}"?`)
  ) {
    leaveTypes = leaveTypes.filter((lt) => lt.id !== id);
    showAlert(`Leave type "${leaveType.name}" has been deleted!`, "success");
    await fetch(`/api/admin/deleteLeaveType?leave_id=${id}`)
    renderLeaveTypes();
  }
}

// Remove validation styling when user starts typing
leaveTypeNameInput.addEventListener("input", function () {
  this.classList.remove("is-invalid");
});

// Initial render
renderLeaveTypes();

// To demonstrate empty state, uncomment the line below:
// leaveTypes = [];
// renderLeaveTypes();
