let currentLeaveIndex = 0;
const ongoingLeaveData = [];

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
