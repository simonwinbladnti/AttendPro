
document.addEventListener('DOMContentLoaded', function() {
    const currentDate = new Date();
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString();

    const username = getCookie('username');
    const userType = getCookie('userType'); 
    const userAttendance = getCookie('userTime'); 

    if (username) {
        document.getElementById('username').innerHTML = username;
    } else {
        window.location.href = '/login.html'; 
    }

    if (userAttendance) {
        document.getElementById('student-attendance').innerHTML = formatTime(userAttendance);
    } else {
        window.location.href = '/login.html'; 
    }

    const navItemsToRemove = document.querySelectorAll('nav ul li');
    
    if (userType != 'admin') {
        navItemsToRemove.forEach(item => {
            if (item.textContent.includes('Students') || item.textContent.includes('Attendance')) {
                item.parentNode.removeChild(item);
            }
        });
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${remainingSeconds > 0 ? `${remainingSeconds}s` : ''}`.trim();
}
