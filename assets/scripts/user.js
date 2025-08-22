// Apply Leave and Back to Table functionality
const applyLeaveBtn = document.getElementById("applyLeaveBtn");
const backToTableBtn = document.getElementById("backToTableBtn");
const dashboardSection = document.getElementById("dashboardSection");
const applyLeaveSection = document.getElementById("applyLeaveSection");
const headerTitle = document.getElementById("headerTitle");

applyLeaveBtn.addEventListener("click", function () {
  dashboardSection.classList.add("hidden");
  applyLeaveSection.classList.remove("hidden");
  applyLeaveSection.classList.add("show");
});

backToTableBtn.addEventListener("click", function () {
  applyLeaveSection.classList.add("hidden");
  applyLeaveSection.classList.remove("show");
  dashboardSection.classList.remove("hidden");
});

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

// Form submission
applyLeaveForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(this);
  const leaveData = {};

  // Convert FormData to object
  for (let [key, value] of formData.entries()) {
    leaveData[key] = value;
  }

  // Show success message
  alert("Leave application submitted successfully!");

  // Reset form
  this.reset();
  agreeTermsCheckbox.checked = false;
  submitBtn.disabled = true;

  // Go back to dashboard
  applyLeaveSection.classList.add("hidden");
  applyLeaveSection.classList.remove("show");
  dashboardSection.classList.remove("hidden");
});

// Date validation - end date should be after start date
const startDateInput = document.querySelector(
  'input[type="date"]:first-of-type'
);
const endDateInput = document.querySelector('input[type="date"]:last-of-type');

startDateInput.addEventListener("change", function () {
  endDateInput.min = this.value;
  if (endDateInput.value && endDateInput.value < this.value) {
    endDateInput.value = this.value;
  }
});

endDateInput.addEventListener("change", function () {
  if (startDateInput.value && this.value < startDateInput.value) {
    alert("End date cannot be before start date");
    this.value = startDateInput.value;
  }
});

// Set minimum date to today
const today = new Date().toISOString().split("T")[0];
startDateInput.min = today;
endDateInput.min = today;

// File upload validation
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size should not exceed 5MB");
      this.value = "";
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only PDF, DOC, DOCX, JPG, JPEG, or PNG files");
      this.value = "";
      return;
    }
  }
});

document.querySelectorAll(".profile").forEach((profile) => {
  profile.addEventListener("click", () => {
    window.location.href = "./emp_profile.html";
  });
});
