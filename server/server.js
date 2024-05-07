const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')

const corsOptions = {
    origin: 'http://localhost:5500',
    credentials: true, 
 };

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json())
app.use(cookieParser())


async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            database: 'attendpro',
        });
        console.log('Connected to the database');
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1); 
    }
}


app.post('/login', async function (req, res) {
    const connection = await connectToDatabase();
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    const [rows] = await connection.execute(sql, [username, password]);

    if (rows.length > 0) {
        const userId = rows[0].id; 

        res.cookie('userId', userId, { httpOnly: false, secure: true, sameSite: 'lax', expires: new Date(Date.now() + 86400000) });
        res.cookie('username', username, { httpOnly: false, secure: true, sameSite: 'lax', expires: new Date(Date.now() + 86400000) });

        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});
app.post('/students', async function (req, res) {
    const connection = await connectToDatabase();

    const sql = "SELECT username, totaltime FROM users";
    const [rows] = await connection.execute(sql);

    if (rows.length > 0) {
        const usersData = rows.map(row => ({ username: row.username, totaltime: row.totaltime })); 

        res.json({ success: true, usersData: usersData }); 
    } else {
        res.json({ success: false, message: "No usernames found" });
    }
});

app.post('/add-attendance', async function (req, res) {
    const connection = await connectToDatabase();
    const { id, time } = req.body;

    if (!id || !time) {
        return res.json({ success: false, message: "id and time are required" });
    }

    const updateSql = "UPDATE users SET totaltime = totaltime + ? WHERE id = ?";
    const [updateResult] = await connection.execute(updateSql, [time, id]);

    if (updateResult.affectedRows > 0) {
        const selectSql = "SELECT username, totaltime FROM users WHERE id = ?";
        const [rows] = await connection.execute(selectSql, [id]);

        if (rows.length > 0) {
            const userData = { username: rows[0].username, totaltime: rows[0].totaltime }; 
            return res.json({ success: true, userData: userData }); 
        } else {
            return res.json({ success: false, message: "User not found" });
        }
    } else {
        return res.json({ success: false, message: "Failed to update total time" });
    }
});

app.post('/add-user', async function (req, res) {
    const connection = await connectToDatabase();
    const { name, surname, username, password, type } = req.body;

    if (!name || !surname || !username || !password || !type) {
        return res.json({ success: false, message: "All fields are required" });
    }

    try {
        const [lastIdRows] = await connection.execute("SELECT id FROM users ORDER BY id DESC LIMIT 1");
        let lastId = 0;
        if (lastIdRows.length > 0) {
            lastId = lastIdRows[0].id;
        }

        const newId = lastId + 1;

        const insertSql = "INSERT INTO users (id, username, password, name, surname, type) VALUES (?, ?, ?, ?, ?, ?)";
        const [insertResult] = await connection.execute(insertSql, [newId, username, password, name, surname, type]);

        if (insertResult.affectedRows > 0) {
            return res.json({ success: true, message: "User added successfully" });
        } else {
            return res.json({ success: false, message: "Failed to add user" });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ success: false, message: "An error occurred while adding user" });
    }
});



app.listen(3000)

