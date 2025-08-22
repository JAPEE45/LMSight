// Initialize the doughnut chart
const ctx = document.getElementById("roleChart").getContext("2d");
const roleChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    datasets: [
      {
        data: [60, 25, 15], // Employee, HR, Admin percentages
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
