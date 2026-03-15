const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Use the shared DB pool from Database.js (same as AdminRoutes.js)
const db = require("../Database");
const generatePDF = require('../utils/pdfGenerator');


// ===================================================
// ADD BLOG (already used by admin)
// ===================================================
router.post("/add-blog", async (req, res) => {
  const { title, content, visibility, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    INSERT INTO BlogTable
    (Userid, Title, Content, Update_Date, Visibility)
    VALUES (?, ?, ?, NOW(), ?)
  `;

  try {
    const [result] = await db.query(sql, [userId, title, content, visibility || "public"]);
    res.json({
      success: true,
      message: "Blog added successfully",
      blogId: result.insertId,
    });
  } catch (err) {
    console.error("Add blog error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ===================================================
// GET PUBLIC BLOGS (for home page - only public blogs)
// ===================================================
router.get("/", async (req, res) => {
  const sortOrder = req.query.sort === "oldest" ? "ASC" : "DESC";
  const sql = `
    SELECT 
      b.BlogId,
      b.Title,
      b.Content,
      b.Visibility,
      b.Category,
      b.Create_Date,
      b.Image_path,
      u.Username, 
      u.User_Role
    FROM BlogTable b
    JOIN users u ON b.Userid = u.UserId
    WHERE b.Visibility = 'public' AND b.Status = 'approved'
    ORDER BY b.Create_Date ${sortOrder}
  `;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Fetch blogs error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ===================================================
// GET ALL BLOGS (Admin - includes private blogs)
// ===================================================
router.get("/all", async (req, res) => {
  const sql = `
    SELECT 
      b.BlogId,
      b.Title,
      b.Content,
      b.Visibility,
      b.Category,
      b.Create_Date,
      b.Image_path,
      u.Username, 
      u.User_Role
    FROM BlogTable b
    JOIN users u ON b.Userid = u.UserId
    WHERE b.Status = 'approved'
    ORDER BY b.Create_Date DESC
  `;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Fetch all blogs error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ===================================================
// LIKE BLOG
// ===================================================
router.post("/:id/like", async (req, res) => {
  const blogId = req.params.id;
  try {
    await db.query("UPDATE BlogTable SET Like_count = Like_count + 1 WHERE BlogId = ?", [blogId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

router.get("/:id/likes", async (req, res) => {
  const blogId = req.params.id;
  try {
    const [rows] = await db.query("SELECT Like_count FROM BlogTable WHERE BlogId = ?", [blogId]);
    if (!rows.length) {
      return res.json({ likes: 0 });
    }
    res.json({ likes: rows[0].Like_count || 0 });
  } catch (err) {
    console.error("Get likes error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ===================================================
// ADD COMMENT
// ===================================================
router.post("/:id/comment", async (req, res) => {
  const { Userid, Comment_text } = req.body;

  if (!Userid || !Comment_text) {
    return res.status(400).json({ message: "Userid or Comment_text missing" });
  }

  try {
    await db.query(
      "INSERT INTO comment_table (Blogid, Userid, Comment_text) VALUES (?, ?, ?)",
      [req.params.id, Userid, Comment_text]
    );
    await db.query(
      "UPDATE BlogTable SET Comment_count = Comment_count + 1 WHERE Blogid = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Insert comment error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


router.get("/:id/comments", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.Commentid, c.Blogid, c.Userid, c.Comment_text, c.Comment_date, 
              u.Username, u.User_Role 
       FROM comment_table c 
       JOIN users u ON c.Userid = u.UserId 
       WHERE c.Blogid = ? 
       ORDER BY c.Comment_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ===================================================
// DELETE COMMENT
// ===================================================
router.delete("/comment/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { userId, blogId } = req.body;

  try {
    const [rows] = await db.query("SELECT Userid FROM comment_table WHERE Commentid = ?", [commentId]);
    if (rows.length === 0) return res.status(404).json({ message: "Comment not found" });

    if (rows[0].Userid != userId) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    await db.query("DELETE FROM comment_table WHERE Commentid = ?", [commentId]);
    await db.query("UPDATE BlogTable SET Comment_count = Comment_count - 1 WHERE BlogId = ?", [blogId]);
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// GET single blog by ID
router.get("/:id", async (req, res) => {
  const blogId = req.params.id;

  const sql = `
    SELECT b.BlogId, b.Title, b.Content, b.Visibility, b.Category, b.Create_Date, b.Image_path, b.Like_count, u.Username, u.User_Role
    FROM BlogTable b
    JOIN users u ON b.Userid = u.UserId
    WHERE b.BlogId = ?
  `;

  try {
    const [rows] = await db.query(sql, [blogId]);
    if (!rows.length) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch single blog error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ===================================================
// UPDATE BLOG (Admin only – frontend controlled)
// ===================================================
router.put("/:id", async (req, res) => {
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

  try {
    await db.query(sql, [title, content, visibility, blogId]);
    res.json({ success: true, message: "Blog updated successfully" });
  } catch (err) {
    console.error("Update blog error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ===================================================
// CHECK & INCREMENT PDF DOWNLOAD
// ===================================================
router.post("/download-pdf/:userId", async (req, res) => {
  const { userId } = req.params;
  const { blogId } = req.body;

  try {
    const [users] = await db.query(
      "SELECT User_Role, Pdf_Download_Count FROM users WHERE UserId = ?",
      [userId]
    );
    if (users.length === 0) {
      return res.status(500).json({ allowed: false, message: "User not found" });
    }

    const user = users[0];
    const role = user.User_Role?.toLowerCase();
    const downloadCount = user.Pdf_Download_Count || 0;

    // Admin - unlimited downloads
    if (role === "admin") {
      await db.query("UPDATE users SET Pdf_Download_Count = Pdf_Download_Count + 1 WHERE UserId = ?", [userId]);
      return res.json({ allowed: true });
    }

    // Client - check subscription
    if (role === "client") {
      const [subs] = await db.query(
        `SELECT * FROM Sub_Purchase_Table 
         WHERE Userid = ? AND Status = 'active' AND End_date >= CURDATE() 
         LIMIT 1`,
        [userId]
      );
      if (subs.length === 0) {
        return res.json({
          allowed: false,
          requiresSubscription: true,
          message: "You need an active subscription to download"
        });
      }
      await db.query("UPDATE users SET Pdf_Download_Count = Pdf_Download_Count + 1 WHERE UserId = ?", [userId]);
      return res.json({ allowed: true });
    }

    // Member - 2 free downloads, then ₹29 per PDF
    if (role === "member") {
      if (downloadCount >= 2) {
        return res.json({
          allowed: false,
          requiresPayment: true,
          pdfPrice: 29,
          message: "You have used your 2 free downloads. Pay ₹29 to download this PDF."
        });
      }
      await db.query("UPDATE users SET Pdf_Download_Count = Pdf_Download_Count + 1 WHERE UserId = ?", [userId]);
      return res.json({ allowed: true, remaining: 1 - downloadCount });
    }

    // Unknown role
    return res.json({ allowed: false, message: "Please login to download" });
  } catch (err) {
    console.error("Download PDF error:", err);
    res.status(500).json({ allowed: false, message: "Server error" });
  }
});

// ===================================================
// DELETE BLOG (User deletes their own blog)
// ===================================================
router.delete("/:id", async (req, res) => {
  const blogId = req.params.id;
  const { userId } = req.body;

  try {
    const [rows] = await db.query("SELECT Userid FROM BlogTable WHERE BlogId = ?", [blogId]);
    if (rows.length === 0) return res.status(404).json({ message: "Blog not found" });

    if (String(rows[0].Userid) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own blogs" });
    }

    await db.query("DELETE FROM BlogTable WHERE BlogId = ?", [blogId]);
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Delete blog failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/**
 * GENERATE PDF FOR A SINGLE BLOG VIA PUPPETEER
 * POST /api/blogs/generate-pdf
 */
router.post('/generate-pdf', async (req, res) => {
  try {
    const { blog } = req.body;
    
    if (!blog || !blog.Title || !blog.Content) {
      return res.status(400).json({ message: "Invalid blog data" });
    }

    // Read and convert logo to base64
    let logoBase64 = "";
    try {
      const logoPath = path.join(process.cwd(), "../frontend/src/assets/logo.png");
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
      }
    } catch (err) {
      console.warn("Could not load logo for single blog PDF:", err);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #334155;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .header-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #2563eb; /* BlogVerse Blue theme */
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .logo-company-wrapper {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          .logo {
            width: 60px;
            height: auto;
          }
          .company-info {
            text-align: left;
          }
          .brand {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb; /* BlogVerse Blue */
            margin: 0 0 5px 0;
          }
          .contact-details {
            font-size: 10px;
            color: #475569;
            line-height: 1.4;
          }
          .report-title-wrapper {
            text-align: right;
          }
          .doc-type {
            font-size: 14px;
            font-weight: bold;
            color: #334155;
            margin: 0 0 5px 0;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #0f172a;
            text-align: left;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          .meta {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 5px;
          }
          h2, h3, h4, h5, h6 {
            color: #1e293b;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          p {
            margin-bottom: 16px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            font-size: 11px;
            color: #94a3b8;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="logo-company-wrapper">
            ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="BlogVerse Logo" />` : ``}
            <div class="company-info">
              <h1 class="brand">BlogVerse</h1>
              <div class="contact-details">
                Phone: 1234567899<br>
                Email: blogversewebsite@gmail.com<br>
              </div>
            </div>
          </div>
          
          <div class="report-title-wrapper">
            <h2 class="doc-type">Official Blog Document</h2>
          </div>
        </div>
        
        <h1 class="title">${blog.Title}</h1>
        <div class="meta"><strong>Author:</strong> ${blog.Username || "Unknown"}</div>
        <div class="meta"><strong>Date:</strong> ${new Date(blog.Create_Date).toDateString()}</div>
        
        <hr style="border:0; border-top:1px solid #e2e8f0; margin: 20px 0;">
        
        <div class="content">
          ${blog.Content.replace(/\\n/g, '<br>')}
        </div>

        <div class="footer">
          Generated on: ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;

    const pdfBuffer = await generatePDF(htmlContent);

    res.setHeader('Content-Type', 'application/pdf');
    const filename = (blog.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'blog') + '.pdf';
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Single Blog PDF generation error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

module.exports = router;
