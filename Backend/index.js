
//This is the main backend file: index.js please don't change anything in it

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1) CONNECT TO DATABASE

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',          // change if your MySQL user is different
  password: 'Mysql1234',          // put your MySQL password here ('' if empty)
  database: 'blogverse'  // exactly same as in Workbench
});

db.connect((err) => {
  if (err) {
    console.log(' DB connection error:', err);
  } else {
    console.log('MySQL connected');
  }
});

// 2) SIMPLE TEST ROUTE – GET ALL USERS
app.get('/api/users-test', (req, res) => {
  const sql = 'SELECT * FROM users';

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ message: 'DB error', error: err });
    }
    // send rows to the browser as JSON
    res.json(rows);
  });
});
// Registered user testing code
app.post('/api/register', (req, res) => {
    const { username, email, gender, contact, role, password } = req.body;

    if (!username || !email || !password) {
        return res.json({ success: false, message: "Required fields missing" });
    }

    const sql = `
      INSERT INTO users
      (Username, Email, Gender, ContactNo, User_Role, Password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [username, email, gender, contact, role, password],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ success: false, message: "Database error" });
            }

            res.json({
                success: true,
                message: "Registration successful ✅",
                userId: result.insertId
            });
        }
    );
});

//Login user testing
// LOGIN USER
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  const sql = `
    SELECT * FROM users
    WHERE Email = ? AND Password = ?
  `;

  db.query(sql, [email, password], (err, rows) => {
    if (err) {
      console.error("Login error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.UserId,
        username: user.Username,
        email: user.Email,
        role: user.User_Role,
      },
    });
  });
});



//------------------------------------------------------------------------
// 3) START SERVER
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});