import React, { useState, useEffect } from "react";
import "./AdminReport.css";
import { FaFileDownload, FaChartLine, FaRegMoneyBillAlt, FaUsers, FaSearch } from "react-icons/fa";
import axios from "axios";
import API_BASE from "../../config";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

const AdminReport = () => {
  const [reportType, setReportType] = useState("top-blogs");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartUrl, setChartUrl] = useState("");
  const [loadingChart, setLoadingChart] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  // New filters for top-blogs
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  useEffect(() => {
    fetchReportData();
    setShowChart(false);
    setChartUrl("");
    setAuthorSearch("");
    setCategoryFilter("");
    setMonthFilter("");
  }, [reportType, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let endpoint = "";
      if (reportType === "top-blogs") endpoint = "/api/reports/top-blogs";
      else if (reportType === "revenue") endpoint = "/api/reports/revenue";
      else if (reportType === "top-authors") endpoint = "/api/reports/top-authors";

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_BASE}${endpoint}`, { params });
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Collect unique categories and months from blog data for filter dropdowns
  const uniqueCategories = [...new Set(reportData.map(i => i.Category).filter(Boolean))];
  const uniqueMonths = [...new Set(reportData.map(i => {
    if (!i.Create_Date) return null;
    const d = new Date(i.Create_Date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }).filter(Boolean))].sort();

  // Client-side filtering
  const filteredData = (() => {
    let data = reportData;
    if (reportType === "top-authors" && authorSearch) {
      data = data.filter(i => i.AuthorName?.toLowerCase().includes(authorSearch.toLowerCase()));
    }
    if (reportType === "top-blogs" && categoryFilter) {
      data = data.filter(i => i.Category === categoryFilter);
    }
    if (reportType === "top-blogs" && monthFilter) {
      data = data.filter(i => {
        if (!i.Create_Date) return false;
        const d = new Date(i.Create_Date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === monthFilter;
      });
    }
    return data;
  })();

  const generatePDF = async () => {
    if (filteredData.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      const response = await axios.post(`${API_BASE}/api/reports/download-pdf`, {
        reportType,
        reportData: filteredData
      }, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to generate PDF. Please try again.",
        icon: "error",
        confirmButtonColor: "#2563eb"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleViewChart = async () => {
    if (showChart) { setShowChart(false); return; }
    if (chartUrl) { setShowChart(true); return; }
    try {
      setLoadingChart(true);
      const response = await axios.post(`${API_BASE}/api/reports/view-chart`, {
        reportType, reportData: filteredData
      });
      setChartUrl(response.data.chartUrl);
      setShowChart(true);
    } catch (error) {
      console.error("Error fetching chart:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load chart.",
        icon: "error",
        confirmButtonColor: "#2563eb"
      });
    } finally {
      setLoadingChart(false);
    }
  };

  // --- Table Renderers ---
  const renderTopBlogsTable = () => (
    <table className="report-table">
      <thead>
        <tr>
          <th>Rank</th><th>Blog Title</th><th>Author</th><th>Category</th><th>Likes</th><th>Publish Date</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((item, index) => (
          <tr key={`blog-${item.BlogId || index}`}>
            <td><strong style={{ color: '#2563eb' }}>{index + 1}</strong></td>
            <td className="table-title">{item.Title}</td>
            <td>{item.Author} <span style={{ fontSize: "12px", color: "#666" }}>({item.Role})</span></td>
            <td>{item.Category || "N/A"}</td>
            <td><span className="metric-badge">{item.Like_count || 0} Likes</span></td>
            <td>{new Date(item.Create_Date).toLocaleDateString()}</td>
          </tr>
        ))}
        {filteredData.length === 0 && <tr><td colSpan="6" className="no-data">No blogs found.</td></tr>}
      </tbody>
    </table>
  );

  const renderTopAuthorsTable = () => (
    <table className="report-table">
      <thead>
        <tr><th>Rank</th><th>Author Name</th><th>Role</th><th>Blogs Published</th><th>Total Likes</th></tr>
      </thead>
      <tbody>
        {filteredData.map((item, index) => (
          <tr key={`author-${item.UserId || index}`}>
            <td><strong style={{ color: '#2563eb' }}>{index + 1}</strong></td>
            <td><strong>{item.AuthorName}</strong></td>
            <td>{item.Role}</td>
            <td>{item.TotalBlogsPublished}</td>
            <td><span className="metric-badge">{item.TotalLikesReceived || 0} Likes</span></td>
          </tr>
        ))}
        {filteredData.length === 0 && <tr><td colSpan="5" className="no-data">No authors found.</td></tr>}
      </tbody>
    </table>
  );

  const renderRevenueTable = () => {
    const totalRevenue = filteredData.reduce((sum, i) => sum + Number(i.TotalRevenue || 0), 0);
    return (
      <table className="report-table">
        <thead>
          <tr><th>Rank</th><th>Plan Name</th><th>Price per Plan</th><th>Total Subscribers</th><th>Total Revenue</th></tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={`rev-${item.SubId || index}`}>
              <td><strong style={{ color: '#2563eb' }}>{index + 1}</strong></td>
              <td><strong>{item.PlanName}</strong></td>
              <td>&#8377;{item.Price}</td>
              <td>{item.TotalSubscribers} Users</td>
              <td>&#8377;{item.TotalRevenue}</td>
            </tr>
          ))}
          {filteredData.length === 0 && <tr><td colSpan="5" className="no-data">No subscription data found.</td></tr>}
          {filteredData.length > 0 && (
            <tr style={{ background: '#eff6ff', fontWeight: 700, borderTop: '2px solid #2563eb' }}>
              <td colSpan="4" style={{ textAlign: 'right', padding: '10px 12px', color: '#1e40af' }}>Total Revenue</td>
              <td style={{ padding: '10px 12px', color: '#1e40af' }}>&#8377;{totalRevenue}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };


  const showDateFilter = reportType !== 'top-authors';

  return (
    <div className="admin-report-container">
      <div className="report-header">
        <div>
          <h2>Performance Reports</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="download-pdf-btn" onClick={generatePDF} disabled={loading || isGeneratingPdf || filteredData.length === 0}>
            <FaFileDownload size={18} />
            {isGeneratingPdf ? "Generating..." : "Download Report"}
          </button>
          <button
            className="download-pdf-btn"
            style={{ backgroundColor: '#10b981' }}
            onClick={handleViewChart}
            disabled={loading || loadingChart || filteredData.length === 0}
          >
            <FaChartLine size={18} />
            {loadingChart ? "Loading..." : showChart ? "Hide Chart" : "View Chart"}
          </button>
        </div>
      </div>

      <div className="report-controls">
        {/* Report Type Tabs */}
        <div className="report-tabs">
          <button className={`report-tab-btn ${reportType === 'top-blogs' ? 'active' : ''}`} onClick={() => setReportType('top-blogs')}>
            <FaChartLine /> Top Performing Blogs
          </button>
          <button className={`report-tab-btn ${reportType === 'top-authors' ? 'active' : ''}`} onClick={() => setReportType('top-authors')}>
            <FaUsers /> Top Contributing Authors
          </button>
          <button className={`report-tab-btn ${reportType === 'revenue' ? 'active' : ''}`} onClick={() => setReportType('revenue')}>
            <FaRegMoneyBillAlt /> Subscription Revenue
          </button>
        </div>

        {/* Date Filters */}
        {showDateFilter && (
          <div className="report-filters">
            <div className="filter-group">
              <label>Start Date:</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <button className="clear-filter-btn" onClick={() => { setStartDate(""); setEndDate(""); }}>Clear</button>
          </div>
        )}

        {/* Extra filters for Top Blogs: Category + Month */}
        {reportType === 'top-blogs' && reportData.length > 0 && (
          <div className="report-filters" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Month:</label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Months</option>
                {uniqueMonths.map(m => {
                  const [yr, mo] = m.split('-');
                  const label = new Date(yr, parseInt(mo) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
            </div>
            {(categoryFilter || monthFilter) && (
              <button className="clear-filter-btn" onClick={() => { setCategoryFilter(""); setMonthFilter(""); }}>Clear</button>
            )}
          </div>
        )}

        {/* Author Search */}
        {reportType === 'top-authors' && (
          <div className="report-filters">
            <div className="filter-group author-search-group">
              <FaSearch style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search author by name..."
                value={authorSearch}
                onChange={(e) => setAuthorSearch(e.target.value)}
                className="author-search-input"
              />
            </div>
            {authorSearch && (
              <button className="clear-filter-btn" onClick={() => setAuthorSearch("")}>Clear</button>
            )}
          </div>
        )}

        <div className="report-summary">
          <span>Records Found: <strong>{filteredData.length}</strong></span>
        </div>
      </div>

      {/* Inline Chart */}
      {showChart && chartUrl && (
        <div className="chart-preview-container">
          <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>
            {reportType === 'top-blogs' ? 'Top 5 Blogs by Likes' :
             reportType === 'revenue' ? 'Revenue by Plan' :
             'Top 5 Authors by Blogs Published'}
          </h4>
          <img src={chartUrl} alt="Performance Chart" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
        </div>
      )}

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
