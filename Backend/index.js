//This is the main backend file: index.js please don't change anything in it
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const blogRoutes = require("./routes/BlogsRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const profileRoutes = require("./routes/ProfileRoutes");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static("uploads"));// serve static files from 'uploads' directory
app.get("/favicon.ico", (req, res) => res.status(204));

//This will be used to connect to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mysql1234',
  database: 'blogverse'
  user: 'root',         
  password: 'aangi05',          
  database: 'blogverse' 
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

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: "Error hashing password" });
    }

    const sql = `
          INSERT INTO users
          (Username, Email, Gender, ContactNo, User_Role, Password)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

    db.query(
      sql,
      [username, email, gender, contact, role, hashedPassword],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.json({ success: false, message: "Database error" });
        }

        res.json({
          success: true,
          message: "Registration successfully completed",
          userId: result.insertId
        });
      }
    );
  });
});

//This is the code for testing the user information during login
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
    WHERE Email = ?
  `;

  db.query(sql, [email], async (err, rows) => {
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

    // Compare hashed password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.Password);
    } catch (e) {
      console.log("Not a bcrypt hash, checking plain text...");
    }

    // Fallback for plain text passwords (backward compatibility)
    if (!isMatch && password === user.Password) {
      isMatch = true;
      // Ideally, migrate to hash here, but keeping it simple as requested.
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

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

// FORGOT PASSWORD - SEND OTP
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  const sql = "UPDATE users SET otp = ?, otp_expiry = ? WHERE Email = ?";
  db.query(sql, [otp, expiry, email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - BlogVerse',
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error);
        // Even if email fails, we might want to tell the user or just log it.
        // For now, let's return success but log the error, 
        // OR return an error so the frontend knows email failed.
        // Given "keep it simple", maybe return error?
        // But the OTP is generated in DB. 
        // Let's log error and return 500 so they can try again.
        return res.status(500).json({ success: false, message: "Error sending email. Check server logs." });
      } else {
        console.log('Email sent: ' + info.response);
        res.json({ success: true, message: "OTP sent to your email" });
      }
    });
  });
});

// VERIFY OTP
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const sql = "SELECT * FROM users WHERE Email = ? AND otp = ? AND otp_expiry > NOW()";
  db.query(sql, [email, otp], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    res.json({ success: true, message: "OTP verified correctly" });
  });
});

// RESET PASSWORD
app.post("/api/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // In the split flow, the user might have already 'verified' the OTP in the previous step,
  // but we still need to check it again to ensure security before changing the password.
  // Note: Since we are not expiring the OTP on 'verify-otp' call, this check is still valid.
  const checkSql = "SELECT * FROM users WHERE Email = ? AND otp = ?";

  db.query(checkSql, [email, otp], (err, rows) => {
    if (err) {
      console.error("Database error during reset check:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    // Check if user exists and OTP matches
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid OTP or Email" });
    }

    // Check expiry
    const user = rows[0];
    if (new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Hashing error:", err);
        return res.status(500).json({ success: false, message: "Error hashing password" });
      }

      const updateSql = "UPDATE users SET Password = ?, otp = NULL, otp_expiry = NULL WHERE Email = ?";
      db.query(updateSql, [hashedPassword, email], (err, result) => {
        if (err) {
          console.error("Database update error:", err);
          return res.status(500).json({ success: false, message: "Database update error" });
        }
        res.json({ success: true, message: "Password updated successfully" });
      });
    });
  });
});
//This is the route to get all users for admin view in the admin dashboard
app.get("/api/admin/users", (req, res) => {
  const sql = "SELECT UserId, Username, Email, User_Role FROM users";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Fetch users error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});
//==============================================================================
//This is the code for adding subscription plans from admin panel
app.post("/api/admin/add-subscription", (req, res) => {
  const { subName, subDuration, subPrice, description, visibility } = req.body;

  if (!subName || !subDuration || !subPrice) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    INSERT INTO SubscriptionTable
    (SubName, SubDuration, SubPrice, Description, Visibility)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [subName, subDuration, subPrice, description, visibility || "active"],
    (err, result) => {
      if (err) {
        console.error("Add subscription error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        success: true,
        message: "Subscription added successfully",
      });
    }
  );
});

//------------------------------------------------------------------------
// check server running
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

