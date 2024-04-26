document.addEventListener('DOMContentLoaded', function() {
    const currentDate = new Date();
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString();

    const username = getCookie('username');

    if (username) {
        document.getElementById('username').innerHTML = username;
    } else {
        window.location.href = '/login.html'; 
    }
    
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

