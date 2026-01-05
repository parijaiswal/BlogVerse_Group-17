const express = require("express");
const mysql = require("mysql2");
const router = express.Router();

// DB connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mysql1234",
  database: "blogverse",
});

db.connect((err) => {
  if (err) {
    console.log("BlogsRoutes DB error:", err);
  }
});


// ===================================================
// ADD BLOG (already used by admin)
// ===================================================
router.post("/add-blog", (req, res) => {
  const { title, content, visibility, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    INSERT INTO BlogTable
    (Userid, Title, Content, Update_Date, Visibility)
    VALUES (?, ?, ?, NOW(), ?)
  `;

  db.query(
    sql,
    [userId, title, content, visibility || "public"],
    (err, result) => {
      if (err) {
        console.error("Add blog error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        success: true,
        message: "Blog added successfully",
        blogId: result.insertId,
      });
    }
  );
});


// ===================================================
// GET ALL BLOGS (Admin + Member)
// ===================================================
router.get("/", (req, res) => {
  const sql = `
    SELECT BlogId, Title, Content, Visibility, Create_Date
    FROM BlogTable
    ORDER BY Create_Date DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Fetch blogs error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});


// ===================================================
// UPDATE BLOG (Admin only – frontend controlled)
// ===================================================
router.put("/:id", (req, res) => {
  const blogId = req.params.id;
  const { title, content, visibility } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    UPDATE BlogTable
    SET Title = ?, Content = ?, Visibility = ?, Update_Date = NOW()
    WHERE BlogId = ?
  `;

  db.query(
    sql,
    [title, content, visibility, blogId],
    (err) => {
      if (err) {
        console.error("Update blog error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        success: true,
        message: "Blog updated successfully",
      });
    }
  );
});

module.exports = router;
