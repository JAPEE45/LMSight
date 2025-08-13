const loginBtn = document.querySelector(".loginBtn");

const username = document.getElementById("username");
const password = document.getElementById("password");

loginBtn.addEventListener("click", (event) => {
    event.preventDefault()
    if(username.value === "admin" && password.value === "admin") {
        window.location.href = "admin_interface.html";
    } else if(username.value === "hr" && password.value === "hr") {
        window.location.href = "hr_interface.html";
    } else {
        window.location.href = "user_interface.html"
    }
})