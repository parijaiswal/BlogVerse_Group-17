import React, { useEffect, useState} from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaHeart, FaRegCommentDots } from "react-icons/fa";
import jsPDF from "jspdf";
import { FaDownload } from "react-icons/fa";
import "./BlogDetails.css";


const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const userId = 1; // Replace with logged-in user ID
  // Fetch blog details
  useEffect(() => {
    axios.get(`http://localhost:5000/api/blogs/${id}`)
      .then(res => {
        setBlog(res.data);
        setLikes(res.data.Like_count || 0); // make sure your GET /:id route sends Like_count
      });
     axios.get(`http://localhost:5000/api/blogs/${id}/comments`)
      .then(res => setComments(res.data));
  }, [id]);

 if (!blog) return <p>Loading...</p>;

  // Handle like click
  const handleLike = () => {
        if (liked) return;
    axios.post(`http://localhost:5000/api/blogs/${id}/like`)
      .then(() => {
        setLikes(likes+1); // updated like count
        setLiked(true);
      });
  };

  // Handle comment post
  const postComment = () => {
    if (!commentText) return;
    axios.post(`http://localhost:5000/api/blogs/${id}/comment`, {
      Userid: userId,
      Comment_text: commentText
    })
    .then(() => {
      setCommentText("");
      setShowCommentBox(false);
      return axios.get(`http://localhost:5000/api/blogs/${id}/comments`);
    })
    .then(res => setComments(res.data))
  };
  const handleDownload = () => {
  const doc = new jsPDF("p", "mm", "a4");

  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.text(blog.Title, 105, y, { align: "center" });
  y += 10;

  // Meta
  doc.setFontSize(11);
  doc.text(`Author: ${blog.User_Role || ""}`, 20, y);
  y += 6;
  doc.text(`Date: ${new Date(blog.Create_Date).toDateString()}`, 20, y);
  y += 10;

  // Content
  doc.setFontSize(13);
  const contentLines = doc.splitTextToSize(blog.Content, 170);
  doc.text(contentLines, 20, y);

  // Footer / watermark
  doc.setFontSize(10);
  doc.text("Downloaded from BlogVerse", 105, 290, { align: "center" });

  doc.save(`${blog.Title}.pdf`);
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

      <h1 className="blog-title">{blog.Title}</h1>
      
      <div className="blog-info">
        <span className="blog-author-highlight">{blog.Username}</span> 
        <span>|</span>
        <span>{new Date(blog.Create_Date).toDateString()}</span>
         <span>|</span>
        <span style={{ textTransform: "capitalize" }}>{blog.User_Role || "Member"}</span>
      </div>

      <div className="blog-text">
        {blog.Content.split('\n').map((para, index) => (
          <p key={index}>{para}</p>
        ))}
      </div>

      {/* ICON BAR */}
      <div className="interaction-bar">
        <div onClick={handleLike} className="icon-wrapper">
          <FaHeart color={liked ? "#e91e63" : "currentColor"} size={22} /> <span style={{ fontWeight: 500 }}>{likes} Likes</span>
        </div>

        <div onClick={() => setShowCommentBox(!showCommentBox)} className="icon-wrapper">
          <FaRegCommentDots size={22} /> <span style={{ fontWeight: 500 }}>{comments.length} Comments</span>
        </div>

        <div onClick={handleDownload} className="icon-wrapper" style={{ marginLeft: "auto", color: "#2563eb" }}>
          <FaDownload size={20} /> <span style={{ fontWeight: 600 }}>Download PDF</span>
        </div>
      </div>

      {/* COMMENT BOX (TOGGLE) */}
      {showCommentBox && (
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
        {comments.length === 0 ? <p style={{ color: "#64748b" }}>No comments yet. Be the first to share!</p> : (
             comments.map(c => (
              <div key={c.Commentid} className="comment-item">
                <b className="comment-user">User {c.Userid}</b>
                 <span className="comment-date">{new Date(c.Comment_date).toLocaleDateString()}</span>
                <p className="comment-text">{c.Comment_text}</p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default BlogDetails;