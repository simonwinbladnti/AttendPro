document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log('test');

    const result = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
        if (result.success) {
            window.location.href = '/dashboard.html'; // Example redirect
        } else {
            alert('Login failed');
        }
});
