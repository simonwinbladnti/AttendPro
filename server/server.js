const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')


app.use(cookieParser())
app.use(express.json())
app.use(cors())

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
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(3000)