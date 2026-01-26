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
// ===================================================
// GET ALL BLOGS (Admin + Member)
// ===================================================
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      b.BlogId,
      b.Title,
      b.Content,
      b.Visibility,
      b.Create_Date,
      b.Image_path,
      u.Username, 
      u.User_Role
    FROM BlogTable b
    JOIN users u ON b.Userid = u.UserId
    ORDER BY b.Create_Date DESC
  `;

  //==============================================================

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Fetch blogs error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});

// ... (likes/comments routes remain changed but I am replacing the block containing GET / and GET /:id)

// ===================================================
// LIKE BLOG
// ===================================================
router.post("/:id/like", (req, res) => {
  const blogId = req.params.id;

  db.query(
    "UPDATE BlogTable SET Like_count = Like_count + 1 WHERE BlogId = ?",
    [blogId],
    (err) => {
      if (err) {
        console.error("Like error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

router.get("/:id/likes", (req, res) => {
  const blogId = req.params.id;

  db.query(
    "SELECT Like_count FROM BlogTable WHERE BlogId = ?",
    [blogId],
    (err, rows) => {
      if (err) {
        console.error("Get likes error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // 🔥 FIX IS HERE
      if (!rows.length) {
        return res.json({ likes: 0 });
      }

      res.json({ likes: rows[0].Like_count || 0 });
    }
  );
});


// ===================================================
// ADD COMMENT
// ===================================================
router.post("/:id/comment", (req, res) => {
  const { Userid, Comment_text } = req.body;

  if (!Userid || !Comment_text) {
    return res.status(400).json({ message: "Userid or Comment_text missing" });
  }

  db.query(
    "INSERT INTO comment_table (Blogid, Userid, Comment_text) VALUES (?, ?, ?)",
    [req.params.id, Userid, Comment_text],
    (err) => {
      if (err) {
        console.error("Insert comment error:", err); // 🔥 check this
        return res.status(500).json({ message: "Database error" });
      }

      // Increment comment count in BlogTable
      db.query(
        "UPDATE BlogTable SET Comment_count = Comment_count + 1 WHERE Blogid = ?",
        [req.params.id],
        (err2) => {
          if (err2) console.error("Increment comment_count error:", err2);
          res.json({ success: true });
        }
      );
    }
  );
});


router.get("/:id/comments", (req, res) => {
  db.query(
    "SELECT * FROM comment_table WHERE Blogid = ? ORDER BY Comment_date DESC",
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.error("Fetch comments error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows); // 👈 this is enough
    }
  );
});


// GET single blog by ID
router.get("/:id", (req, res) => {
  const blogId = req.params.id;

  const sql = `
    SELECT b.BlogId, b.Title, b.Content, b.Visibility, b.Create_Date, b.Image_path, b.Like_count, u.Username, u.User_Role
    FROM BlogTable b
    JOIN users u ON b.Userid = u.UserId
    WHERE b.BlogId = ?
  `;

  db.query(sql, [blogId], (err, rows) => {
    if (err) {
      console.error("Fetch single blog error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(rows[0]);
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
