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



app.listen(3000)

