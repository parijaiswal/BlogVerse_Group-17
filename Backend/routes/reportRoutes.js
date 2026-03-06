const express = require("express");
const router = express.Router();
const db = require("../Database"); // Import promised-based DB connection

/* ======================================================
   REPORTS → TOP PERFORMING BLOGS
====================================================== */
router.get("/top-blogs", async (req, res) => {
  const sql = `
    SELECT 
      b.BlogId, 
      b.Title, 
      b.Category, 
      b.Create_Date, 
      b.Like_count,
      b.Comment_count,
      u.Username AS Author,
      u.User_Role AS Role
    FROM BlogTable b
    JOIN users u ON b.Userid = u.UserId
    WHERE b.Status = 'approved' AND b.Visibility = 'public'
    ORDER BY b.Like_count DESC
    LIMIT 50
  `;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Top blogs report error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   REPORTS → MOST PURCHASED SUBSCRIPTIONS
====================================================== */
router.get("/revenue", async (req, res) => {
  const sql = `
    SELECT 
      s.SubId,
      s.SubName AS PlanName,
      s.SubPrice AS Price,
      COUNT(sp.Purchaseid) AS TotalSubscribers,
      COALESCE(SUM(s.SubPrice), 0) AS TotalRevenue
    FROM SubscriptionTable s
    LEFT JOIN Sub_Purchase_Table sp ON s.SubId = sp.Subid
    GROUP BY s.SubId, s.SubName, s.SubPrice
    ORDER BY TotalSubscribers DESC, TotalRevenue DESC
  `;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Revenue report error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   REPORTS → TOP CONTRIBUTING AUTHORS
====================================================== */
router.get("/top-authors", async (req, res) => {
  const sql = `
    SELECT 
      u.UserId,
      u.Username AS AuthorName,
      u.User_Role AS Role,
      COUNT(b.BlogId) AS TotalBlogsPublished,
      SUM(b.Like_count) AS TotalLikesReceived
    FROM users u
    JOIN BlogTable b ON u.UserId = b.Userid
    WHERE b.Status = 'approved' AND b.Visibility = 'public'
    GROUP BY u.UserId, u.Username, u.User_Role
    ORDER BY TotalBlogsPublished DESC, TotalLikesReceived DESC
    LIMIT 50
  `;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Top authors report error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
