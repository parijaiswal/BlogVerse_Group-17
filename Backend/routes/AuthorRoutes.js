const express = require("express");
const router = express.Router();
const db = require("../Database");

/* ======================================================
   GET AUTHOR INFO
====================================================== */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT UserId, Username, User_Role, Gender, Bio FROM users WHERE UserId = ?`,
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Author not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Author profile error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   GET AUTHOR'S PUBLISHED BLOGS
====================================================== */
router.get("/:userId/blogs", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT BlogId, Title, Content, Category, Image_path, Create_Date, Like_count, Comment_count
       FROM BlogTable
       WHERE Userid = ? AND Status = 'approved' AND Visibility = 'public'
       ORDER BY Create_Date DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Author blogs error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
