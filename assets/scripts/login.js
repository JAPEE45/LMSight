const loginBtn = document.querySelector(".loginBtn");

const username = document.getElementById("username");
const password = document.getElementById("password");

loginBtn.addEventListener("click", (event) => {
    event.preventDefault()
    if(username.value === "admin" && password.value === "admin") {
        window.location.href = "./html/admin/dashboard.html";
    } else if(username.value === "hr" && password.value === "hr") {
        window.location.href = "./html/hr/dashboard.html";
    } else {
        window.location.href = "./html/user/dashboard.html";
    }
})