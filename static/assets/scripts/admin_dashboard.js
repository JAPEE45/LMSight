// Initialize the doughnut chart
const ctx = document.getElementById("roleChart").getContext("2d");
const user_arr = document.getElementById("user_arr")
const roleChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    datasets: [
      {
        data: JSON.parse(user_arr.textContent), // Employee, HR, Admin percentages
        backgroundColor: ["#ff6b9d", "#008AD8", "#ffc107"],
        borderWidth: 0,
        cutout: "60%",
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const labels = ["Employee", "HR", "Admin"];
            return labels[context.dataIndex] + ": " + context.parsed + "%";
          },
        },
      },
    },
  },
});
