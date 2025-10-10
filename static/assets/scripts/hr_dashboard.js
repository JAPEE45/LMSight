// Weekly Chart

const weeklyData = document.getElementById("weeklyData")
console.log(weeklyData.textContent)
const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
const weeklyChart = new Chart(weeklyCtx, {
    type: 'bar',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: JSON.parse(weeklyData.textContent),
            backgroundColor: '#dca907',
            borderRadius: 4,
            borderSkipped: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});

// Monthly Chart
const monthlyData = document.getElementById("monthlyData")
const nmonth = JSON.parse(monthlyData.textContent)
const nnmonth = nmonth.filter((i,e)=> e > 2  && e<8 )
const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
const monthlyChart = new Chart(monthlyCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','July', 'Aug', 'Sept', 'Oct', 'Nov' ,'Dec'],
        datasets: [{
            label: 'Leaves Taken',
            data: nmonth,
            borderColor: '#238b45',
            backgroundColor: 'rgba(35, 139, 69, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#238b45',
            pointBorderColor: '#238b45',
            pointRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            }
        }
    }
});

// Sample ongoing leave data
const ongoingLeaveData = [
    {
        name: "Divine R. Torcuator",
        department: "IT",
        leaveType: "Sick Leave",
        startDate: "June 5, 2025",
        endDate: "June 10, 2025"
    },
    {
        name: "Maria Santos",
        department: "HR",
        leaveType: "Vacation Leave",
        startDate: "June 12, 2025",
        endDate: "June 16, 2025"
    },
    {
        name: "John Doe",
        department: "Finance",
        leaveType: "Emergency Leave",
        startDate: "June 18, 2025",
        endDate: "June 20, 2025"
    }
];

let currentLeaveIndex = 0;

// async function updateLeaveCard(index) {
//   console.log("this is ongoing")
//     const d = await fetch("/api/hr/ongoing")
//     const c = await d.json()
//     console.log(c)

//     const data = c.o[index];
//     console.log(c)
//     const content = document.getElementById('ongoingContent');
    
//     console.log(data)
//     console.log(`${data.users__firstname} ${data.users__middlename} ${data.users__lastname}`)
//     document.getElementById('employeeName').textContent = `${data.users__firstname} ${data.users__middlename} ${data.users__lastname}`;
//     document.getElementById('employeeDept').textContent = data.department;
//     document.getElementById('leaveTypeBadge').textContent = data.leave_type__leave_type;
//     document.getElementById('startDate').textContent = data.start_date;
//     document.getElementById('endDate').textContent = data.end_date;
    
//     // Update indicators
//     document.querySelectorAll('.indicator').forEach((indicator, i) => {
//         indicator.classList.toggle('active', i === index);
//     });
    
//     // Update button states
//     document.getElementById('prevBtn').disabled = index === 0;
//     document.getElementById('nextBtn').disabled = index === ongoingLeaveData.length - 1;
// }

async function updateLeaveCard(index) {
  console.log("this is ongoing");
  
  const d = await fetch("/api/hr/ongoing");
  const c = await d.json();
  console.log(c);

  // Check if data exists
  if (!c.o || c.o.length === 0) {
    console.warn("No ongoing leaves found.");
    document.getElementById('employeeName').textContent = "No records found";
    document.getElementById('employeeDept').textContent = "-";
    document.getElementById('leaveTypeBadge').textContent = "-";
    document.getElementById('startDate').textContent = "-";
    document.getElementById('endDate').textContent = "-";
    return; // stop here
  }

  const data = c.o[index];
  if (!data) {
    console.warn(`Invalid index ${index} for ongoing leaves.`);
    return;
  }

  document.getElementById('employeeName').textContent =
    `${data.users__firstname} ${data.users__middlename ?? ""} ${data.users__lastname}`;
  document.getElementById('employeeDept').textContent = data.department;
  document.getElementById('leaveTypeBadge').textContent = data.leave_type__leave_type;
  document.getElementById('startDate').textContent = data.start_date;
  document.getElementById('endDate').textContent = data.end_date;

  // Update indicators
  document.querySelectorAll('.indicator').forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
  });

  // Update button states safely
  document.getElementById('prevBtn').disabled = index === 0;
  document.getElementById('nextBtn').disabled = index === c.o.length - 1;
}


