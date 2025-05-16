
    const ctx = document.getElementById('leaveChart').getContext('2d');
    const canvas = document.getElementById('weeklyLeaveChart');
    const ctx2 = canvas.getContext('2d');

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
      ctx2.fillStyle = "#1DA1F2";
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