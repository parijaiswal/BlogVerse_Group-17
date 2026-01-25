import React, { useEffect, useState} from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaHeart, FaRegCommentDots } from "react-icons/fa";
import jsPDF from "jspdf";
import { FaDownload } from "react-icons/fa";


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
  doc.text(`Author: ${blog.User_Role || "Admin"}`, 20, y);
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
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto"  }}>
      <h1>{blog.Title}</h1>
      <p>{blog.Content}</p>
      {/* ICON BAR */}
      <div style={{ display: "flex", gap: "25px", margin: "20px 0" }}>
        <div onClick={handleLike} style={{ cursor: "pointer" }}>
          <FaHeart color={liked ? "red" : "gray"} /> {likes}
        </div>

        <div
          onClick={() => setShowCommentBox(!showCommentBox)}
          style={{ cursor: "pointer" }}
        >
          <FaRegCommentDots /> {comments.length}
        </div>

        <div onClick={handleDownload} style={{ cursor: "pointer" }}>
    <FaDownload /> Download
  </div>
      </div>

      {/* COMMENT BOX (TOGGLE) */}
      {showCommentBox && (
        <>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            style={{ width: "100%", height: "80px" }}
          />
          <button onClick={postComment} style={{ marginTop: "8px" }}>
            Post
          </button>
        </>
      )}

      {/* COMMENTS */}
      {comments.map(c => (
        <div key={c.Commentid} style={{ marginTop: "12px" }}>
          <b>User {c.Userid}</b>
          <p>{c.Comment_text}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogDetails;