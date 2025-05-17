const main_title = document.querySelector(".main-title");

const ctx = document.getElementById('leaveChart').getContext('2d');
const canvas = document.getElementById('weeklyLeaveChart');
const ctx2 = canvas.getContext('2d');

const approved_table = document.querySelector(".approved_table");
const rejected_table = document.querySelector(".rejected_table");
const pending_table = document.querySelector(".pending_table");

const approve_btn = document.querySelector(".approve-btn");
const pending_btn = document.querySelector(".pending-btn");
const reject_btn = document.querySelector(".reject-btn");
const filter_btn = document.getElementById("filter-btn");
const department_select = document.getElementById("department-filter");
const vacation_type_select = document.getElementById("vacation-type-filter")

const edit_btn = document.getElementById("edit_btn");
const edit_modal = document.querySelector(".edit-modal");
const close_modal = document.getElementById("close-edit-modal");

const view_analytics_dets = document.querySelectorAll(".view-analytics-dets");
const analytics_modal = document.querySelector(".analytics-modal");
const close_analytic_modal_btn = document.querySelector(".close-analytic-modal");

const ctx3 = document.getElementById('leavesChart').getContext('2d');
const show_more_btn = document.querySelector(".show-more-btn");
const employee_most_leave_modal = document.querySelector(".employee-most-leave-modal");
const employee_most_leave_close_btn = document.querySelector(".employee-most-leave-close-btn");

const dashboard_nav = document.getElementById("dashboard_nav");
const analytics_nav = document.getElementById("analytics_nav");
const manage_users_nav = document.getElementById("manage_users_nav");
const attendance_maintenance_nav = document.getElementById("attendance_maintenance_nav");

const dashboard_btn = document.querySelector("#dashboard_nav i");
const analytics_btn = document.querySelector("#analytics_nav i");
const manage_users_btn = document.querySelector("#manage_users_nav i");
const attendance_maintenance_btn = document.querySelector("#attendance_maintenance_nav i");

const dashboard_page = document.querySelector(".dashboard");
const analytics_page = document.querySelector(".analytics");
// const manage_users_page = document.querySelector("#manage_users_nav i");
// const attendance_maintenance_page = document.querySelector("#attendance_maintenance_nav i");


const leaveData = [25, 120, 75, 30, 90, 150, 10, 5, 8, 30, 32, 97, 21, 56]; // Example values over 200
const maxLeaves = Math.max(...leaveData);

dashboard_nav.addEventListener("click", () => {
  dashboard_btn.classList.add("active");
  analytics_btn.classList.remove("active");
  manage_users_btn.classList.remove("active");
  attendance_maintenance_btn.classList.remove("active");

  dashboard_page.classList.add("active");
  analytics_page.classList.remove("active");

  main_title.innerHTML = "Welcome, Admin!"
})

analytics_nav.addEventListener("click", () => {
  dashboard_btn.classList.remove("active");
  analytics_btn.classList.add("active");
  manage_users_btn.classList.remove("active");
  attendance_maintenance_btn.classList.remove("active");

  dashboard_page.classList.remove("active");
  analytics_page.classList.add("active");

  main_title.innerHTML = "Descriptive Analysis"
})

manage_users_nav.addEventListener("click", () => {
  dashboard_btn.classList.remove("active");
  analytics_btn.classList.remove("active");
  manage_users_btn.classList.add("active");
  attendance_maintenance_btn.classList.remove("active");
})

attendance_maintenance_nav.addEventListener("click", () => {
  dashboard_btn.classList.remove("active");
  analytics_btn.classList.remove("active");
  manage_users_btn.classList.remove("active");
  attendance_maintenance_btn.classList.add("active");
})


show_more_btn.addEventListener("click", () => {
  employee_most_leave_modal.classList.add("active");
})

employee_most_leave_close_btn.addEventListener("click", () => {
  employee_most_leave_modal.classList.remove("active");
})

