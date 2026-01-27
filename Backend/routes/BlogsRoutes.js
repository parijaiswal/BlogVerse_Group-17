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
    `SELECT c.Commentid, c.Blogid, c.Userid, c.Comment_text, c.Comment_date, 
            u.Username, u.User_Role 
     FROM comment_table c 
     JOIN users u ON c.Userid = u.UserId 
     WHERE c.Blogid = ? 
     ORDER BY c.Comment_date DESC`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.error("Fetch comments error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows);
    }
  );
});


// ===================================================
// DELETE COMMENT
// ===================================================
router.delete("/comment/:commentId", (req, res) => {
  const { commentId } = req.params;
  const { userId, blogId } = req.body; // Need userId to verify ownership

  // 1. Verify ownership (optional but recommended security)
  db.query("SELECT Userid FROM comment_table WHERE Commentid = ?", [commentId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(404).json({ message: "Comment not found" });

    // Allow if user matches 
    if (rows[0].Userid != userId) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    // 2. Delete comment
    db.query("DELETE FROM comment_table WHERE Commentid = ?", [commentId], (err2) => {
      if (err2) return res.status(500).json({ message: "Delete failed" });

      // 3. Decrement comment count
      db.query("UPDATE BlogTable SET Comment_count = Comment_count - 1 WHERE BlogId = ?", [blogId], (err3) => {
        res.json({ success: true, message: "Comment deleted" });
      });
    });
  });
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



// ===================================================
// CHECK & INCREMENT PDF DOWNLOAD
// ===================================================
router.post("/download-pdf/:userId", (req, res) => {
  const { userId } = req.params;

  // First get user info
  db.query(
    "SELECT User_Role, Pdf_Download_Count FROM users WHERE UserId = ?",
    [userId],
    (err, users) => {
      if (err || users.length === 0) {
        return res.status(500).json({ allowed: false, message: "User not found" });
      }

      const user = users[0];
      const role = user.User_Role?.toLowerCase();
      const downloadCount = user.Pdf_Download_Count || 0;

      // Admin - unlimited
      if (role === "admin") {
        db.query("UPDATE users SET Pdf_Download_Count = Pdf_Download_Count + 1 WHERE UserId = ?", [userId]);
        return res.json({ allowed: true });
      }

      // Client - check subscription
      if (role === "client") {
        db.query(
          `SELECT * FROM Sub_Purchase_Table 
           WHERE Userid = ? AND Status = 'active' AND End_date >= CURDATE() 
           LIMIT 1`,
          [userId],
          (err2, subs) => {
            if (err2 || subs.length === 0) {
              return res.json({ allowed: false, message: "You need an active subscription to download" });
            }
            db.query("UPDATE users SET Pdf_Download_Count = Pdf_Download_Count + 1 WHERE UserId = ?", [userId]);
            return res.json({ allowed: true });
          }
        );
        return;
      }

      // Member - only 2 free downloads
      if (role === "member") {
        if (downloadCount >= 2) {
          return res.json({
            allowed: false,
            message: "You have used your 2 free downloads. Please subscribe to download more."
          });
        }
        db.query("UPDATE users SET Pdf_Download_Count = Pdf_Download_Count + 1 WHERE UserId = ?", [userId]);
        return res.json({ allowed: true, remaining: 1 - downloadCount });
      }

      // Unknown role
      return res.json({ allowed: false, message: "Please login to download" });
    }
  );
});

// ===================================================
// DELETE BLOG (User deletes their own blog)
// ===================================================
router.delete("/:id", (req, res) => {
  const blogId = req.params.id;
  const { userId } = req.body; // Pass userId in body to verify

  // 1. Verify ownership
  db.query("SELECT Userid FROM BlogTable WHERE BlogId = ?", [blogId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(404).json({ message: "Blog not found" });

    if (String(rows[0].Userid) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own blogs" });
    }

    // 2. Delete the blog
    db.query("DELETE FROM BlogTable WHERE BlogId = ?", [blogId], (err2) => {
      if (err2) {
        console.error("Delete blog failed:", err2);
        return res.status(500).json({ message: "Delete failed" });
      }
      res.json({ success: true, message: "Blog deleted successfully" });
    });
  });
});

module.exports = router;
