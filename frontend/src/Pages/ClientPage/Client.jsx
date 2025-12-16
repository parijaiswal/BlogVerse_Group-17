import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Client.css";

/**
 * Extended blogData: added category, createdAt, downloads, free (boolean), popularity score
 */
export const blogData = [
  { id: 1, title: "The Power of Writing", desc: "Discover how daily writing can transform your mindset.", content: "Full detailed content for Blog 1...", category: "Self-Help", createdAt: "2025-11-20", downloads: 12, free: true, popularity: 72 },
  { id: 2, title: "Blogging Tips for Beginners", desc: "Start your blogging journey with these simple but powerful tips.", content: "Full detailed content for Blog 2...", category: "Tutorial", createdAt: "2025-10-02", downloads: 45, free: false, price: 49, popularity: 88 },
  { id: 3, title: "How to Stay Consistent", desc: "Learn the art of consistency in writing and content creation.", content: "Full detailed content for Blog 3...", category: "Productivity", createdAt: "2025-09-12", downloads: 9, free: true, popularity: 60 },
  { id: 4, title: "Creative Thinking", desc: "Unlock creativity with these fun and effective techniques.", content: "Full detailed content for Blog 4...", category: "Creativity", createdAt: "2025-07-01", downloads: 5, free: true, popularity: 48 },
  { id: 5, title: "Why Blogs Still Matter", desc: "Blogs continue to rule! Here’s why they are still relevant.", content: "Full detailed content for Blog 5...", category: "Opinion", createdAt: "2025-05-18", downloads: 20, free: false, price: 29, popularity: 64 },
  { id: 6, title: "Writing for Yourself", desc: "Write for YOU first — everything else comes later.", content: "Full detailed content for Blog 6...", category: "Self-Help", createdAt: "2025-04-09", downloads: 2, free: true, popularity: 30 },
  { id: 7, title: "Storytelling Magic", desc: "Turn ordinary words into powerful stories.", content: "Full detailed content for Blog 7...", category: "Writing", createdAt: "2025-02-25", downloads: 33, free: false, price: 79, popularity: 92 },
  { id: 8, title: "Boost Your Productivity", desc: "Simple habits that can boost your writing productivity.", content: "Full detailed content for Blog 8...", category: "Productivity", createdAt: "2025-01-10", downloads: 15, free: true, popularity: 55 },
  { id: 9, title: "Publishing Your First Blog", desc: "Step-by-step guide to publish your first blog.", content: "Full detailed content for Blog 9...", category: "Tutorial", createdAt: "2024-12-05", downloads: 60, free: false, price: 99, popularity: 98 },
];

/* small helper: format date */
const fmtDate = (d) => new Date(d).toLocaleDateString();

/* Toast component */
const Toasts = ({ toasts, removeToast }) => (
  <div className="toast-wrap">
    {toasts.map((t) => (
      <div key={t.id} className="toast" onAnimationEnd={() => t.autoDismiss && removeToast(t.id)}>
        <strong>{t.title}</strong>
        <div>{t.message}</div>
        <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
      </div>
    ))}
  </div>
);

