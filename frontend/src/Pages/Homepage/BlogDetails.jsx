import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegCommentDots, FaTrashAlt, FaLock, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import "./BlogDetails.css";
import API_BASE from "../../config";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [message, setMessage] = useState("");
  const [showPurchase, setShowPurchase] = useState(false);
  const [pdfPrice, setPdfPrice] = useState(50);
  const [showSubscriptionBtn, setShowSubscriptionBtn] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Get logged-in user info from localStorage
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role"); // Changed: removed ?.toLowerCase()
  const isLoggedIn = !!userId;

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Unknown Date" : date.toLocaleDateString();
  };

  // Fetch blog details
  useEffect(() => {
    axios.get(`${API_BASE}/api/blogs/${id}`)
      .then(res => {
        setBlog(res.data);
        setLikes(res.data.Like_count || 0);

        const key = `bookmarks_${userId}`;
        const bookmarks = JSON.parse(localStorage.getItem(key)) || [];
        if (bookmarks.includes(res.data.BlogId)) {
          setBookmarked(true);
        }

        // Restore liked state from localStorage
        if (userId) {
          const likedBlogs = JSON.parse(localStorage.getItem(`likes_${userId}`)) || [];
          if (likedBlogs.includes(Number(id) || id)) {
            setLiked(true);
          }
        }
      });
    fetchComments();
  }, [id, userId]);

  const fetchComments = () => {
    axios.get(`${API_BASE}/api/blogs/${id}/comments`)
      .then(res => setComments(res.data));
  };

  if (!blog) return <p>Loading...</p>;

  // Show message
  const showMessage = (msg, keepVisible = false) => {
    setMessage(msg);
    if (!keepVisible) {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Handle like click - only for logged-in users
  const handleLike = () => {
    if (!isLoggedIn) {
      showMessage("Please login to like this blog");
      return;
    }
    if (liked) return;
    axios.post(`${API_BASE}/api/blogs/${id}/like`)
      .then(() => {
        setLikes(likes + 1);
        setLiked(true);
        // Persist liked state in localStorage so it survives page refresh
        const likedBlogs = JSON.parse(localStorage.getItem(`likes_${userId}`)) || [];
        likedBlogs.push(Number(id) || id);
        localStorage.setItem(`likes_${userId}`, JSON.stringify(likedBlogs));
      });
  };

  // Handle comment toggle - check login
  const handleCommentClick = () => {
    if (!isLoggedIn) {
      showMessage("Please login to comment on this blog");
      return;
    }
    setShowCommentBox(!showCommentBox);
  };

  // Handle comment post
  const postComment = () => {
    if (!commentText.trim()) return;
    if (!isLoggedIn) {
      showMessage("Please login to comment");
      return;
    }
    
    axios.post(`${API_BASE}/api/blogs/${id}/comment`, {
      Userid: userId,
      Comment_text: commentText
    })
    .then(() => {
      setCommentText("");
      setShowCommentBox(false);
      showMessage("Comment posted successfully!");
      fetchComments();
    })
    .catch((err) => {
      console.error("Post comment error:", err);
      showMessage("Failed to post comment");
    });
  };

  // Handle delete comment
  const handleDeleteComment = (commentId) => {
    Swal.fire({
      title: "Delete Comment?",
      text: "Are you sure you want to remove this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_BASE}/api/blogs/comment/${commentId}`, {
            data: { userId, blogId: id }
        })
        .then(() => {
            showMessage("Comment deleted successfully!");
            fetchComments();
        })
        .catch((err) => {
            console.error("Delete Error", err);
            showMessage("Failed to delete comment");
        });
      }
    });
  };

  // Request PDF from backend Puppeteer endpoint
  const generatePDF = async () => {
    try {
      showMessage("Preparing PDF... Please wait.");
      const response = await axios.post(`${API_BASE}/api/blogs/generate-pdf`, {
        blog: blog
      }, {
        responseType: 'blob' // Force axios to receive as binary blob
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const newTab = window.open(url, '_blank');
      
      if (!newTab) {
        // Fallback: If popup was blocked, force a hard download
        const link = document.createElement('a');
        link.href = url;
        const filename = (blog.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'blog') + '.pdf';
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showMessage("Your PDF has been downloaded!");
      } else {
        showMessage("PDF opened in a new tab!");
      }
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
      
    } catch (error) {
      console.error("Error generating single blog PDF from backend:", error);
      showMessage("Failed to generate PDF. Please try again.");
    }
  };

  // Handle PDF download
  const handleDownload = () => {
    if (!isLoggedIn) {
      showMessage("Please login to download this blog as PDF");
      return;
    }

    // Reset states
    setShowPurchase(false);
    setShowSubscriptionBtn(false);

    // Check if user can download
    axios.post(`${API_BASE}/api/blogs/download-pdf/${userId}`, { blogId: id })
      .then((res) => {
        if (!res.data.allowed) {
          setMessage(res.data.message);
          
          // Member needs to pay per PDF
          if (res.data.requiresPayment) {
            setPdfPrice(res.data.pdfPrice || 50);
            setShowPurchase(true);
            return;
          }
          
          // Client needs subscription
          if (res.data.requiresSubscription) {
            setShowSubscriptionBtn(true);
            return;
          }
          return;
        }
        
        // Generate and download PDF
        generatePDF();
      })
      .catch(() => {
        showMessage("Error downloading PDF. Please try again.");
      });
  };

  // Handle pay for PDF (members)
  const handlePayForPDF = () => {
    navigate("/payment", { 
      state: { 
        type: 'pdf',
        pdfPrice: pdfPrice,
        blogId: id,
        blogTitle: blog.Title,
        blog: blog
      } 
    });
  };


  const handleBookmark = () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    showMessage("Please login to bookmark this blog");
    return;
  }

  const key = `bookmarks_${userId}`;
  let bookmarks = JSON.parse(localStorage.getItem(key)) || [];

  if (bookmarked) {
    bookmarks = bookmarks.filter(id => id !== blog.BlogId);
    setBookmarked(false);
  } else {
    bookmarks.push(blog.BlogId);
    setBookmarked(true);
  }

  localStorage.setItem(key, JSON.stringify(bookmarks));
};
  return (
    <div className="blog-details-container">

      {blog.Image_path && (
        <div className="blog-header-img">
          <img 
            src={`${API_BASE}${blog.Image_path}`} 
            alt={blog.Title} 
          />
        </div>
      )}

      <div className="blog-title-row">
        <h1 className="blog-title">{blog.Title}</h1>
      </div>
      
      <div className="blog-info">
        <span
          className="blog-author-highlight"
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate(`/author/${blog.Userid || blog.UserId}`)}
        >
          {blog.Username}
        </span>
        <span>|</span>
        <span>{new Date(blog.Create_Date).toDateString()}</span>
      </div>

      {isLoggedIn ? (
        <div className="blog-text">
          {blog.Content.split('\n').map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      ) : (
        <div className="blog-content-wrapper">
          <div className="blog-text preview-text">
            {blog.Content.split('\n').length > 0 && (
              <p>{blog.Content.split('\n')[0]}</p>
            )}
          </div>
          <div className="blurred-wrapper">
            <div className="blog-text blurred-text">
              {blog.Content.split('\n').slice(1).map((para, index) => (
                <p key={index}>{para}</p>
              ))}
              {/* Fallback dummy text to ensure blur layout works even if content is extremely short */}
              {blog.Content.split('\n').length <= 1 && (
                <>
                  <p>In addition to the above, reading detailed insights from top writers provides value...</p>
                  <p>Join our platform today to get full access to articles, discussions, and our growing community.</p>
                </>
              )}
            </div>
            <div className="blur-overlay">
              <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaLock size={22} style={{ marginRight: '8px', color: '#0f172a' }} />
                Keep Reading
              </h3>
              <p>To read the full article,please log in or create an account.</p>
              <div className="blur-actions">
                <button onClick={() => navigate("/login")} className="blur-login-btn">Login</button>
                <button onClick={() => navigate("/register")} className="blur-register-btn">Register</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ICON BAR */}
      <div className="interaction-bar">
        <div onClick={handleLike} className="icon-wrapper">
          <FaHeart color={liked ? "#e91e63" : "currentColor"} size={22} /> 
          <span style={{ fontWeight: 500 }}>{likes} Likes</span>
        </div>

        <div onClick={handleCommentClick} className="icon-wrapper">
          <FaRegCommentDots size={22} /> 
          <span style={{ fontWeight: 500 }}>{comments.length} Comments</span>
        </div>

        <div onClick={handleBookmark} className="icon-wrapper">
          <span style={{ fontSize: "20px" }}>
            {bookmarked ? <FaBookmark color="#2563eb" /> : <FaRegBookmark />}</span>
          <span style={{ fontWeight: 500 }}>
             {bookmarked ? "Bookmarked" : "Bookmark"}</span>
       </div>
        <div onClick={handleDownload} className="icon-wrapper" style={{ marginLeft: "auto", color: "#2563eb" }}>
          <FaDownload size={20} /> 
          <span style={{ fontWeight: 600 }}>Download PDF</span>
        </div>
      </div>

      {/* Inline Message - Below interaction bar */}
      {message && (
        <div className={`inline-message ${message.includes("successfully") ? "success" : "error"}`}>
          {message}
          {message.includes("Please login") && (
            <button onClick={() => navigate("/login")} className="login-link-btn">
              Login Now
            </button>
          )}
          {showPurchase && (
            <button onClick={handlePayForPDF} className="login-link-btn" style={{ backgroundColor: "#10b981" }}>
              Pay ₹{pdfPrice} to Download
            </button>
          )}
          {showSubscriptionBtn && (
            <button onClick={() => navigate("/subscription")} className="login-link-btn">
              Get Subscription
            </button>
          )}
        </div>
      )}

      {/* COMMENT BOX (TOGGLE) - Only for logged-in users */}
      {showCommentBox && isLoggedIn && (
        <div className="comment-section-box">
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            className="comment-input"
          />
          <button onClick={postComment} className="post-btn">
            Post Comment
          </button>
        </div>
      )}

      {/* COMMENTS */}
      <div className="comments-list">
        <h3 style={{ marginBottom: "20px", fontSize: "24px", color: "#1e293b" }}>Comments</h3>
        {comments.length === 0 ? (
          <p style={{ color: "#64748b" }}>No comments yet. Be the first to share!</p>
        ) : (
          comments.map(c => (
            <div key={c.Commentid} className="comment-item">
              <div className="comment-header">
                <span className="comment-user">{c.Username}</span>
                <span className="comment-date">
                  {new Date(c.Comment_date).toLocaleDateString()}
                </span>
                {/* Show Delete button only for comment author */}
                {isLoggedIn && String(c.Userid) === String(userId) && (
                    <button 
                        className="delete-comment-btn" 
                        onClick={() => handleDeleteComment(c.Commentid)}
                        title="Delete your comment"
                    >
                        <FaTrashAlt size={14} />
                    </button>
                )}
              </div>
              <p className="comment-text">{c.Comment_text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default BlogDetails;