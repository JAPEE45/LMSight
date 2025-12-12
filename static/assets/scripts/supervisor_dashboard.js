let currentLeaveIndex = 0;
let ongoingLeaveData = [];

async function fetchOngoingLeaves() {
  try {
    const d = await fetch("/api/hr/ongoing");
    const c = await d.json();
    if (c.o) {
      ongoingLeaveData = c.o;
    }
    updateLeaveCard(currentLeaveIndex);
  } catch (e) {
    console.error("Failed to fetch ongoing leaves", e);
  }
}

function updateLeaveCard(index) {
  console.log("Updating leave card", index);

  // Check if data exists
  if (!ongoingLeaveData || ongoingLeaveData.length === 0) {
    console.warn("No ongoing leaves found.");
    document.getElementById('employeeName').textContent = "No records found";
    document.getElementById('employeeDept').textContent = "-";
    document.getElementById('leaveTypeBadge').textContent = "-";
    document.getElementById('startDate').textContent = "-";
    document.getElementById('endDate').textContent = "-";
    
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;
    return;
  }

  const data = ongoingLeaveData[index];
  if (!data) {
    console.warn(`Invalid index ${index} for ongoing leaves.`);
    return;
  }

  document.getElementById('employeeName').textContent =
    `${data.users__firstname} ${data.users__middlename ?? ""} ${data.users__lastname}`;
  document.getElementById('employeeDept').textContent = data.users__department;
  document.getElementById('leaveTypeBadge').textContent = data.leave_type__leave_type;
  document.getElementById('startDate').textContent = data.start_date;
  document.getElementById('endDate').textContent = data.end_date;

  // Update indicators
  const indicators = document.querySelectorAll('.indicator');
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
    // Hide extra indicators if we have fewer items
    if (i < ongoingLeaveData.length) {
        indicator.style.display = 'inline-block';
    } else {
        indicator.style.display = 'none';
    }
  });

  // Update button states safely
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
    fetchOngoingLeaves();
    
    // Add click handlers for indicators
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (index < ongoingLeaveData.length && index !== currentLeaveIndex) {
                const direction = index > currentLeaveIndex ? 1 : -1;
                currentLeaveIndex = index; // Directly set index
                // We could use navigateLeave logic for animation, but simplify for click
                updateLeaveCard(currentLeaveIndex);
            }
        });
    });
});