/*
  File: server.js
  Author: Simon Winblad
  Date: 2023-11-30
  Description: Fully functional system for handling server side of AttendPro. Managing database connections and communication to client.
*/

const express = require('express') // Importing the express package to enable express functionality
const app = express() // Activates express and defined as "app"
const cookieParser = require('cookie-parser') // Importing the cookie-parser package to enable cookie functionality
const mysql = require('mysql2/promise') //  Importing the mysql package to enable mydql functionality
const cors = require('cors') // Importing the cors package to enable CORS functionality

// Configuring CORS options
const corsOptions = {
    origin: 'http://localhost:5500', // Allowing requests from http://localhost:5500
    credentials: true, // Enabling credentials from http://localhost:5500
 };

// Implementing app functionality from libraries
app.use(cors(corsOptions)); 
app.use(cookieParser())
app.use(express.json())
app.use(cookieParser())

/*
    Connecting to the database.
    Parameters:
        - none
     Returns: Connection object
*/

async function connectToDatabase() {
    // Establishes a connection to the database. 
    try {
        // Connect to port 3306 at localhost and database attendpro
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            database: 'attendpro',
        });
        // Logs a message to the console indicating that the connection was successful.
        console.log('Connected to the database');
        // Returns the connection object.
        return connection;
        // Catch if there is an error in the try to establish connection
    } catch (error) {
        // Logs an error message to the console if there is an error in the try to establish connection.
        console.error('Error connecting to the database:', error);
        // Exits the process with an error code of 1.
        process.exit(1); 
    }
}

/*
    Login endpoint.
    Parameters:
        - req: Request object containing the client's request.
        - res: Response object to send back to the client.
    Returns: Sets cookies and sends a JSON response.
*/

app.post('/login', async function (req, res) {
    // Establishes a connection to the database.
    const connection = await connectToDatabase();
    // Set username and password to the client request object
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    const [rows] = await connection.execute(sql, [username, password]); // Create a SQL query to select the user from the database.

    // Checks if the user exists in the database.
    if (rows.length > 0) {
        // Retrieves the user's ID, username, user type, and total time from the database.
        const userId = rows[0].id; 
        const type = rows[0].type; 
        const time = rows[0].totaltime;  

        // Sets cookies for the user's ID, username, user type, and total time.
        
        res.cookie('userId', userId, { httpOnly: false, secure: true, sameSite: 'lax', expires: new Date(Date.now() + 86400000) });
        res.cookie('username', username, { httpOnly: false, secure: true, sameSite: 'lax', expires: new Date(Date.now() + 86400000) });
        res.cookie('userType', type, { httpOnly: false, secure: true, sameSite: 'lax', expires: new Date(Date.now() + 86400000) });
        res.cookie('userTime', time, { httpOnly: false, secure: true, sameSite: 'lax', expires: new Date(Date.now() + 86400000) });
        
        // Sends a JSON response indicating success.
        res.json({ success: true });
    } else {
        // Sends a JSON response indicating failure.
        res.json({ success: false });
    }
});

/*
    Endpoint to retrieve student data.
    Parameters:
        - req: Request object containing the client's request.
        - res: Response object to send back to the client.
    Returns: Sends a JSON response with user data or an error message.
*/
app.post('/students', async function (req, res) {
    // Establishes a connection to the database.
    const connection = await connectToDatabase();

    // Create a SQL query to select usernames and totaltime from the users table.
    const sql = "SELECT username, totaltime FROM users";
    const [rows] = await connection.execute(sql);
    // Checks if the user exists in the database.
    if (rows.length > 0) {
        // Maps the rows to an array of objects containing only the username and total time.
        const usersData = rows.map(row => ({ username: row.username, totaltime: row.totaltime })); 

        // Sends a JSON response with the user data.
        res.json({ success: true, usersData: usersData }); 
    } else {
        res.json({ success: false, message: "No usernames found" });
    }
});


/*
    Endpoint to add attendance by updating a user's total time.
    Parameters:
        - req: Request object containing the client's request.
        - res: Response object to send back to the client.
    Returns: Sends a JSON response with user data or an error message.
*/

app.post('/add-attendance', async function (req, res) {
    // Establishes a connection to the database.
    const connection = await connectToDatabase();
    const { id, time } = req.body;

    // Validates that both id and time are provided in the request body.
    if (!id || !time) {
        return res.json({ success: false, message: "id and time are required" });
    }

    // Create a SQL query to update the user's total time.
    const updateSql = "UPDATE users SET totaltime = totaltime + ? WHERE id = ?";
    const [updateResult] = await connection.execute(updateSql, [time, id]);

    // Checks if the update operation affected any rows.
    if (updateResult.affectedRows > 0) {
        
        // Create a SQL query to select the updated user's username and total time.
        const selectSql = "SELECT username, totaltime FROM users WHERE id = ?";
        const [rows] = await connection.execute(selectSql, [id]);


        // Checks if the selected user exists.
        if (rows.length > 0) {
            // Creates an array containing the user's username and updated total time.
            const userData = { username: rows[0].username, totaltime: rows[0].totaltime }; 
            // Returning to client sucess and userData
            return res.json({ success: true, userData: userData }); 
        } else {
            return res.json({ success: false, message: "User not found" });
        }
    } else {
        return res.json({ success: false, message: "Failed to update total time" });
    }
});

/*
    Endpoint to add a user by updating a users table and adding new row.
    Parameters:
        - req: Request object containing the client's request.
        - res: Response object to send back to the client.
    Returns: Sends a JSON response if the action was succesfull or not.
*/

app.post('/add-user', async function (req, res) {
    // Establishes a connection to the database.
    const connection = await connectToDatabase();
    // Get request body from client
    const { name, surname, username, password, type } = req.body;

    // Validates that all required fields are provided in the request body.
    if (!name || !surname || !username || !password || !type) {
        return res.json({ success: false, message: "All fields are required" });
    }

    // If there is an error inside "try" the catch will handle instead
    try {
        // Create a SQL query to select the last user's ID from the users table.
        const [lastIdRows] = await connection.execute("SELECT id FROM users ORDER BY id DESC LIMIT 1");
        // Get the last user's ID from the users table.
        let lastId = 0;
        if (lastIdRows.length > 0) {
            // Set lastId to the id of the last user
            lastId = lastIdRows[0].id;
        }

        const newId = lastId + 1;
        // Set newId to the new user's id

        // Create a SQL query to insert the new user's data into the users table.
        const insertSql = "INSERT INTO users (id, username, password, name, surname, type) VALUES (?, ?, ?, ?, ?, ?)";  
        // Execute the SQL query to insert the new user's data into the users table.
        const [insertResult] = await connection.execute(insertSql, [newId, username, password, name, surname, type]);

        // Checks if the insert operation affected any rows.
        if (insertResult.affectedRows > 0) {
            // Sends a JSON response indicating success.
            return res.json({ success: true, message: "User added successfully" });
        } else {
            // Sends a JSON response indicating failure.
            return res.json({ success: false, message: "Failed to add user" });
        }
        // If there is an error inside "try" the catch will handle instead
    } catch (error) {
        // Log the error to the console.
        console.error('Error adding user:', error);
        // Return an error message to the client.
        return res.status(500).json({ success: false, message: "An error occurred while adding user" });
    }
});


// Call express app to listen to port 3000
app.listen(3000)

