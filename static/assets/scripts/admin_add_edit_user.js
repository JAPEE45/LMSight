// document.getElementById("fileInput").addEventListener("change", function (e) {
//   const fileName = e.target.files[0]
//     ? e.target.files[0].name
//     : "No file chosen";
//   document.querySelector(
//     'label[for="fileInput"]'
//   ).innerHTML = `<span style="color: #6b7280;">${fileName}</span>`;
// });
const fileInput = document.getElementById("fileInput");

document.getElementById("saveBtn").addEventListener("submit", function () {
  const btn = this;
  const originalText = btn.childNodes[0].textContent.trim();
  const loadingContent = btn.querySelector(".loading-content");
  const successContent = btn.querySelector(".success-content");

  btn.disabled = true;
  btn.classList.add("loading");
  btn.childNodes[0].textContent = "";
  loadingContent.style.display = "flex";
  const noImage = document.getElementById("noImage");
  if (fileInput.files.length === 0) {
    noImage.style.display = "block";
  }

  setTimeout(() => {    
    loadingContent.style.display = "none";

    successContent.style.display = "flex";
    btn.style.background = "#10b981";

    setTimeout(() => {
      btn.classList.remove("loading");
      btn.disabled = false;
      btn.style.background = "";
      btn.childNodes[0].textContent = originalText;
      successContent.style.display = "none";
    }, 2000);
  }, 2000);
});
