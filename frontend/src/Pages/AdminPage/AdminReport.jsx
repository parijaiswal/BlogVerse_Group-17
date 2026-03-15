import React, { useState, useEffect } from "react";
import "./AdminReport.css";
import { FaFileDownload, FaChartLine, FaRegMoneyBillAlt, FaUsers } from "react-icons/fa";
import axios from "axios";
import API_BASE from "../../config";

const AdminReport = () => {
  const [reportType, setReportType] = useState("top-blogs"); // 'top-blogs' | 'revenue'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingChartPdf, setIsGeneratingChartPdf] = useState(false);

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

  // Request PDF from backend Puppeteer endpoint
  const generatePDF = async (isChartOnly = false) => {
    if (reportData.length === 0) return;
    
    if (isChartOnly) {
      setIsGeneratingChartPdf(true);
    } else {
      setIsGeneratingPdf(true);
    }

    try {
      // Send the report data AND the specific reportType AND the isChartOnly flag to the backend
      const response = await axios.post(`${API_BASE}/api/reports/download-pdf`, {
        reportType,
        reportData,
        isChartOnly
      }, {
        responseType: 'blob' // Important: Expect a binary blob in return
      });

      // Create a temporary URL for the received PDF blob and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BlogVerse_${reportType}_${isChartOnly ? 'Chart' : 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      if (isChartOnly) {
        setIsGeneratingChartPdf(false);
      } else {
        setIsGeneratingPdf(false);
      }
    }
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="download-pdf-btn" onClick={() => generatePDF(false)} disabled={loading || isGeneratingPdf || isGeneratingChartPdf || reportData.length === 0}>
            <FaFileDownload size={18} />
            {isGeneratingPdf ? "Generating PDF..." : "Download Report"}
          </button>
          
          <button className="download-pdf-btn" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} onClick={() => generatePDF(true)} disabled={loading || isGeneratingPdf || isGeneratingChartPdf || reportData.length === 0}>
            <FaFileDownload size={18} />
            {isGeneratingChartPdf ? "Generating..." : "Download Chart"}
          </button>
        </div>
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
