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

    if (rows[0].Password !== oldPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Old password incorrect" });
    }

    await db.query(
      "UPDATE Users SET Password = ? WHERE UserId = ?",
      [newPassword, userId]
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