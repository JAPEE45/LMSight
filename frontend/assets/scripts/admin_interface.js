
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
new Chart(ctx3, {
  type: 'bar',
  data: {
    labels: ['Sick', 'Casual', 'Vacation', 'Emergency', 'Maternity', "Solo Parent", "Study"],
    datasets: [{
      label: 'Leaves Taken',
      data: [2, 1, 4, 3, 2, 5, 0.1],
      backgroundColor: '#fff'
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
        text: 'Leave Summary Graph',
        color: "white"
      }
    },
     scales: {
      x: {
        ticks: {
          color: '#fff' // X-axis label color
        }
      },
      y: {
        ticks: {
          color: '#fff' // Y-axis label color
        }
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