let selectedReasons = [];

async function showLeaveModal(id) {
  const data = await fetch(`/api/hr/leave?id=${id}`)
  const json = await data.json()
  console.log(json)
  const node = document.getElementById("leaveModal")
  document.getElementById("user_fullname").textContent = json.leave.fullname
  document.getElementById("jobTitleModal").textContent = json.leave.job_title.toUpperCase()
  document.getElementById("departmentModal").textContent = json.leave.department.toUpperCase()
  document.getElementById("leaveTypeModal").value = json.leave.leave_type
  document.getElementById("startDateModal").value = json.leave.start_date
  document.getElementById("endDateModal").value = json.leave.end_date
  document.getElementById("commutationModal").value = json.leave.commutation
  document.getElementById("commentModal").value = json.leave.comment
  document.getElementById("user_image").src = `${json.leave.picture}`
  document.getElementById("creditModal").textContent = json.leave.credit.remaining
  localStorage.setItem("selected", id)



  console.log(node)
  const modal = new bootstrap.Modal(node);

  modal.show();
}

async function hideLeaveModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("leaveModal")
  );
// approved leave request hehe
const id = localStorage.getItem("selected")

  const d = await fetch(`/api/hr/approved?id=${id}`,{
    method:"GET"
  })
  const status = await d.json()
  if(status.status){
    modal.hide();
    window.location.reload()
    return
  }
  alert("Fail to approve")
  alert(status.message)

}

async function hideRejectionModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("rejectionModal")
  );
  const id = localStorage.getItem("selected")
  const d = await fetch(`/api/hr/reject?id=${id}`,{
    method:"GET"
  })
  const status = await d.json()
  if(status.status){
    modal.hide();
    window.location.reload()
    return
  }
  
  alert(status.message)
 
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

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
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
function formatShortDate(dateString) {
  const date = new Date(dateString);
  const mm = date.getMonth() + 1; // months are 0-based
  const dd = date.getDate();
  const yy = String(date.getFullYear()).slice(-2); // last 2 digits of year

  return `${mm}/${dd}/${yy}`;
}




const resultContainer = document.getElementById("resultContainer")
function showResult(data){
  resultContainer.innerHTML = ""
  data.request.forEach(e => {
    const node = document.createElement("tr")
    node.innerHTML = `<td>
                  <div class="employee-info">
                    <div class="employee-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <a href="./emp_profile.html">
                      ${e.users__firstname} ${e.users__middlename} ${e.users__lastname}
                    </a>
                  </div>
                </td>
                <td>${formatShortDate(e.createdAt)}</td>
                <td>${e.start_date}</td>
                <td>${e.end_date}</td>
                <td>${e.leave_type}</td>
                <td>1.50</td>
                <td>
                  <button
                    class="btn btn-view-details"
                    onclick="showLeaveModal(${e.id})"
                  >
                    <i class="fas fa-eye me-1"></i>View Details
                  </button>
                </td>`
                resultContainer.appendChild(node)
  });
}

const departmentFilter = document.getElementById("departmentFilter")
const leaveFilter = document.getElementById("leaveFilter")
async function fetchData(dep, lt) {
  const data = await fetch("/api/hr/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",  
      "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({
      department: dep,
      leave_type: lt
    })
  });

  const fd = await data.json();
  console.log(fd);
  showResult(fd)
  localStorage.setItem("search", JSON.stringify(fd));
}
departmentFilter.addEventListener("change", ()=>{
    fetchData(departmentFilter.value, leaveFilter.value)
})
leaveFilter.addEventListener("change", ()=>{
    fetchData(departmentFilter.value, leaveFilter.value)
})