// Dynamic color function based on percentage of max value
function getColor(value) {
  const ratio = value / maxLeaves;

  if (ratio >= 0.9) return '#1e3a8a'; // darkest
  if (ratio >= 0.7) return '#2563eb';
  if (ratio >= 0.5) return '#3b82f6';
  if (ratio >= 0.3) return '#60a5fa';
  if (ratio >= 0.1) return '#bfdbfe';
  return '#dbeafe'; // lightest
}

const dynamicColors = leaveData.map(getColor);

new Chart(ctx3, {
  type: 'bar',
  data: {
    labels: ['Vacation', 'Mandatory/Forced', 'Sick', 'Maternity', 'Paternity', "Special Priviledge", "Solo Parent", "Study", "VAWC", "Rehabilitation", "Special Leave", "Special Emergency", "Terminal", "Adoption"],
    datasets: [{
      label: 'Leaves Taken',
      data: leaveData,
      backgroundColor: dynamicColors,
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Most Leaves Taken (May 2025)',
        color: "black",
        font: {
    size: 18,        // font size in pixels
    family: 'Arial', // optional, default system font
    weight: 'bold'   // optional
  }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'black'
        }
      },
      y: {
        ticks: {
          color: 'black'
        },
        beginAtZero: true
      }
    }
  }
});


view_analytics_dets.forEach((menu) => {
  menu.addEventListener("click", () => {
    analytics_modal.classList.add("active");
  })
})

close_analytic_modal_btn.addEventListener("click", () => {
  analytics_modal.classList.remove("active")
})

filter_btn.addEventListener("click", function(e) {
    e.preventDefault();
    department_select.disabled = !department_select.disabled;
    vacation_type_select.disabled = !vacation_type_select.disabled;

    const isEnabled = !department_select.disabled && !vacation_type_select.disabled;

    filter_btn.style.color = isEnabled ? "black" : "";

      if (!isEnabled) location.reload();
  });

edit_btn.addEventListener("click", () => {
    edit_modal.classList.add("active");
})

close_modal.addEventListener("click", () => {
    edit_modal.classList.remove("active");
})

approve_btn.addEventListener("click", () => {
    approved_table.classList.add("active");
    rejected_table.classList.remove("active");
    pending_table.classList.remove("active");
})
pending_btn.addEventListener("click", () => {
    pending_table.classList.add("active");
    rejected_table.classList.remove("active");
    approved_table.classList.remove("active");
})
reject_btn.addEventListener("click", () => {
    rejected_table.classList.add("active");
    approved_table .classList.remove("active");
    pending_table.classList.remove("active");
})

// Sample leave data
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const leaves = [12, 7, 5, 8, 14, 6, 3]; // Number of leave requests per day

// Chart settings
const barWidth = 30;
const gap = 10;
const chartHeight = canvas.height - 50;
const maxLeave = Math.max(...leaves);

// Draw axes
ctx2.beginPath();
ctx2.strokeStyle = '#fff'
ctx2.moveTo(0, 20);
ctx2.lineTo(0, chartHeight);
ctx2.lineTo(canvas.width - 320, chartHeight);
ctx2.stroke();

// Draw bars
leaves.forEach((value, index) => {
  const barHeight = (value / maxLeave) * (chartHeight - 40);
  const x = 10 + index * (barWidth + gap);
  const y = chartHeight - barHeight;

  // Bar
  ctx2.fillStyle = "#F0DAAE";
  ctx2.fillRect(x, y, barWidth, barHeight);

  // Value label
  ctx2.fillStyle = "#fff";
  ctx2.font = "0.7rem Arial";
  ctx2.fillText(value, x + 12, y - 5);

  // Day label
  ctx2.fillText(days[index], x + 2, chartHeight + 30);
});

const leaveChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Leaves Taken',
      data: [5, 9, 6, 3, 7, 4],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});