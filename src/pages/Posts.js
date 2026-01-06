import React, { useEffect, useState, useRef, useMemo } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Image as ImageIcon,
} from "lucide-react";

const Posts = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [slideIndex, setSlideIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const commentBoxRefs = useRef({});

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "memberPosts"), orderBy("createdAt", "desc"))
        );
        setPosts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Real-time Comments Listener
  useEffect(() => {
    if (posts.length === 0) return;
    const unsubscribes = posts.map((post) => {
      const q = query(
        collection(db, "memberPosts", post.id, "comments"),
        orderBy("createdAt", "asc")
      );
      return onSnapshot(q, (snap) => {
        setComments((prev) => ({
          ...prev,
          [post.id]: snap.docs.map((d) => d.data()),
        }));
      });
    });
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [posts]);

  // Auto-scroll comments to bottom
  useEffect(() => {
    Object.keys(comments).forEach((postId) => {
      const box = commentBoxRefs.current[postId];
      if (box) {
        box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
      }
    });
  }, [comments]);

  const handleCommentSubmit = async (postId) => {
    const text = newComment[postId]?.trim();
    if (!text || !user) return;
    const comment = {
      text,
      email: user.email,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "memberPosts", postId, "comments"), comment);
    setNewComment((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleSlide = (postId, index, total) => {
    setSlideIndex((prev) => ({ ...prev, [postId]: (index + total) % total }));
  };

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const email = post.email || "unknown";
        const caption = post.caption || "";
        const displayName = email.split("@")[0];
        return (
          caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
          displayName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }),
    [posts, searchQuery]
  );

  if (loading) return <div className="loader">Loading Community...</div>;

  return (
    <div className="modern-posts-bg">
      <div className="posts-wrapper">
        <header className="feed-header">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="brand-title"
          >
            Community <span>Spotlight</span>
          </motion.h2>
          <div className="search-pill-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search posts or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-pill"
            />
          </div>
        </header>

        <div className="feed-container">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => {
              const totalMedia = post.media?.length || 0;
              const activeIndex = slideIndex[post.id] || 0;
              const postUser = post.email
                ? post.email.split("@")[0]
                : "Anonymous";

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={post.id}
                  className="split-post-card"
                >
                  {/* LEFT: MEDIA & CAPTION */}
                  <div className="post-left">
                    <div className="user-info">
                      <div className="avatar">
                        {postUser.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="user-name">{postUser}</h4>
                        <span className="timestamp">
                          <Clock size={12} />{" "}
                          {post.createdAt?.toDate
                            ? post.createdAt.toDate().toLocaleDateString()
                            : "Recent"}
                        </span>
                      </div>
                    </div>

                    <p className="caption-text">{post.caption}</p>

                    {totalMedia > 0 && (
                      <div className="media-container">
                        <div
                          className="media-viewer"
                          style={{
                            transform: `translateX(-${activeIndex * 100}%)`,
                          }}
                        >
                          {post.media.map((m, i) => (
                            <div key={i} className="media-slide">
                              {m.type === "image" ? (
                                <img src={m.url} alt="" />
                              ) : (
                                <video controls src={m.url} />
                              )}
                            </div>
                          ))}
                        </div>

                        {totalMedia > 1 && (
                          <>
                            <button
                              className="nav-arrow left"
                              onClick={() =>
                                handleSlide(
                                  post.id,
                                  activeIndex - 1,
                                  totalMedia
                                )
                              }
                            >
                              <ChevronLeft />
                            </button>
                            <button
                              className="nav-arrow right"
                              onClick={() =>
                                handleSlide(
                                  post.id,
                                  activeIndex + 1,
                                  totalMedia
                                )
                              }
                            >
                              <ChevronRight />
                            </button>
                            <div className="thumbnails">
                              {post.media.map((m, i) => (
                                <div
                                  key={i}
                                  className={`thumb ${
                                    i === activeIndex ? "active" : ""
                                  }`}
                                  onClick={() =>
                                    handleSlide(post.id, i, totalMedia)
                                  }
                                >
                                  {m.type === "image" ? (
                                    <img src={m.url} alt="" />
                                  ) : (
                                    <div className="video-thumb">
                                      <ImageIcon size={12} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: COMMENTS */}
                  <div className="post-right">
                    <div className="comm-header">
                      <MessageCircle size={18} /> <span>Comments</span>
                    </div>

                    <div
                      className="comments-scroll"
                      ref={(el) => (commentBoxRefs.current[post.id] = el)}
                    >
                      {(comments[post.id] || []).map((c, idx) => {
                        const isMe = user && c.email === user.email;
                        const commenterName = c.email
                          ? c.email.split("@")[0]
                          : "Guest";
                        return (
                          <div
                            key={idx}
                            className={`chat-bubble ${isMe ? "me" : ""}`}
                          >
                            <span className="author">
                              {isMe ? "You" : commenterName}
                            </span>
                            <p>{c.text}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="input-row">
                      <input
                        placeholder="Add comment..."
                        value={newComment[post.id] || ""}
                        onChange={(e) =>
                          setNewComment((p) => ({
                            ...p,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCommentSubmit(post.id)
                        }
                      />
                      <button onClick={() => handleCommentSubmit(post.id)}>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .modern-posts-bg {
          background: #f0f2f5;
          min-height: 100vh;
          padding: 80px 20px;
          font-family: "Segoe UI", Roboto, sans-serif;
        }
        .posts-wrapper {
          max-width: 1100px;
          margin: 0 auto;
        }
        .loader {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-weight: bold;
          color: #1a237e;
        }

        .feed-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .brand-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a237e;
          margin-bottom: 15px;
        }
        .brand-title span {
          color: #3b82f6;
        }

        .search-pill-container {
          position: relative;
          max-width: 450px;
          margin: 0 auto;
        }
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .search-pill {
          width: 100%;
          padding: 12px 12px 12px 45px;
          border-radius: 30px;
          border: 1px solid #ddd;
          outline: none;
          transition: 0.3s;
        }
        .search-pill:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.1);
        }

        .split-post-card {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;
          min-height: 550px;
        }

        /* Left Side */
        .post-left {
          padding: 25px;
          border-right: 1px solid #eee;
          display: flex;
          flex-direction: column;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }
        .avatar {
          width: 45px;
          height: 45px;
          background: #3b82f6;
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .user-name {
          margin: 0;
          font-size: 1.1rem;
        }
        .timestamp {
          font-size: 0.75rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .caption-text {
          color: #475569;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .media-container {
          position: relative;
          background: #000;
          border-radius: 15px;
          overflow: hidden;
          aspect-ratio: 4/3;
          margin-top: auto;
        }
        .media-viewer {
          display: flex;
          height: 100%;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .media-slide {
          min-width: 100%;
          height: 100%;
        }
        .media-slide img,
        .media-slide video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.8);
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 5;
        }
        .nav-arrow.left {
          left: 10px;
        }
        .nav-arrow.right {
          right: 10px;
        }

        .thumbnails {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          padding: 5px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .thumb {
          width: 40px;
          height: 40px;
          border-radius: 5px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.7;
        }
        .thumb.active {
          border-color: #3b82f6;
          opacity: 1;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .video-thumb {
          background: #333;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        /* Right Side */
        .post-right {
          padding: 25px;
          display: flex;
          flex-direction: column;
          background: #fafafa;
        }
        .comm-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1a237e;
        }
        .comments-scroll {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
        }

        .chat-bubble {
          background: white;
          padding: 10px 14px;
          border-radius: 15px 15px 15px 2px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
          max-width: 90%;
          align-self: flex-start;
        }
        .chat-bubble.me {
          background: #3b82f6;
          color: white;
          align-self: flex-end;
          border-radius: 15px 15px 2px 15px;
        }
        .author {
          font-size: 0.7rem;
          font-weight: bold;
          display: block;
          margin-bottom: 2px;
          opacity: 0.8;
        }
        .chat-bubble p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .input-row {
          display: flex;
          gap: 10px;
          background: white;
          padding: 8px 12px;
          border-radius: 25px;
          border: 1px solid #ddd;
        }
        .input-row input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9rem;
        }
        .input-row button {
          background: #1a237e;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
        }

        @media (max-width: 850px) {
          .split-post-card {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .post-left {
            border-right: none;
            border-bottom: 1px solid #eee;
          }
          .comments-scroll {
            max-height: 300px;
          }
        }
        /* ... existing styles ... */

        @media (max-width: 850px) {
          .split-post-card {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .post-left {
            border-right: none;
            border-bottom: 1px solid #eee;
          }
          .comments-scroll {
            max-height: 300px;
          }

          /* Reduced search bar width for mobile */
          .search-pill-container {
            max-width: 60%; /* Shrinks container */
          }
          .search-pill {
            padding: 10px 10px 10px 40px; /* Slimmer padding */
            font-size: 0.85rem; /* Smaller text */
          }
          .brand-title {
            font-size: 1.8rem; /* Shrink title to match */
          }
        }

        /* Extra small devices */
        @media (max-width: 480px) {
          .search-pill-container {
            max-width: 80%;
          }
        }
      `}</style>
    </div>
  );
};

export default Posts;
