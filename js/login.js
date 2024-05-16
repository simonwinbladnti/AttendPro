document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const result = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', 
    })
    .then(response => response.json())
        if (result.success) {
            window.location.href = '/dashboard.html';
        } else {
            alert('Login failed');
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
