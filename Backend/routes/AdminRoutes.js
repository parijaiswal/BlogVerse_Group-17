const express = require("express");
const router = express.Router();
const db = require("../Database");

/* ======================================================
   ADMIN → ADD BLOG (DIRECT PUBLISH)
====================================================== */
router.post("/admin-add-blog", async (req, res) => {
  const { title, content, visibility, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await db.query(
      `INSERT INTO BlogTable
(Userid, Title, Content, Create_Date, Update_Date, Visibility, Status)
VALUES (?, ?, ?, NOW(), NOW(), ?, 'approved');`,
      [userId, title, content, visibility || "public"]
    );

    res.json({
      success: true,
      message: "Blog published successfully",
    });
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
      `SELECT 
         SubId,
         SubName,
         SubDuration,
         SubPrice,
         Visibility
       FROM SubscriptionTable
       ORDER BY SubId DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch subscriptions error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ======================================================
   CLIENT → ADD BLOG (SUBSCRIPTION + APPROVAL)
====================================================== */
router.post("/add-blog", async (req, res) => {
  const { title, content, visibility, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    // subscription check
    const [subs] = await db.query(
      `SELECT *
       FROM Sub_Purchase_Table
       WHERE Userid = ?
         AND Status = 'active'
         AND End_date >= CURDATE()
       ORDER BY Purchaseid DESC
       LIMIT 1`,
      [userId]
    );

    if (subs.length === 0) {
      return res.status(403).json({
        message: "You need an active subscription to publish a blog",
      });
    }

    await db.query(
      `INSERT INTO BlogTable
(Userid, Title, Content, Create_Date, Update_Date, Visibility, Status)
VALUES (?, ?, ?, NOW(), NOW(), ?, 'pending');`,
      [userId, title, content, visibility || "public"]
    );

    res.json({
      success: true,
      message: "Blog submitted for admin approval",
    });
  } catch (err) {
    console.error("Client add blog error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   ADMIN → VIEW PENDING BLOGS
====================================================== */
router.get("/pending-blogs", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT BlogId, Title, Status, Update_Date
       FROM BlogTable
       WHERE Status = 'pending'
       ORDER BY Update_Date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   ADMIN → APPROVE BLOG
====================================================== */
router.put("/approve-blog/:id", async (req, res) => {
  await db.query(
    `UPDATE BlogTable SET Status = 'approved' WHERE BlogId = ?`,
    [req.params.id]
  );
  res.json({ success: true });
});

/* ======================================================
   ADMIN → REJECT BLOG
====================================================== */
router.put("/reject-blog/:id", async (req, res) => {
  await db.query(
    `UPDATE BlogTable SET Status = 'rejected' WHERE BlogId = ?`,
    [req.params.id]
  );
  res.json({ success: true });
});

/* ======================================================
   CLIENT → MY BLOGS (PENDING / APPROVED / REJECTED)
====================================================== */
router.get("/client-blogs/:userId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT BlogId, Title, Status, Update_Date
     FROM BlogTable
     WHERE Userid = ?
     ORDER BY Update_Date DESC`,
    [req.params.userId]
  );
  res.json(rows);
});

/* ======================================================
   CLIENT → VIEW SUBSCRIPTION
====================================================== */
router.get("/client-subscription/:userId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.SubName, s.SubDuration, s.SubPrice,
            sp.Start_date, sp.End_date, sp.Status
     FROM Sub_Purchase_Table sp
     JOIN SubscriptionTable s ON sp.Subid = s.SubId
     WHERE sp.Userid = ?
     ORDER BY sp.Purchaseid DESC
     LIMIT 1`,
    [req.params.userId]
  );

  if (rows.length === 0) {
    return res.json({ message: "No active subscription found" });
  }

  res.json(rows[0]);
});
/* ======================================================
   CLIENT → BLOG STATS (DASHBOARD SUMMARY)
====================================================== */
router.get("/client-blog-stats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(Status = 'approved') AS approved,
        SUM(Status = 'pending') AS pending,
        SUM(Status = 'rejected') AS rejected
       FROM BlogTable
       WHERE Userid = ?`,
      [userId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Blog stats error:", err);
    res.status(500).json({ message: "Database error" });
  }
});
//---------------------------------------------------------
router.get("/admin-blog-stats", async (req, res) => {
  try {
    const [[total]] = await db.query(
      "SELECT COUNT(*) AS count FROM BlogTable"
    );

    const [[pending]] = await db.query(
      "SELECT COUNT(*) AS count FROM BlogTable WHERE Status = 'pending'"
    );

    const [[approved]] = await db.query(
      "SELECT COUNT(*) AS count FROM BlogTable WHERE Status = 'approved'"
    );

    const [[rejected]] = await db.query(
      "SELECT COUNT(*) AS count FROM BlogTable WHERE Status = 'rejected'"
    );

    res.json({
      total: total.count,
      pending: pending.count,
      approved: approved.count,
      rejected: rejected.count,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


module.exports = router;
