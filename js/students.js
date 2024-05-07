document.addEventListener('DOMContentLoaded', async () => {
    const username = getCookie('username');

    if (username) {
        document.getElementById('username').innerHTML = username;
    } else {
        window.location.href = '/login.html'; 
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
            const idCell = document.createElement('td');
            const nameCell = document.createElement('td');
            const attendanceCell = document.createElement('td');
            const addButton = document.createElement('td'); 

            idCell.textContent = index + 1;
            nameCell.textContent = userData.username;
            attendanceCell.textContent = formatTime(userData.totaltime);

            addButton.textContent = 'Add Attendance';
            addButton.id = 'addAttendance';
            addButton.addEventListener('click', async () => {
                const userID = prompt("Enter student ID:");
                if (userID) {
                    const attendanceTime = prompt("Enter attendance time (in seconds):");
                    if (attendanceTime) {
                        try {
                            const response = await fetch(`http://localhost:3000/add-attendance`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ id: userID, time: attendanceTime })
                            });
                            const result = await response.json();
                            if (result.success) {
                                alert('Attendance added successfully.');
                                location.reload();
                            } else {
                                alert('Failed to add attendance.');
                            }
                        } catch (error) {
                            console.error('Error adding attendance:', error);
                            alert('An error occurred while adding attendance.');
                        }
                    }
                }
            });            

            // Append cells and button to row
            newRow.appendChild(idCell);
            newRow.appendChild(nameCell);
            newRow.appendChild(attendanceCell);
            newRow.appendChild(addButton); // Append the Add Attendance button

            // Append row to table body
            studentsTableBody.appendChild(newRow);
        });
    } else {
        console.error('Failed to fetch usernames:', data.message);
    }
});

const addUserBtn = document.getElementById('addUserBtn');
addUserBtn.addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.classList.add('popup');

    const form = document.createElement('form');
    form.innerHTML = `
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" name="firstName" required><br>
        <label for="surname">Surname:</label>
        <input type="text" id="surname" name="surname" required><br>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br>
        <label for="type">Type:</label>
        <select id="type" name="type">
            <option value="admin">Admin</option>
            <option value="student">Student</option>
        </select><br>
        <button type="submit">Submit</button>
    `;

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const formData = {
            name: form.firstName.value,
            surname: form.surname.value,
            username: form.username.value,
            password: form.password.value,
            type: form.type.value
        };

        try {
            const response = await fetch('http://localhost:3000/add-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                alert('User added successfully.');
                popup.remove();
            } else {
                alert('Failed to add user.');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('An error occurred while adding user.');
        }
    });

    popup.appendChild(form);

    document.body.appendChild(popup);
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
