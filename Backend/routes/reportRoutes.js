const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const QuickChart = require('quickchart-js');
const db = require("../Database");
const generatePDF = require("../utils/pdfGenerator");

/* ======================================================
   HELPER: Build a QuickChart URL
====================================================== */
function buildChartUrl(type, labels, data, label, color, title, width = 700, height = 320) {
  const chart = new QuickChart();
  chart.setWidth(width);
  chart.setHeight(height);
  chart.setVersion("2");
  chart.setConfig({
    type,
    data: { labels, datasets: [{ label, data, backgroundColor: color }] },
    options: {
      plugins: { title: { display: true, text: title, font: { size: 16 } } },
      scales: { y: { beginAtZero: true } }
    }
  });
  return chart.getUrl();
}

/* ======================================================
   REPORTS → TOP PERFORMING BLOGS
====================================================== */
router.get("/top-blogs", async (req, res) => {
  const { startDate, endDate } = req.query;
  let whereClause = "WHERE b.Status = 'approved' AND b.Visibility = 'public'";
  const params = [];

  if (startDate) { whereClause += " AND b.Create_Date >= ?"; params.push(startDate); }
  if (endDate) { whereClause += " AND b.Create_Date <= ?"; params.push(endDate); }

  const sql = `
    SELECT b.BlogId, b.Title, b.Category, b.Create_Date, b.Like_count, b.Comment_count,
           u.Username AS Author, u.User_Role AS Role
    FROM BlogTable b
    JOIN users u ON b.Userid = u.UserId
    ${whereClause}
    ORDER BY b.Like_count DESC
    LIMIT 50
  `;
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Top blogs report error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ======================================================
   REPORTS → SUBSCRIPTION REVENUE
====================================================== */
router.get("/revenue", async (req, res) => {
  const { startDate, endDate } = req.query;
  let dateConditions = "";
  const params = [];
  if (startDate) { dateConditions += " AND sp.Start_date >= ?"; params.push(startDate); }
  if (endDate) { dateConditions += " AND sp.Start_date <= ?"; params.push(endDate); }

  const sql = `
    SELECT s.SubId, s.SubName AS PlanName, s.SubPrice AS Price,
           COUNT(sp.Purchaseid) AS TotalSubscribers,
           COALESCE(SUM(IF(sp.Purchaseid IS NOT NULL, s.SubPrice, 0)), 0) AS TotalRevenue
    FROM SubscriptionTable s
    LEFT JOIN Sub_Purchase_Table sp ON s.SubId = sp.Subid ${dateConditions}
    GROUP BY s.SubId, s.SubName, s.SubPrice
    ORDER BY TotalSubscribers DESC, TotalRevenue DESC
  `;
  try {
    const [rows] = await db.query(sql, params);
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
    SELECT u.UserId, u.Username AS AuthorName, u.User_Role AS Role,
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

/* ======================================================
   REPORTS → CATEGORY PERFORMANCE
====================================================== */
router.get("/category-performance", async (req, res) => {
  const { startDate, endDate } = req.query;
  let whereClause = "WHERE b.Status = 'approved' AND b.Visibility = 'public'";
  const params = [];

  if (startDate) { whereClause += " AND b.Create_Date >= ?"; params.push(startDate); }
  if (endDate) { whereClause += " AND b.Create_Date <= ?"; params.push(endDate); }

  const sql = `
    SELECT b.Category,
           COUNT(b.BlogId) AS TotalBlogs,
           SUM(b.Like_count) AS TotalLikes,
           SUM(b.Comment_count) AS TotalComments,
           ROUND(AVG(b.Like_count), 1) AS AvgLikes
    FROM BlogTable b
    ${whereClause}
    GROUP BY b.Category
    ORDER BY TotalLikes DESC
  `;
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Category performance report error:", err);
    res.status(500).json({ message: "Database error" });
  }
});
/* ======================================================
   REPORTS → MONTHLY TRENDS
====================================================== */
router.get("/monthly-trends", async (req, res) => {
  const { startDate, endDate } = req.query;
  let whereClause = "WHERE b.Status = 'approved' AND b.Visibility = 'public'";
  const params = [];

  if (startDate) { whereClause += " AND b.Create_Date >= ?"; params.push(startDate); }
  if (endDate) { whereClause += " AND b.Create_Date <= ?"; params.push(endDate); }

  const sql = `
    SELECT DATE_FORMAT(b.Create_Date, '%b %Y') AS Month,
           DATE_FORMAT(b.Create_Date, '%Y-%m') AS SortKey,
           COUNT(b.BlogId) AS TotalBlogs,
           SUM(b.Like_count) AS TotalLikes
    FROM BlogTable b
    ${whereClause}
    GROUP BY Month, SortKey
    ORDER BY SortKey ASC
    LIMIT 24
  `;
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Monthly trends report error:", err);
    res.status(500).json({ message: "Database error" });
  }
});
/* ======================================================
   REPORTS → DOWNLOAD PDF (Chart + Table combined)
====================================================== */
router.post("/download-pdf", async (req, res) => {
  try {
    const { reportType, reportData } = req.body;

    if (!reportType || !reportData || !Array.isArray(reportData)) {
      return res.status(400).json({ message: "Invalid report data" });
    }
    const today = new Date().toLocaleDateString();
    let title = "";
    let tableHeaders = "";
    let tableRows = "";
    let chartUrl = "";

    // Read logo
    let logoBase64 = "";
    try {
      const logoPath = path.join(process.cwd(), "../frontend/src/assets/logo.png");
      if (fs.existsSync(logoPath)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
      }
    } catch (err) { console.warn("Could not load logo:", err); }

    if (reportType === "top-blogs") {
      title = "Top Performing Blogs Report";
      const top5 = reportData.slice(0, 5);
      chartUrl = buildChartUrl('bar',
        top5.map(i => i.Title.length > 20 ? i.Title.substring(0, 20) + "..." : i.Title),
        top5.map(i => i.Like_count || 0),
        'Likes', '#2563eb', 'Top 5 Blogs by Likes'
      );
      tableHeaders = `<tr><th>Rank</th><th>Blog Title</th><th>Author</th><th>Category</th><th>Likes</th><th>Publish Date</th></tr>`;
      tableRows = reportData.map((item, i) => `
        <tr>
          <td><strong>${i + 1}</strong></td>
          <td>${item.Title.length > 50 ? item.Title.substring(0, 50) + "..." : item.Title}</td>
          <td>${item.Author || "Unknown"}</td>
          <td>${item.Category || "N/A"}</td>
          <td>${item.Like_count || 0} Likes</td>
          <td>${new Date(item.Create_Date).toLocaleDateString()}</td>
        </tr>
      `).join("");
    } else if (reportType === "revenue") {
      title = "Subscription Revenue Report";
      chartUrl = buildChartUrl('bar',
        reportData.map(i => i.PlanName),
        reportData.map(i => i.TotalRevenue || 0),
        'Revenue (₹)', '#10b981', 'Revenue by Subscription Plan'
      );
      tableHeaders = `<tr><th>Rank</th><th>Plan Name</th><th>Price</th><th>Subscribers</th><th>Total Revenue</th></tr>`;
      tableRows = reportData.map((item, i) => `
        <tr>
          <td><strong>${i + 1}</strong></td>
          <td><strong>${item.PlanName}</strong></td>
          <td>&#8377;${item.Price}</td>
          <td>${item.TotalSubscribers} Users</td>
          <td>&#8377;${item.TotalRevenue}</td>
        </tr>
      `).join("");

    } else if (reportType === "top-authors") {
      title = "Top Contributing Authors Report";
      const top5 = reportData.slice(0, 5);
      chartUrl = buildChartUrl('bar',
        top5.map(i => i.AuthorName),
        top5.map(i => i.TotalBlogsPublished || 0),
        'Blogs Published', '#8b5cf6', 'Top 5 Authors by Blogs Published'
      );
      tableHeaders = `<tr><th>Rank</th><th>Author</th><th>Role</th><th>Blogs Published</th><th>Total Likes</th></tr>`;
      tableRows = reportData.map((item, i) => `
        <tr>
          <td><strong>${i + 1}</strong></td>
          <td><strong>${item.AuthorName}</strong></td>
          <td>${item.Role}</td>
          <td>${item.TotalBlogsPublished}</td>
          <td>${item.TotalLikesReceived || 0} Likes</td>
        </tr>
      `).join("");

    } else if (reportType === "category-performance") {
      title = "Category Performance Report";
      chartUrl = buildChartUrl('bar',
        reportData.map(i => i.Category || "Uncategorized"),
        reportData.map(i => i.TotalLikes || 0),
        'Total Likes', '#f59e0b', 'Likes by Category'
      );
      tableHeaders = `<tr><th>Rank</th><th>Category</th><th>Total Blogs</th><th>Total Likes</th><th>Total Comments</th><th>Avg Likes</th></tr>`;
      tableRows = reportData.map((item, i) => `
        <tr>
          <td><strong>${i + 1}</strong></td>
          <td><strong>${item.Category || "Uncategorized"}</strong></td>
          <td>${item.TotalBlogs}</td>
          <td>${item.TotalLikes || 0}</td>
          <td>${item.TotalComments || 0}</td>
          <td>${item.AvgLikes || 0}</td>
        </tr>
      `).join("");
    } else if (reportType === "monthly-trends") {
      title = "Monthly Blog Trends Report";
      chartUrl = buildChartUrl('line',
        reportData.map(i => i.Month),
        reportData.map(i => i.TotalBlogs || 0),
        'Blogs Published', '#2563eb', 'Blogs Published Per Month'
      );
      tableHeaders = `<tr><th>Month</th><th>Blogs Published</th><th>Total Likes</th></tr>`;
      tableRows = reportData.map(item => `
        <tr>
          <td><strong>${item.Month}</strong></td>
          <td>${item.TotalBlogs}</td>
          <td>${item.TotalLikes || 0}</td>
        </tr>
      `).join("");

    } else {
      return res.status(400).json({ message: "Unknown report type" });
    }

    // Build summary row for revenue report - Total Revenue only
    let summaryRow = "";
    if (reportType === "revenue" && reportData.length > 0) {
      const totalRevenue = reportData.reduce((sum, i) => sum + Number(i.TotalRevenue || 0), 0);
      summaryRow = `
        <tr class="total-row">
          <td colspan="4" style="text-align:right;padding:10px;">Total Revenue</td>
          <td style="padding:10px;">&#8377;${totalRevenue}</td>
        </tr>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            padding: 32px 36px;
          }

          /* ---- HEADER ---- */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 28px;
            padding-bottom: 18px;
            border-bottom: 2px solid #2563eb;
          }
          .brand-block { display: flex; align-items: center; gap: 14px; }
          .logo { width: 52px; height: auto; }
          .brand-name {
            font-size: 22px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: -0.5px;
          }
          .brand-sub {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
            line-height: 1.6;
          }
          .report-meta { text-align: right; }
          .report-meta .report-name {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
          }
          .report-meta .report-date {
            font-size: 10px;
            color: #64748b;
            margin-top: 4px;
          }

          /* ---- TABLE ---- */
          .section-label {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            margin: 22px 0 8px 0;
            padding-left: 10px;
            border-left: 4px solid #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          thead tr {
            background: #2563eb;
            color: #fff;
          }
          thead th {
            padding: 10px 12px;
            font-weight: 600;
            text-align: left;
            letter-spacing: 0.3px;
          }
          tbody tr { background: #ffffff; }
          tbody td {
            padding: 9px 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }
          .no-data-row td {
            text-align: center;
            padding: 30px;
            color: #94a3b8;
            font-style: italic;
          }
          .total-row td {
            background: #eff6ff;
            font-weight: 700;
            border-top: 2px solid #2563eb;
            color: #1e40af;
          }

          /* ---- CHART ---- */
          .chart-section { margin-top: 30px; margin-bottom: 28px; }
          .chart-title {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
            text-align: center;
            margin-bottom: 12px;
          }
          .chart-img {
            display: block;
            margin: 0 auto;
            max-width: 100%;
            height: auto;
            border-radius: 6px;
          }

          /* ---- FOOTER ---- */
          .footer {
            margin-top: 36px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 9px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>

        <!-- HEADER -->
        <div class="header">
          <div class="brand-block">
            ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo" />` : ""}
            <div>
              <div class="brand-name">BlogVerse</div>
              <div class="brand-sub">
                Phone: 1234567899<br>
                Email: blogversewebsite@gmail.com
              </div>
            </div>
          </div>
          <div class="report-meta">
            <div class="report-name">${title}</div>
            <div class="report-date">Generated: ${today}</div>
          </div>
        </div>

        <!-- CHART (first) -->
        ${chartUrl ? `
        <div class="chart-section">
          <img src="${chartUrl}" class="chart-img" alt="Chart" />
        </div>` : ""}

        <!-- DATA TABLE (after chart) -->
        <table>
          <thead>
            ${tableHeaders}
          </thead>
          <tbody>
            ${tableRows}
            ${summaryRow}
            ${reportData.length === 0 ? '<tr class="no-data-row"><td colspan="6">No data available for this report.</td></tr>' : ""}
          </tbody>
        </table>

        <!-- FOOTER -->
        <div class="footer">
          <span>BlogVerse &bull; Confidential</span>
          <span>Generated on ${today}</span>
        </div>

      </body>
      </html>
    `;

    const pdfBuffer = await generatePDF(htmlContent);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BlogVerse_${reportType}_${today.replace(/\//g, '-')}.pdf"`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

/* ======================================================
   REPORTS → VIEW CHART URL (QUICKCHART)
====================================================== */
router.post("/view-chart", async (req, res) => {
  try {
    const { reportType, reportData } = req.body;
    if (!reportType || !reportData || !Array.isArray(reportData)) {
      return res.status(400).json({ message: "Invalid report data" });
    }

    let chartUrl = "";

    if (reportType === "top-blogs") {
      const top5 = reportData.slice(0, 5);
      chartUrl = buildChartUrl('bar',
        top5.map(i => i.Title.length > 20 ? i.Title.substring(0, 20) + "..." : i.Title),
        top5.map(i => i.Like_count || 0),
        'Likes', '#2563eb', 'Top 5 Blogs by Likes', 800, 400
      );
    } else if (reportType === "revenue") {
      chartUrl = buildChartUrl('bar',
        reportData.map(i => i.PlanName),
        reportData.map(i => i.TotalRevenue || 0),
        'Revenue (₹)', '#10b981', 'Revenue by Plan', 800, 400
      );
    } else if (reportType === "top-authors") {
      const top5 = reportData.slice(0, 5);
      chartUrl = buildChartUrl('bar',
        top5.map(i => i.AuthorName),
        top5.map(i => i.TotalBlogsPublished || 0),
        'Blogs Published', '#8b5cf6', 'Top 5 Authors by Blogs', 800, 400
      );
    } else if (reportType === "category-performance") {
      chartUrl = buildChartUrl('bar',
        reportData.map(i => i.Category || "Uncategorized"),
        reportData.map(i => i.TotalLikes || 0),
        'Total Likes', '#f59e0b', 'Likes by Category', 800, 400
      );
    } else if (reportType === "monthly-trends") {
      chartUrl = buildChartUrl('line',
        reportData.map(i => i.Month),
        reportData.map(i => i.TotalBlogs || 0),
        'Blogs Published', '#2563eb', 'Blogs Published Per Month', 800, 400
      );
    } else {
      return res.status(400).json({ message: "Unknown report type" });
    }

    res.json({ chartUrl });
  } catch (err) {
    console.error("View chart error:", err);
    res.status(500).json({ message: "Failed to generate chart URL" });
  }
});
module.exports = router;