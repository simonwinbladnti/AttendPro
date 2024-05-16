document.addEventListener('DOMContentLoaded', async () => {
    const username = getCookie('username');

    if (username) {
        document.getElementById('username').innerHTML = username;
    } else {
        window.location.href = '/login.html'; 
    }
    let userType = getCookie('userType'); 
    const navItemsToRemove = document.querySelectorAll('nav ul li');
    
    if (userType != 'admin') {
        navItemsToRemove.forEach(item => {
            if (item.textContent.includes('Students') || item.textContent.includes('Attendance')) {
                item.parentNode.removeChild(item);
            }
            window.location.href = 'dashboard.html'; 
        });
    }


    const response = await fetch('http://localhost:3000/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();

    if (data.success) {
        const studentsTableBody = document.querySelector('#studentsTable tbody');
        
        studentsTableBody.innerHTML = '';

        data.usersData.forEach((userData, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${index + 1}</td>
                <td>${userData.username}</td>
                <td>${formatTime(userData.totaltime)}</td>`;
            studentsTableBody.appendChild(newRow);
        });
    } else {
        console.error('Failed to fetch usernames:', data.message);
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
