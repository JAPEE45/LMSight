function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function toggleLeaveDetails(headerElement) {
  const contentElement = headerElement.nextElementSibling;
  const dropdownIcon = headerElement.querySelector(".dropdown-icon");

  if (contentElement.classList.contains("show")) {
    contentElement.classList.remove("show");
    dropdownIcon.classList.remove("rotated");
  } else {
    contentElement.classList.add("show");
    dropdownIcon.classList.add("rotated");
  }
}

function downloadFile() {
  // Create a sample PDF download
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "../../assets/files/INSTRUCTIONS AND REQUIREMENTS.pdf"
  );
  element.setAttribute("download", "Leave_Instructions_and_Requirements.pdf");
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  // Show success message
  const successMsg = document.createElement("div");
  successMsg.className =
    "alert alert-success alert-dismissible fade show position-fixed";
  successMsg.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  successMsg.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                <strong>Download Started!</strong> Your file is being downloaded.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
  document.body.appendChild(successMsg);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (successMsg && successMsg.parentNode) {
      successMsg.parentNode.removeChild(successMsg);
    }
  }, 5000);
}

// Add smooth scrolling animation on page load
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".leave-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  });

  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(card);
  });
});
