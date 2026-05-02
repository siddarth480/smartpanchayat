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
import "./Posts.css";

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
            {filteredPosts.length === 0 ? (
              <motion.div
                key="no-data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="empty-state"
              >
                <div className="empty-state-icon">
                  <Search size={48} />
                </div>
                <h3>No posts found</h3>
                <p>We couldn't find any posts matching "{searchQuery}"</p>
              </motion.div>
            ) : (
              filteredPosts.map((post, index) => {
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
            })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Posts;