const Client = () => {
  const navigate = useNavigate();

  // states
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [likes, setLikes] = useState(() => JSON.parse(localStorage.getItem("client_likes") || "{}"));
  const [comments, setComments] = useState(() => JSON.parse(localStorage.getItem("client_comments") || "{}"));
  const [downloads, setDownloads] = useState(() => JSON.parse(localStorage.getItem("client_downloads") || "{}"));
  const [input, setInput] = useState({});

  const [profileOpen, setProfileOpen] = useState(false);
  const [commentModalOpenFor, setCommentModalOpenFor] = useState(null);
  const [paymentModalFor, setPaymentModalFor] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem("client_profile")) || {
    name: "Client",
    email: "client@example.com",
    avatarLetter: "C",
    bio: "I love reading & writing.",
  });

  const [myBlogs, setMyBlogs] = useState(() => JSON.parse(localStorage.getItem("client_blogs")) || []);
  const [addBlogOpen, setAddBlogOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", desc: "", content: "", category: "General" });

  const [activePlan, setActivePlan] = useState(() => JSON.parse(localStorage.getItem("active_plan")) || null);

  const categories = ["All", ...Array.from(new Set(blogData.map((b) => b.category)))];

  // save to localStorage
  useEffect(() => localStorage.setItem("member_likes", JSON.stringify(likes)), [likes]);
  useEffect(() => localStorage.setItem("member_comments", JSON.stringify(comments)), [comments]);
  useEffect(() => localStorage.setItem("member_downloads", JSON.stringify(downloads)), [downloads]);
  useEffect(() => localStorage.setItem("member_profile", JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem("client_blogs", JSON.stringify(myBlogs)), [myBlogs]);
  useEffect(() => localStorage.setItem("active_plan", JSON.stringify(activePlan)), [activePlan]);

  // Toast helpers
  const addToast = (title, message = "", { autoDismiss = true, duration = 3000 } = {}) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 8);
    const t = { id, title, message, autoDismiss };
    setToasts((s) => [...s, t]);
    if (autoDismiss) setTimeout(() => removeToast(id), duration);
  };
  const removeToast = (id) => setToasts((s) => s.filter((t) => t.id !== id));

  // Like toggle
  const handleLike = (id) => {
    setLikes((prev) => {
      const newVal = { ...prev, [id]: prev[id] ? 0 : 1 };
      addToast("Like updated", newVal[id] ? "You liked the post." : "You removed your like.");
      return newVal;
    });
  };

  // Add comment
  const handleAddComment = (id, text) => {
    if (!text || !text.trim()) {
      addToast("Empty comment", "Please type something before adding.");
      return;
    }
    setComments((prev) => {
      const next = { ...prev, [id]: [...(prev[id] || []), { text: text.trim(), at: new Date().toISOString() }] };
      addToast("Comment added", "Thanks for sharing your thoughts.");
      return next;
    });
    setInput({ ...input, [id]: "" });
  };

  const openBlog = (blog) => navigate(`/blog/${blog.id}`, { state: blog });

  const totalDownloads = [...blogData, ...myBlogs].reduce((s, b) => s + (downloads[b.id] || b.downloads || 0), 0);
  const freeDownloads = [...blogData, ...myBlogs].filter((b) => b.free).reduce((s, b) => s + (downloads[b.id] || b.downloads || 0), 0);

  const activityStats = {
    likesGiven: Object.values(likes).filter(Boolean).length,
    commentsPosted: Object.values(comments).reduce((s, arr) => s + (arr ? arr.length : 0), 0),
    downloadsCount: Object.values(downloads).reduce((s, n) => s + (n || 0), 0),
  };

  const handlePremiumDownload = (blog) => {
    if (blog.free) {
      setDownloads((prev) => ({ ...prev, [blog.id]: (prev[blog.id] || 0) + 1 }));
      addToast("Download started", "Free download started.");
      return;
    }
    setPaymentModalFor(blog.id);
  };

  const confirmPayment = (blogId) => {
    setDownloads((prev) => ({ ...prev, [blogId]: (prev[blogId] || 0) + 1 }));
    setPaymentModalFor(null);
    addToast("Payment successful", "Premium content unlocked & download started.");
  };

  const allBlogs = [...myBlogs, ...blogData];

  const filteredBlogs = allBlogs
    .filter((b) => (categoryFilter !== "All" ? b.category === categoryFilter : true))
    .filter((b) => {
      const q = query.toLowerCase();
      return !query || b.title.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q) || b.content.toLowerCase().includes(q);
    })
    .sort((a, b) => sortBy === "latest" ? new Date(b.createdAt) - new Date(a.createdAt) : sortBy === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : (b.popularity || 0) - (a.popularity || 0));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setCommentModalOpenFor(null);
        setPaymentModalFor(null);
        setAddBlogOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const searchRef = useRef(null);
  useEffect(() => { if (searchRef.current) searchRef.current.focus(); }, []);

  const avatarClick = () => setProfileOpen(true);
  const handleProfileSave = (newProfile) => { setProfile(newProfile); addToast("Profile saved", "Your profile changes were saved locally."); };

  // subscription plans
  const plans = [
    { id: "basic", name: "Basic", price: 0, benefits: ["Unlimited free blogs"] },
    { id: "pro", name: "Pro", price: 199, benefits: ["Premium blogs", "Unlimited downloads"] },
    { id: "elite", name: "Elite", price: 499, benefits: ["All access", "Priority support"] },
  ];

  return (
    <div className="client-page">
      {/* NAVBAR */}
      <header className="client-nav">
        <div className="nav-left">
          <div className="brand">
            <div className="logo-glow">B</div>
            <div className="brand-text">BlogVerse</div>
          </div>
           <div className="avatar" onClick={avatarClick}>{profile.avatarLetter || "C"}</div>
        </div>
        <div className="nav-right">
          <div className="activity-mini">
            <div>❤️ {activityStats.likesGiven}</div>
            <div>💬 {activityStats.commentsPosted}</div>
            <div>⬇️ {activityStats.downloadsCount}</div>
          </div>
        </div>
      </header>
      {profileOpen && (
  <div className="profile-panel glass">
    <div className="profile-header">
      <h3>Edit Profile</h3>
      <button className="close-btn" onClick={() => setProfileOpen(false)}>✕</button>
    </div>

    <div className="profile-avatar">
      <div className="avatar-large">{profile.avatarLetter || "C"}</div>
      <button className="upload-btn">Upload Photo</button>
    </div>

    <div className="profile-form">
      <label>Full Name</label>
      <input
        value={profile.name}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
      />

      <label>Email</label>
      <input value={profile.email} disabled />

      <label>Bio</label>
      <textarea
        value={profile.bio}
        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
      />

      <div className="profile-actions">
        <button className="btn ghost" onClick={() => setProfileOpen(false)}>
          Cancel
        </button>
        <button
          className="btn primary"
          onClick={() => {
            handleProfileSave(profile);
            setProfileOpen(false);
          }}
        >
          Update Profile
        </button>
      </div>
    </div>
  </div>
)}


      {/* HERO */}
      <section className="client-hero">
        <div>
          <h1 className="client-title">Welcome, {profile.name}</h1>
          <p className="client-subtitle">Explore, filter, like & support creators</p>
          {activePlan && <div className="active-plan">🌟 Current Plan: <strong>{activePlan.name}</strong></div>}
        </div>
        <div className="controls">
          <div className="search-wrap">
            <input ref={searchRef} className="search-input" placeholder="Search blogs, tips or keywords..." value={query} onChange={(e) => setQuery(e.target.value)} />
            {query && <button className="clear-btn" onClick={() => setQuery("")}>✕</button>}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select">
            <option value="latest">Sort: Latest</option>
            <option value="popular">Sort: Popular</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn primary" onClick={() => setAddBlogOpen(true)}>➕ Add Blog</button>
          <button className="btn ghost" onClick={() => setPaymentModalFor("PLAN")}>💳 Subscription Plans</button>
        </div>
      </section>

      {/* BLOG GRID */}
      <main className="blog-grid">
        {filteredBlogs.map((blog) => (
          <article className="blog-card glass" key={blog.id}>
            <div className="card-top"><div className="category-badge" data-cat={blog.category}>{blog.category}</div><div className="meta">{fmtDate(blog.createdAt)} • {blog.popularity} popularity</div></div>
            <div className="blog-click" onClick={() => openBlog(blog)}><h3>{blog.title}</h3><p className="desc">{blog.desc}</p></div>
            <div className="card-actions">
              <div className="left-actions">
                <button className={`like-btn ${likes[blog.id] ? "liked" : ""}`} onClick={() => handleLike(blog.id)}>{likes[blog.id] ? "❤️ Liked" : "🤍 Like"}</button>
                <button className="comment-open" onClick={() => setCommentModalOpenFor(blog.id)}>💬 Comments ({(comments[blog.id] || []).length})</button>
              </div>
              <div className="right-actions">
                <button className="download-btn" onClick={() => handlePremiumDownload(blog)}>{blog.free ? "⬇️ Free" : `🔒 Premium • ₹${blog.price}`}</button>
              </div>
            </div>
            <div className="card-footer"><div className="downloads">Downloads: {(downloads[blog.id] || blog.downloads || 0)}</div><div className="read-more" onClick={() => openBlog(blog)}>Read →</div></div>
          </article>
        ))}
      </main>

      {/* MODALS */}
      {/* Profile, Comment, Payment Modal code stays unchanged */}

      {/* ADD BLOG MODAL */}
      {addBlogOpen && (
        <div className="modal-overlay" onClick={() => setAddBlogOpen(false)}>
          <div className="modal add-blog-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Your Blog</h3>
            <input placeholder="Title" value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} />
            <input placeholder="Short Description" value={newBlog.desc} onChange={(e) => setNewBlog({ ...newBlog, desc: e.target.value })} />
            <textarea placeholder="Content" value={newBlog.content} onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })} />
            <input placeholder="Category" value={newBlog.category} onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })} />
            <button className="btn primary" onClick={() => {
              setMyBlogs([{ ...newBlog, id: Date.now(), createdAt: new Date(), free: true, downloads: 0, popularity: 0 }, ...myBlogs]);
              setAddBlogOpen(false);
              addToast("Blog Added", "Your blog is now live!");
            }}>Publish</button>
          </div>
        </div>
      )}

      {/* PLAN MODAL */}
      {paymentModalFor === "PLAN" && (
        <div className="modal-overlay" onClick={() => setPaymentModalFor(null)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <h3>Choose Your Plan</h3>
            {plans.map((p) => (
              <div key={p.id} className="plan-card">
                <h4>{p.name}</h4>
                <p>₹{p.price}</p>
                <ul>{p.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
                <button className="btn primary" onClick={() => { setActivePlan(p); addToast("Plan Activated", `${p.name} plan activated`); setPaymentModalFor(null); }}>Choose</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toasts toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Client;
