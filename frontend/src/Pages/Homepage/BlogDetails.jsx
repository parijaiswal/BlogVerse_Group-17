import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegCommentDots, FaTrashAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import { FaDownload } from "react-icons/fa";
import "./BlogDetails.css";

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
  const [showPurchase, setShowPurchase] = useState(false); // Show purchase button

  // Get logged-in user info from localStorage
  const userId = localStorage.getItem("userId");
  const isLoggedIn = !!userId;

  // Fetch blog details
  useEffect(() => {
    axios.get(`http://localhost:5000/api/blogs/${id}`)
      .then(res => {
        setBlog(res.data);
        setLikes(res.data.Like_count || 0);
      });
    fetchComments();
  }, [id]);

  const fetchComments = () => {
    axios.get(`http://localhost:5000/api/blogs/${id}/comments`)
      .then(res => setComments(res.data));
  };

  if (!blog) return <p>Loading...</p>;

  // Show message
  const showMessage = (msg, keepVisible = false) => {
    setMessage(msg);
    setShowPurchase(false);
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
    axios.post(`http://localhost:5000/api/blogs/${id}/like`)
      .then(() => {
        setLikes(likes + 1);
        setLiked(true);
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
    
    axios.post(`http://localhost:5000/api/blogs/${id}/comment`, {
      Userid: userId,
      Comment_text: commentText
    })
    .then(() => {
      setCommentText("");
      setShowCommentBox(false);
      showMessage("Comment posted successfully!");
      fetchComments();
    })
    .then(res => setComments(res.data));
  };

  // Handle delete comment
  const handleDeleteComment = (commentId) => {
    if(!window.confirm("Are you sure you want to delete this comment?")) return;

    axios.delete(`http://localhost:5000/api/blogs/comment/${commentId}`, {
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
  };

  // Handle PDF download
  const handleDownload = () => {
    if (!isLoggedIn) {
      showMessage("Please login to download this blog as PDF");
      return;
    }

    // Check if user can download
    axios.post(`http://localhost:5000/api/blogs/download-pdf/${userId}`)
      .then((res) => {
        if (!res.data.allowed) {
          setMessage(res.data.message);
          // Show purchase button if member exceeded limit
          if (res.data.message.includes("2 free downloads")) {
            setMessage("You have used your 2 free downloads. Pay to download more.");
            setShowPurchase(true);
          }
          return;
        }
        
        // Generate and download PDF
        const doc = new jsPDF("p", "mm", "a4");
        let y = 20;

        doc.setFontSize(20);
        doc.text(blog.Title, 105, y, { align: "center" });
        y += 10;

        doc.setFontSize(11);
        doc.text(`Author: ${blog.Username || ""}`, 20, y);
        y += 6;
        doc.text(`Date: ${new Date(blog.Create_Date).toDateString()}`, 20, y);
        y += 10;

        doc.setFontSize(13);
        const contentLines = doc.splitTextToSize(blog.Content, 170);
        doc.text(contentLines, 20, y);

        doc.setFontSize(10);
        doc.text("Downloaded from BlogVerse", 105, 290, { align: "center" });

        doc.save(`${blog.Title}.pdf`);
        showMessage("PDF downloaded successfully!");
      })
      .catch(() => {
        showMessage("Error downloading PDF. Please try again.");
      });
  };

  // Handle delete blog
  const handleDeleteBlog = () => {
    if(!window.confirm("Are you sure you want to delete this blog? This cannot be undone.")) return;

    axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        data: { userId }
    })
    .then(() => {
        alert("Blog deleted successfully");
        navigate("/"); // Redirect to home
    })
    .catch((err) => {
        console.error("Delete Blog Error", err);
        showMessage("Failed to delete blog: " + (err.response?.data?.message || err.message));
    });
  };

  return (
    <div className="blog-details-container">

      {blog.Image_path && (
        <div className="blog-header-img">
          <img 
            src={`http://localhost:5000${blog.Image_path}`} 
            alt={blog.Title} 
          />
        </div>
      )}

      <div className="blog-title-row">
        <h1 className="blog-title">{blog.Title}</h1>
        {/* Delete Blog Button - Only for blog owner */}
        {isLoggedIn && String(blog.Userid || blog.UserId) === String(userId) && (
            <button 
                className="delete-blog-btn" 
                onClick={handleDeleteBlog}
                title="Delete your blog"
            >
                <FaTrashAlt size={18} /> Delete Blog
            </button>
        )}
      </div>
      
      <div className="blog-info">
        <span className="blog-author-highlight">{blog.Username}</span> 
        <span>|</span>
        <span>{new Date(blog.Create_Date).toDateString()}</span>
      </div>

      <div className="blog-text">
        {blog.Content.split('\n').map((para, index) => (
          <p key={index}>{para}</p>
        ))}
      </div>

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
            <button onClick={() => navigate("/payment")} className="login-link-btn">
              Pay Now
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