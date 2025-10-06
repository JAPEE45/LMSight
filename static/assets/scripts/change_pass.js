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

    const response = await fetch("/user/change_password", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.status) {
      alert(result.msg);
      return;
    }

    alert(result.msg);

    document.getElementById("current_password").value = "";
    document.getElementById("new_password").value = "";
    document.getElementById("confirm_password").value = "";
  });
