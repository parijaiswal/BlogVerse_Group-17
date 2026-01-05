const express = require("express");
const router = express.Router();
const db = require("../Database");

/* ======================================================
   CLIENT → ADD BLOG (PENDING)
====================================================== */
router.post("/add-blog", async (req, res) => {
  const { title, content, visibility, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await db.query(
      `INSERT INTO BlogTable
       (Userid, Title, Content, Update_Date, Visibility, Status)
       VALUES (?, ?, ?, NOW(), ?, 'pending')`,
      [userId, title, content, visibility || "public"]
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
  try {
    const [rows] = await db.query(
      `SELECT BlogId, Title, Status, Update_Date
       FROM BlogTable
       WHERE Status = 'pending'`
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
  try {
    await db.query(
      `UPDATE BlogTable
       SET Status = 'approved'
       WHERE BlogId = ?`,
      [req.params.id]
    );

    res.json({ success: true, message: "Blog approved" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   ADMIN → REJECT BLOG
====================================================== */
router.put("/reject-blog/:id", async (req, res) => {
  try {
    await db.query(
      `UPDATE BlogTable
       SET Status = 'rejected'
       WHERE BlogId = ?`,
      [req.params.id]
    );

    res.json({ success: true, message: "Blog rejected" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   CLIENT → VIEW OWN BLOGS (STATUS)
====================================================== */
router.get("/client-blogs/:userId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT Title, Status, Update_Date
       FROM BlogTable
       WHERE Userid = ?`,
      [req.params.userId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});
/* ======================================================
   ADMIN → VIEW SUBSCRIPTION PLANS (ADDED BY ADMIN)
====================================================== */
router.get("/subscriptions", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         SubId,
         SubName,
         SubDuration,
         SubPrice,
         Description,
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
   CLIENT → VIEW CURRENT SUBSCRIPTION
====================================================== */
router.get("/client-subscription/:userId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
          s.SubName,
          s.SubDuration,
          s.SubPrice,
          sp.Start_date,
          sp.End_date,
          sp.Status
       FROM Sub_Purchase_Table sp
       JOIN SubscriptionTable s
         ON sp.Subid = s.SubId
       WHERE sp.Userid = ?
       ORDER BY sp.Purchaseid DESC
       LIMIT 1`,
      [req.params.userId]
    );

    if (rows.length === 0) {
      return res.json({ message: "No active subscription found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});
module.exports = router;
