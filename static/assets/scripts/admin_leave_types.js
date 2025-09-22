// Store leave types in memory
let leaves = [];

async function getLeaveTypes(){
  const res = await fetch("/api/admin/getLeaveType")
  const json = await res.json()
  console.log(json)
  leaveTypes = json.lt
  updateLeaveTypesList(json.lt)
}

// Add new input row for leave details
function addInputRow() {
  const additionalInputs = document.getElementById("additionalInputs");
  const newRow = document.createElement("div");
  newRow.className = "input-row";
  newRow.innerHTML = `
                <input type="text" class="details-input" placeholder="Enter details of leave..." name="leaveDetails">
                <button type="button" class="remove-input" onclick="removeInputRow(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
  additionalInputs.appendChild(newRow);
}

// Remove input row
function removeInputRow(button) {
  const row = button.parentElement;
  row.style.animation = "slideOut 0.3s ease";
  setTimeout(() => {
    row.remove();
  }, 300);
}

// Add slideOut animation
const style = document.createElement("style");
style.textContent = `
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-10px);
                }
            }
        `;
document.head.appendChild(style);

// Handle form submission
document
  .getElementById("leaveTypeForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const leaveTypeName = document.getElementById("leaveTypeName").value.trim();
    const detailInputs = document.querySelectorAll(
      'input[name="leaveDetails"]'
    );
    const details = [];

    detailInputs.forEach((input) => {
      if (input.value.trim()) {
        details.push(input.value.trim());
      }
    });

    if (leaveTypeName) {
      // Create new leave type object
      const newLeaveType = {
        id: Date.now(),
        name: leaveTypeName,
        details: details,
        createdAt: new Date().toLocaleDateString(),
      };

      // Add to array
      leaves.push(newLeaveType);
      console.log(leaves)
      await fetch(`/api/admin/addLeaveType`,{
        method:"POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(newLeaveType)
      });

      // Update display
      updateLeaveTypesList();

      // Reset form
      this.reset();

      document.getElementById("additionalInputs").innerHTML = "";

      // Show success message
      showSuccessMessage("Leave type added successfully!");
    }
  });


async function removeLeaveType(id) {
  if (confirm("Are you sure you want to remove this leave type?")) {
    leaveTypes = leaveTypes.filter((lt) => lt.id !== id);
    const leaveType = leaveTypes.find((lt) => lt.id == id);
   
      if ( confirm(`Are you sure you want to delete "${id}"?`)) {
        leaveTypes = leaveTypes.filter((lt) => lt.id !== id);
        // showAlert(
        //   `Leave type "${leaveType.name}" has been deleted!`,
        //   "success"
        // );
        console.log("done")
        await fetch(`/api/admin/deleteLeaveType?leave_id=${id}`);
        getLeaveTypes();
      }
    }
    showSuccessMessage("Leave type removed successfully!");
}

// Update leave types list display
function updateLeaveTypesList(listOfLeaves) {
  const listContainer = document.getElementById("leaveTypesList");
  const emptyState = document.getElementById("emptyState");
  

  listOfLeaves

  if (!Array.isArray(listOfLeaves) || listOfLeaves.length === 0) {
    listContainer.innerHTML = `
                    <div class="empty-state" id="emptyState">
                        <i class="fas fa-calendar-times"></i>
                        <h4>No Leave Types Found</h4>
                        <p>Start by adding your first leave type above.</p>
                    </div>
                `;
  } else {
    let listHTML = "";
    listOfLeaves.forEach((leaveType) => {

  const detailsHTML = leaveType.leave_type
    ? `<div class="leave-type-details">• ${leaveType.leave_type}</div>`
    : '<div class="leave-type-details">• No additional details provided</div>';

  listHTML += `
    <div class="leave-type-item">
      <div class="leave-type-content">
        <div class="leave-type-name">${leaveType.leave_type}</div>
        ${detailsHTML}
        <div class="leave-type-details" style="color: #999; font-size: 0.8rem; margin-top: 8px;">
          ID: ${leaveType.id}
        </div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeLeaveType(${leaveType.id})" title="Remove leave type">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
});

    listContainer.innerHTML = listHTML;
  }
}

// Remove leave type

// Show success message
function showSuccessMessage(message) {
  // Create toast notification
  const toast = document.createElement("div");
  toast.className = "alert alert-success";
  toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                animation: slideInRight 0.3s ease;
            `;
  toast.innerHTML = `
                <i class="fas fa-check-circle"></i> ${message}
                <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
            `;

  document.body.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 3000);
}

// Add slideInRight animation
const toastStyle = document.createElement("style");
toastStyle.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
document.head.appendChild(toastStyle);

// Initialize the page
document.addEventListener("DOMContentLoaded", async function () {
  const res = await fetch("/api/admin/getLeaveType")
  const json = await res.json()
  console.log(json)
  leaveTypes = json.lt
  updateLeaveTypesList(leaveTypes);
  getLeaveTypes();
});
