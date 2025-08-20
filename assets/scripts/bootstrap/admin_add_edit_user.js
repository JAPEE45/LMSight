// File input functionality
document.getElementById("fileInput").addEventListener("change", function (e) {
  const fileName = e.target.files[0]
    ? e.target.files[0].name
    : "No file chosen";
  document.querySelector(
    'label[for="fileInput"]'
  ).innerHTML = `<span style="color: #6b7280;">${fileName}</span>`;
});

// Save button functionality with loading animation
document.getElementById("saveBtn").addEventListener("click", function () {
  const btn = this;
  const originalText = btn.childNodes[0].textContent.trim();
  const loadingContent = btn.querySelector(".loading-content");
  const successContent = btn.querySelector(".success-content");

  // Start loading state
  btn.disabled = true;
  btn.classList.add("loading");
  btn.childNodes[0].textContent = "";
  loadingContent.style.display = "flex";

  // Simulate API call delay
  setTimeout(() => {
    // Hide loading elements
    loadingContent.style.display = "none";

    // Show success state
    successContent.style.display = "flex";
    btn.style.background = "#10b981";

    // Reset after 2 seconds
    setTimeout(() => {
      btn.classList.remove("loading");
      btn.disabled = false;
      btn.style.background = "";
      btn.childNodes[0].textContent = originalText;
      successContent.style.display = "none";
    }, 2000);
  }, 2000); // 2 second loading simulation
});
