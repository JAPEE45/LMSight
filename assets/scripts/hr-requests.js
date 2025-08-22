let selectedReasons = [];

function showLeaveModal() {
  const modal = new bootstrap.Modal(document.getElementById("leaveModal"));
  modal.show();
}

function hideLeaveModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("leaveModal")
  );
  modal.hide();
}

function hideRejectionModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("rejectionModal")
  );
  modal.hide();
}

function showRejectionModal() {
  const leaveModal = bootstrap.Modal.getInstance(
    document.getElementById("leaveModal")
  );
  leaveModal.hide();

  setTimeout(() => {
    const rejectionModal = new bootstrap.Modal(
      document.getElementById("rejectionModal")
    );
    rejectionModal.show();
  }, 300);
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
