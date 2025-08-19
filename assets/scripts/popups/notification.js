document.getElementById('notification-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('show');
});

document.addEventListener('click', function(event) {
    const panel = document.getElementById('notificationsPanel');
    const bell = document.getElementById('notification-btn');
    
    if (!panel.contains(event.target) && !bell.contains(event.target)) {
        panel.classList.remove('show');
    }
});