function navigateLeave(direction) {
    const newIndex = currentLeaveIndex + direction;
    
    if (newIndex >= 0 && newIndex < ongoingLeaveData.length) {
        const content = document.getElementById('ongoingContent');
        
        // Add slide animation class
        if (direction === 1) {
            content.classList.add('slide-left');
        } else {
            content.classList.add('slide-right');
        }
        
        // Update content after animation starts
        setTimeout(() => {
            currentLeaveIndex = newIndex;
            updateLeaveCard(currentLeaveIndex);
            
            // Remove slide class and add opposite for entry animation
            content.classList.remove('slide-left', 'slide-right');
            
            // Trigger reflow
            content.offsetHeight;
            
            // Brief slide-in from opposite direction
            if (direction === 1) {
                content.classList.add('slide-right');
            } else {
                content.classList.add('slide-left');
            }
            
            setTimeout(() => {
                content.classList.remove('slide-left', 'slide-right');
            }, 50);
        }, 150);
    }
}

// Initialize the leave card on page load
document.addEventListener('DOMContentLoaded', function() {
    updateLeaveCard(0);
    
    // Add click handlers for indicators
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (index !== currentLeaveIndex) {
                const direction = index > currentLeaveIndex ? 1 : -1;
                currentLeaveIndex = index - direction; // Adjust for the navigation function
                navigateLeave(direction);
            }
        });
    });
});

const pieDonutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right'
    },
    datalabels: {
      color: '#fff',
      font: {
        weight: 'bold',
        size: 14
      },
      formatter: (value, context) => {
        const dataArr = context.chart.data.datasets[0].data;
        const total = dataArr.reduce((sum, val) => sum + val, 0);
        const percentage = ((value / total) * 100).toFixed(1) + '%';
        return percentage;
      }
    }
  }
};

// Leave Types (Pie Chart)
const d = document.getElementById("leave_type_data")
const cc = JSON.parse(d.textContent)
console.log(cc)
let lv_lab = [...cc[0]]
let lv_val = [...cc[1]]
console.log(lv_lab)
new Chart(document.getElementById('leaveTypesChart'), {
  type: 'pie',
  data: {
    labels: lv_lab,
    datasets: [{
      data: lv_val,
      backgroundColor: ['#FF6384', '#040404ff', '#FFCE56', '#4CAF50']
    }]
  },
  options: pieDonutOptions,
  plugins: [ChartDataLabels]
});

  // Leave Status (Donut Chart)
const leave_status = document.getElementById("leave_status")
new Chart(document.getElementById('leaveStatusChart'), {
  type: 'doughnut',
  data: {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: JSON.parse(leave_status.textContent),
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
    }]
  },
  options: pieDonutOptions,
  plugins: [ChartDataLabels]
});

// Monthly Leaves Requests (Bar Chart)

new Chart(document.getElementById('monthlyRequestsChart'), {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Leave Requests',
      data: [1,2,2,3,4,5],
      backgroundColor: '#36A2EB'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Department-Wise Leave (Stacked Bar Chart)
const dep = document.getElementById("departmentData")
const depArr = JSON.parse(dep.textContent)

new Chart(document.getElementById('departmentChart'), {
  type: 'bar',
  data: {
    labels: ['HR', 'IT', 'Finance', 'Operations'],
    datasets: [
      {
        label: 'Sick Leave',
        data: depArr[0],
        backgroundColor: '#FF6384'
      },
      {
        label: 'Casual Leave',
        data: depArr[1],
        backgroundColor: '#36A2EB'
      },
      {
        label: 'Annual Leave',
        data: depArr[2],
        backgroundColor: '#FFCE56'
      },
      {
        label: 'Others',
        data: depArr[3],
        backgroundColor: '#4CAF50'
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  }
});

const all_leave = document.getElementById("all_leave")
new Chart(document.getElementById('averageDurationChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Average Leave Duration (Days)',
      data: JSON.parse(all_leave.textContent),
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#36A2EB',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => context.parsed.y + ' days'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Days'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  }
});
