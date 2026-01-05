const express = require("express");
const router = express.Router();
const db = require("../Database");

//this is the code for edition and viewing of user profile
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT Username, ContactNo, Gender 
       FROM Users 
       WHERE UserId = ?`,// it is used to fetch user details based on userId for displaying profile information
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
       WHERE UserId = ?`,// it is used to update user profile information based on userId
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

module.exports = router;
