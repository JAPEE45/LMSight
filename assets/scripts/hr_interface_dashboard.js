const notifPopup = document.querySelector(".notification-popup-cont");
const notif = document.getElementById("notification-btn");

notif.addEventListener("click", (e) => {
  e.stopPropagation()
  notifPopup.classList.toggle("active");
})

window.addEventListener("click", (e) => {
  if (!notifPopup.contains(e.target) && e.target !== notif) {
    notifPopup.classList.remove("active");
  }
});


// CHARTS ----------------------------------------------

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

new Chart(document.getElementById('vacationLeaveUtilizationChart'), {
  type: 'doughnut',
  data: {
    labels: ['Remaining', 'Used'],
    datasets: [{
      data: [25, 8],
      backgroundColor: ['#5D0565', '#29AA53'] // Removed extra color
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data
            .reduce((sum, val) => sum + val, 0);
          return ((value / total) * 100).toFixed(1) + '%';
        }
      }
    }
  },
  plugins: [ChartDataLabels]
});

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
new Chart(document.getElementById('monthlyLeavesRequestsChart'), {
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
new Chart(document.getElementById('departmentWiseChart'), {
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

new Chart(document.getElementById('averageLeaveDurationChart'), {
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