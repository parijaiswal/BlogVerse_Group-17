import React, { useState, useEffect } from "react";
import "./AdminReport.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileDownload, FaChartLine, FaRegMoneyBillAlt, FaUsers } from "react-icons/fa";
import axios from "axios";
import API_BASE from "../../config";

const AdminReport = () => {
  const [reportType, setReportType] = useState("top-blogs"); // 'top-blogs' | 'revenue'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch report data on component mount or report type change
  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let endpoint = "";
      if (reportType === "top-blogs") endpoint = "/api/reports/top-blogs";
      else if (reportType === "revenue") endpoint = "/api/reports/revenue";
      else if (reportType === "top-authors") endpoint = "/api/reports/top-authors";

      const response = await axios.get(`${API_BASE}${endpoint}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF dynamically based on report type
  const generatePDF = () => {
    const doc = new jsPDF("l", "mm", "a4"); 
    
    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); 
    doc.text("BlogVerse", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); 
    const title = reportType === "top-blogs" ? "Top Performing Blogs Report" : 
                  reportType === "revenue" ? "Subscription Revenue Report" : 
                  "Top Contributing Authors Report";
    doc.text(title, 14, 30);
    
    // Add filtering context & date
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString();
    doc.text(`Generated on: ${today}`, 14, 38);

    // Dynamic Columns and Rows
    let tableColumn = [];
    const tableRows = [];

    if (reportType === "top-blogs") {
      tableColumn = ["Rank", "Blog Title", "Author", "Category", "Likes", "Comments", "Publish Date"];
      reportData.forEach((item, index) => {
        tableRows.push([
          `#${index + 1}`,
          item.Title.length > 40 ? item.Title.substring(0, 40) + "..." : item.Title,
          item.Author,
          item.Category || "N/A",
          item.Like_count || 0,
          item.Comment_count || 0,
          new Date(item.Create_Date).toLocaleDateString()
        ]);
      });
    } else if (reportType === "revenue") {
      tableColumn = ["Rank", "Plan Name", "Price per Plan", "Total Subscribers", "Total Revenue"];
      reportData.forEach((item, index) => {
        tableRows.push([
          `#${index + 1}`,
          item.PlanName,
          `₹${item.Price}`,
          item.TotalSubscribers,
          `₹${item.TotalRevenue}`
        ]);
      });
    } else if (reportType === "top-authors") {
      tableColumn = ["Rank", "Author Name", "Role", "Total Blogs Published", "Total Likes Received"];
      reportData.forEach((item, index) => {
        tableRows.push([
          `#${index + 1}`,
          item.AuthorName,
          item.Role,
          item.TotalBlogsPublished,
          item.TotalLikesReceived || 0
        ]);
      });
    }

    import("jspdf-autotable").then(({ default: autoTable }) => {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          cellPadding: 4,
          textColor: [51, 65, 85]
        },
        headStyles: { 
          fillColor: [37, 99, 235], 
          textColor: 255, 
          fontStyle: 'bold' 
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] 
        },
        didDrawPage: function (data) {
          doc.setDrawColor(226, 232, 240);
          doc.line(14, doc.internal.pageSize.height - 15, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 15);
          
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184); 
          doc.text(
            "BlogVerse Software Development Project 2026",
            14,
            doc.internal.pageSize.height - 8
          );
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width - 25,
            doc.internal.pageSize.height - 8
          );
        }
      });

      doc.save(`BlogVerse_${reportType}_${today.replace(/\//g, '-')}.pdf`);
    });
  };

  const renderTopBlogsTable = () => (
    <table className="report-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Blog Title</th>
          <th>Author</th>
          <th>Category</th>
          <th>Likes</th>
          <th>Publish Date</th>
        </tr>
      </thead>
      <tbody>
        {reportData.map((item, index) => (
          <tr key={`blog-${item.BlogId || index}`}>
            <td><strong style={{ color: '#2563eb' }}>#{index + 1}</strong></td>
            <td className="table-title">{item.Title}</td>
            <td>{item.Author} <span style={{fontSize: "12px", color: "#666"}}>({item.Role})</span></td>
            <td>{item.Category || "N/A"}</td>
            <td>
              <span className="metric-badge">{item.TotalLikesReceived || item.Like_count || 0} Likes</span>
            </td>
            <td>{new Date(item.Create_Date).toLocaleDateString()}</td>
          </tr>
        ))}
        {reportData.length === 0 && (
          <tr><td colSpan="6" className="no-data">No top performing blogs found.</td></tr>
        )}
      </tbody>
    </table>
  );

  const renderTopAuthorsTable = () => (
    <table className="report-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Author Name</th>
          <th>Role</th>
          <th>Total Blogs Published</th>
          <th>Total Likes Received</th>
        </tr>
      </thead>
      <tbody>
        {reportData.map((item, index) => (
          <tr key={`author-${item.UserId || index}`}>
            <td><strong style={{ color: '#2563eb' }}>#{index + 1}</strong></td>
            <td><strong>{item.AuthorName}</strong></td>
            <td>{item.Role}</td>
            <td>{item.TotalBlogsPublished}</td>
            <td>
              <span className="metric-badge">{item.TotalLikesReceived || 0} Likes</span>
            </td>
          </tr>
        ))}
        {reportData.length === 0 && (
          <tr><td colSpan="5" className="no-data">No contributing authors found.</td></tr>
        )}
      </tbody>
    </table>
  );

  const renderRevenueTable = () => (
    <table className="report-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Plan Name</th>
          <th>Price per Plan</th>
          <th>Total Subscribers</th>
          <th>Total Revenue</th>
        </tr>
      </thead>
      <tbody>
        {reportData.map((item, index) => (
          <tr key={`rev-${item.SubId || index}`}>
            <td><strong style={{ color: '#2563eb' }}>#{index + 1}</strong></td>
            <td><strong>{item.PlanName}</strong></td>
            <td>&#8377;{item.Price}</td>
            <td>
              <span className="metric-badge">{item.TotalSubscribers} Users</span>
            </td>
            <td><strong style={{ color: '#10b981' }}>&#8377;{item.TotalRevenue}</strong></td>
          </tr>
        ))}
        {reportData.length === 0 && (
          <tr><td colSpan="5" className="no-data">No subscription data found.</td></tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="admin-report-container">
      <div className="report-header">
        <div>
          <h2>Performance Reports</h2>
          <p>Analyze platform engagement and generate system revenue reports.</p>
        </div>
        
        <button className="download-pdf-btn" onClick={generatePDF} disabled={loading || reportData.length === 0}>
          <FaFileDownload size={18} />
          Download PDF
        </button>
      </div>

      <div className="report-controls">
        <div className="report-tabs">
          <button 
            className={`report-tab-btn ${reportType === 'top-blogs' ? 'active' : ''}`}
            onClick={() => setReportType('top-blogs')}
          >
            <FaChartLine /> Top Performing Blogs
          </button>

          <button 
            className={`report-tab-btn ${reportType === 'top-authors' ? 'active' : ''}`}
            onClick={() => setReportType('top-authors')}
          >
            <FaUsers /> Top Contributing Authors
          </button>
          
          <button 
            className={`report-tab-btn ${reportType === 'revenue' ? 'active' : ''}`}
            onClick={() => setReportType('revenue')}
          >
            <FaRegMoneyBillAlt /> Subscription Revenue
          </button>
        </div>
        
        <div className="report-summary">
          <span>Records Found: <strong>{reportData.length}</strong></span>
        </div>
      </div>

      <div className="report-table-wrapper">
        {loading ? (
          <div className="report-loading">Generating Analytics...</div>
        ) : (
          reportType === "top-blogs" ? renderTopBlogsTable() :
          reportType === "top-authors" ? renderTopAuthorsTable() :
          renderRevenueTable()
        )}
      </div>
    </div>
  );
};

export default AdminReport;
