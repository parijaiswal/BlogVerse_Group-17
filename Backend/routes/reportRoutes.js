const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const QuickChart = require('quickchart-js');
const db = require("../Database"); // Import promised-based DB connection
const generatePDF = require("../utils/pdfGenerator");

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

/* ======================================================
   REPORTS → DOWNLOAD PDF VIA PUPPETEER
====================================================== */
router.post("/download-pdf", async (req, res) => {
  try {
    const { reportType, reportData, isChartOnly } = req.body;
    
    if (!reportType || !reportData || !Array.isArray(reportData)) {
      return res.status(400).json({ message: "Invalid report data" });
    }

    const today = new Date().toLocaleDateString();
    
    let title = "";
    let tableHeaders = "";
    let tableRows = "";

    // Read and convert logo to base64
    let logoBase64 = "";
    try {
      // Path relative to where backend is running (assuming user starts from 'backend' dir)
      const logoPath = path.join(process.cwd(), "../frontend/src/assets/logo.png");
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
      }
    } catch (err) {
      console.warn("Could not load logo for PDF:", err);
    }

    // Initialize Chart
    const chart = new QuickChart();
    
    // If it's a chart-only PDF, make the chart large and high resolution
    if (isChartOnly) {
      chart.setWidth(800);
      chart.setHeight(400);
    } else {
      chart.setWidth(600);
      chart.setHeight(300);
    }
    
    let chartUrl = "";

    // Generate HTML rows and Charts based on reportType
    if (reportType === "top-blogs") {
      title = "Top Performing Blogs Report";
      
      if (isChartOnly) {
        // Setup Chart Data (Top 5 for chart readability)
        const chartLabels = reportData.slice(0, 5).map(item => item.Title.length > 20 ? item.Title.substring(0, 20) + "..." : item.Title);
        const chartData = reportData.slice(0, 5).map(item => item.TotalLikesReceived || item.Like_count || 0);
        chart.setConfig({
          type: 'bar',
          data: { labels: chartLabels, datasets: [{ label: 'Likes', data: chartData, backgroundColor: '#2563eb' }] },
          options: { plugins: { title: { display: true, text: 'Top 5 Blogs by Likes' } } }
        });
        chartUrl = chart.getUrl();
      } else {
        tableHeaders = `
          <tr>
            <th>Rank</th>
            <th>Blog Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Likes</th>
            <th>Publish Date</th>
          </tr>
        `;
        tableRows = reportData.map((item, index) => `
          <tr>
            <td><strong>#${index + 1}</strong></td>
            <td>${item.Title.length > 50 ? item.Title.substring(0, 50) + "..." : item.Title}</td>
            <td>${item.Author || item.Username || "Unknown"}</td>
            <td>${item.Category || "N/A"}</td>
            <td style="color: #2563eb; font-weight: 600;">${item.TotalLikesReceived || item.Like_count || 0} Likes</td>
            <td>${new Date(item.Create_Date).toLocaleDateString()}</td>
          </tr>
        `).join("");
      }
    } else if (reportType === "revenue") {
      title = "Subscription Revenue Report";

      if (isChartOnly) {
        const chartLabels = reportData.map(item => item.PlanName);
        const chartData = reportData.map(item => item.TotalRevenue || 0);
        chart.setConfig({
          type: 'bar',
          data: { labels: chartLabels, datasets: [{ label: 'Revenue (₹)', data: chartData, backgroundColor: '#10b981' }] },
          options: { plugins: { title: { display: true, text: 'Revenue by Plan' } } }
        });
        chartUrl = chart.getUrl();
      } else {
        tableHeaders = `
          <tr>
            <th>Rank</th>
            <th>Plan Name</th>
            <th>Price per Plan</th>
            <th>Total Subscribers</th>
            <th>Total Revenue</th>
          </tr>
        `;
        tableRows = reportData.map((item, index) => `
          <tr>
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${item.PlanName}</strong></td>
            <td>&#8377;${item.Price}</td>
            <td style="color: #2563eb; font-weight: 600;">${item.TotalSubscribers} Users</td>
            <td style="color: #10b981; font-weight: bold;">&#8377;${item.TotalRevenue}</td>
          </tr>
        `).join("");
      }
    } else if (reportType === "top-authors") {
      title = "Top Contributing Authors Report";

      if (isChartOnly) {
        const chartLabels = reportData.slice(0, 5).map(item => item.AuthorName);
        const chartData = reportData.slice(0, 5).map(item => item.TotalBlogsPublished || 0);
        chart.setConfig({
          type: 'bar',
          data: { labels: chartLabels, datasets: [{ label: 'Blogs Published', data: chartData, backgroundColor: '#2563eb' }] },
          options: { plugins: { title: { display: true, text: 'Top 5 Authors by Blogs' } } }
        });
        chartUrl = chart.getUrl();
      } else {
        tableHeaders = `
          <tr>
            <th>Rank</th>
            <th>Author Name</th>
            <th>Role</th>
            <th>Total Blogs Published</th>
            <th>Total Likes Received</th>
          </tr>
        `;
        tableRows = reportData.map((item, index) => `
          <tr>
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${item.AuthorName}</strong></td>
            <td>${item.Role}</td>
            <td>${item.TotalBlogsPublished}</td>
            <td style="color: #2563eb; font-weight: 600;">${item.TotalLikesReceived || 0} Likes</td>
          </tr>
        `).join("");
      }
    } else {
      return res.status(400).json({ message: "Unknown report type" });
    }

    // Build full HTML Document
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
          }
          .header-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #2563eb; /* BlogVerse Blue theme */
            padding-bottom: 15px;
            margin-bottom: 20px;
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
          .title {
            font-size: 16px;
            font-weight: bold;
            color: #334155;
            margin: 0 0 5px 0;
          }
          .date {
            font-size: 10px;
            color: #94a3b8;
          }
          
          .chart-container {
            text-align: center;
            margin-top: 40px;
            margin-bottom: 30px;
          }
          .chart-img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            text-align: left;
            margin-top: 10px;
          }
          th {
            background-color: #f8fafc;
            color: #334155;
            padding: 10px;
            font-weight: 600;
            border-bottom: 2px solid #cbd5e1;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            font-size: 10px;
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
            <h2 class="title">${isChartOnly ? "Graphical Analysis: " : "Report: "}${title}</h2>
          </div>
        </div>

        ${isChartOnly && chartUrl ? `
        <div class="chart-container">
          <img src="${chartUrl}" class="chart-img" alt="Report Chart" />
        </div>
        ` : ''}
        
        ${!isChartOnly ? `
        <table>
          <thead>
            ${tableHeaders}
          </thead>
          <tbody>
            ${tableRows}
            ${reportData.length === 0 ? '<tr><td colspan="6" style="text-align:center;">No data available</td></tr>' : ''}
          </tbody>
        </table>
        ` : ''}

        <div class="footer">
          Generated on: ${today}
        </div>
      </body>
      </html>
    `;

    // Call Puppeteer utility
    const pdfBuffer = await generatePDF(htmlContent);

    // Send PDF buffer as response
    res.setHeader('Content-Type', 'application/pdf');
    const filename = "BlogVerse_" + reportType + "_" + today.replace(/\//g, '-') + ".pdf";
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

module.exports = router;
