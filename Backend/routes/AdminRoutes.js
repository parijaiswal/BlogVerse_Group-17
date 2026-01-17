const express = require("express");
const router = express.Router();
const db = require("../Database");

const multer = require("multer");
const path = require("path");

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = "blog-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ======================================================
   ADMIN → ADD BLOG (DIRECT PUBLISH)
====================================================== */
router.post("/admin-add-blog", upload.single("image"), async (req, res) => {
  const { title, content, visibility, userId } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await db.query(
      `INSERT INTO BlogTable
       (Userid, Title, Content, Create_Date, Update_Date, Visibility, Status, Image_path)
       VALUES (?, ?, ?, NOW(), NOW(), ?, 'approved', ?)`,
      [userId, title, content, visibility || "public", imagePath]
    );

    res.json({ success: true, message: "Blog published successfully" });
  } catch (err) {
    console.error("Admin add blog error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   ADMIN → GET ALL SUBSCRIPTIONS
====================================================== */
router.get("/subscriptions", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT SubId, SubName, SubDuration, SubPrice, Visibility
       FROM SubscriptionTable
       ORDER BY SubId DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   ADMIN → BLOG STATS (DASHBOARD)
====================================================== */
router.get("/admin-blog-stats", async (req, res) => {
  try {
    const [[total]] = await db.query("SELECT COUNT(*) AS count FROM BlogTable");
    const [[approved]] = await db.query(
      "SELECT COUNT(*) AS count FROM BlogTable WHERE Status='approved'"
    );
    const [[pending]] = await db.query(
      "SELECT COUNT(*) AS count FROM BlogTable WHERE Status='pending'"
    );
    const [[rejected]] = await db.query(
      "SELECT COUNT(*) AS count FROM BlogTable WHERE Status='rejected'"
    );

    res.json({
      total: total.count,
      approved: approved.count,
      pending: pending.count,
      rejected: rejected.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   CLIENT → ADD BLOG (SUBSCRIPTION + APPROVAL)
====================================================== */
router.post("/add-blog", upload.single("image"), async (req, res) => {
  const { title, content, visibility, userId } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [subs] = await db.query(
      `SELECT * FROM Sub_Purchase_Table
       WHERE Userid=? AND Status='active' AND End_date>=CURDATE()
       ORDER BY Purchaseid DESC LIMIT 1`,
      [userId]
    );

    if (subs.length === 0) {
      return res.status(403).json({
        message: "You need an active subscription to publish a blog",
      });
    }

    await db.query(
      `INSERT INTO BlogTable
       (Userid, Title, Content, Create_Date, Update_Date, Visibility, Status, Image_path)
       VALUES (?, ?, ?, NOW(), NOW(), ?, 'pending', ?)`,
      [userId, title, content, visibility || "public", imagePath]
    );

    res.json({
      success: true,
      message: "Blog submitted for admin approval",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   ADMIN → VIEW PENDING BLOGS
====================================================== */
router.get("/pending-blogs", async (req, res) => {
  const [rows] = await db.query(
    `SELECT BlogId, Title, Status, Update_Date
     FROM BlogTable WHERE Status='pending'
     ORDER BY Update_Date DESC`
  );
  res.json(rows);
});

/* ======================================================
   ADMIN → APPROVE / REJECT BLOG
====================================================== */
router.put("/approve-blog/:id", async (req, res) => {
  await db.query(`UPDATE BlogTable SET Status='approved' WHERE BlogId=?`, [
    req.params.id,
  ]);
  res.json({ success: true });
});

router.put("/reject-blog/:id", async (req, res) => {
  await db.query(`UPDATE BlogTable SET Status='rejected' WHERE BlogId=?`, [
    req.params.id,
  ]);
  res.json({ success: true });
});

/* ======================================================
   ADMIN → MY BLOGS (WITH IMAGE)
====================================================== */
router.get("/my-blogs/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT BlogId, Title, Content, Visibility, Status, Update_Date, Image_path
       FROM BlogTable WHERE Userid=?
       ORDER BY Update_Date DESC`,
      [adminId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   ADMIN → EDIT BLOG (FIXED IMAGE UPDATE)
====================================================== */
router.put("/edit-blog/:blogId", upload.single("image"), async (req, res) => {
  const { blogId } = req.params;
  const { title, content, visibility } = req.body;

  try {
    if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      await db.query(
        `UPDATE BlogTable
         SET Title=?, Content=?, Visibility=?, Image_path=?, Update_Date=NOW()
         WHERE BlogId=?`,
        [title, content, visibility, imagePath, blogId]
      );
    } else {
      await db.query(
        `UPDATE BlogTable
         SET Title=?, Content=?, Visibility=?, Update_Date=NOW()
         WHERE BlogId=?`,
        [title, content, visibility, blogId]
      );
    }

    res.json({ success: true, message: "Blog updated successfully" });
  } catch (err) {
    console.error("Edit blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;