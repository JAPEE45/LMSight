// Weekly Chart
const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
const weeklyChart = new Chart(weeklyCtx, {
    type: 'bar',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: [12, 7, 5, 8, 14, 6, 3],
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
const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
const monthlyChart = new Chart(monthlyCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Leaves Taken',
            data: [5, 8.5, 6, 3, 7, 4],
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

function updateLeaveCard(index) {
    const data = ongoingLeaveData[index];
    const content = document.getElementById('ongoingContent');
    
    document.getElementById('employeeName').textContent = data.name;
    document.getElementById('employeeDept').textContent = data.department;
    document.getElementById('leaveTypeBadge').textContent = data.leaveType;
    document.getElementById('startDate').textContent = data.startDate;
    document.getElementById('endDate').textContent = data.endDate;
    
    // Update indicators
    document.querySelectorAll('.indicator').forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    
    // Update button states
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').disabled = index === ongoingLeaveData.length - 1;
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
new Chart(document.getElementById('leaveTypesChart'), {
  type: 'pie',
  data: {
    labels: ['Sick Leave', 'Casual Leave', 'Maternity Leave', 'Annual Leave'],
    datasets: [{
      data: [10, 15, 5, 20],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
    }]
  },
  options: pieDonutOptions,
  plugins: [ChartDataLabels]
});

  // Leave Status (Donut Chart)
new Chart(document.getElementById('leaveStatusChart'), {
  type: 'doughnut',
  data: {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [25, 8, 3],
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
      data: [5, 8, 6, 10, 7, 9],
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
new Chart(document.getElementById('departmentChart'), {
  type: 'bar',
  data: {
    labels: ['HR', 'IT', 'Finance', 'Operations'],
    datasets: [
      {
        label: 'Sick Leave',
        data: [2, 4, 1, 3],
        backgroundColor: '#FF6384'
      },
      {
        label: 'Casual Leave',
        data: [3, 2, 2, 4],
        backgroundColor: '#36A2EB'
      },
      {
        label: 'Annual Leave',
        data: [1, 3, 4, 2],
        backgroundColor: '#FFCE56'
      },
      {
        label: 'Others',
        data: [1, 1, 2, 1],
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

new Chart(document.getElementById('averageDurationChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [{
      label: 'Average Leave Duration (Days)',
      data: [2.5, 3, 1.8, 2.2, 2.9, 3.5, 2.7, 3.1],
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
