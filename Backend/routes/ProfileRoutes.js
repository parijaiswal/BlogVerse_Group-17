const express = require("express");
const router = express.Router();
const db = require("../Database");

/* ======================================================
   GET USER PROFILE (VIEW PROFILE)
====================================================== */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
         Username,
         Email,
         ContactNo,
         Gender,
         User_Role
       FROM Users
       WHERE UserId = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   UPDATE PROFILE (USERNAME / CONTACT / GENDER)
====================================================== */
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, contact, gender } = req.body;

  if (!username || !contact) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    await db.query(
      `UPDATE Users
       SET Username = ?, ContactNo = ?, Gender = ?
       WHERE UserId = ?`,
      [username, contact, gender, userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   CHANGE PASSWORD
====================================================== */
/* ======================================================
   CHANGE PASSWORD
====================================================== */
const bcrypt = require('bcryptjs'); // Ensure this is imported at top too, but I'll add it here contextually or I should check if it's imported at top.
// Wait, I cannot add require in the middle of file cleanly if it's not at top, but replace_file_content chunk can handle it if I include top. 
// I'll assume I need to add it at top.
// Let's do a multi_replace to add import and fix route.

router.put("/change-password/:userId", async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Missing fields" });
  }

  try {
    const [rows] = await db.query(
      "SELECT Password FROM Users WHERE UserId = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const storedPassword = rows[0].Password;
    let isMatch = false;

    // Check if hashed
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(oldPassword, storedPassword);
    } else {
      // Plain text fallback
      isMatch = (oldPassword === storedPassword);
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      "UPDATE Users SET Password = ? WHERE UserId = ?",
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});
module.exports = router;