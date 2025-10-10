// --- Get CSRF token from cookies ---
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie("csrftoken");

document
  .getElementById("changePasswordForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const current_password = document.getElementById("current_password").value;
    const new_password = document.getElementById("new_password").value;
    const confirm_password = document.getElementById("confirm_password").value;

    if (new_password !== confirm_password) {
      alert("New password and confirm password do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("current-password", current_password);
    formData.append("new-password", new_password);
    formData.append("confirm-password", confirm_password);

    // Absolute URL depending on page type
    const url = window.location.pathname.includes("/hr/")
      ? "/hr/change_password/"
      : "/user/change_password/";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": csrftoken, // ✅ Required by Django
        },
      });

      const result = await response.json(); // Parse JSON from server

      if (!result.status) {
        alert(result.msg);
        return;
      }

      alert(result.msg);

      // Clear fields
      document.getElementById("current_password").value = "";
      document.getElementById("new_password").value = "";
      document.getElementById("confirm_password").value = "";
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred. Make sure you are logged in.");
    }
  });
