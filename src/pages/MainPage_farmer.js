import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import ComposePost from './ComposePost';
import ProfilePage from './ProfilePage';
import ChatPanel from './ChatPanel';
import message from '../posts/Message.png';
import profileIcon from '../posts/profileIcon.jpg';
import SalesUpdate from "./SalesUpdate";
import { Heart, MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db, auth } from './firebase';
import { toast } from 'react-toastify';

function MainPage_farmer() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposeActive, setIsComposeActive] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);

  useEffect(() => {
    const fetchPosts = () => {
      setIsLoading(true);
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("timestamp", "desc")
      );
     
      const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
        const postsData = [];
        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          postsData.push({
            id: doc.id,
            username: postData.username,
            userEmail: postData.userEmail,
            userId: postData.userId,
            content: postData.content,
            media: postData.media || [],
            timestamp: postData.timestamp ? 
                       formatTimestamp(postData.timestamp.toDate()) : 
                       'Just now',
            likes: postData.likes || 0,
            comments: postData.comments?.length || 0,
            shares: postData.shares || 0,
            liked: false 
          });
          
          if (postData.userId && !userProfiles[postData.userId]) {
            fetchUserProfile(postData.userId);
          }
        });
        
        setPosts(postsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
        setIsLoading(false);
      });
      
      return unsubscribe;
    };
    
    fetchPosts();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfiles(prev => ({
          ...prev,
          [userId]: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePic: userData.profilePic || profileIcon
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  
  const formatTimestamp = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSecs < 60) {
      return 'Just now';
    } else if (diffInMins < 60) {
      return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const toggleChatPanel = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleAddPost = () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to create a post");
      navigate('/');
      return;
    }
    setIsComposeActive(true);
  };

  const handleCloseCompose = () => {
    setIsComposeActive(false);
  };

  const handleCreatePost = (content, mediaUrls) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const newPost = {
        id: Date.now().toString(),
        username: currentUser.displayName || currentUser.email,
        userId: currentUser.uid,
        content: content,
        media: mediaUrls,
        timestamp: 'Just now',
        profilePic: userProfiles[currentUser.uid]?.profilePic || profileIcon,
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false
      };
      setPosts([newPost, ...posts]);
    }
    setIsComposeActive(false);
  };

  const handleLike = async (postId) => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to like posts");
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const liked = postDoc.data().likedBy?.includes(auth.currentUser.uid);
        
        await updateDoc(postRef, {
          likes: liked ? increment(-1) : increment(1),
          likedBy: liked 
            ? postDoc.data().likedBy.filter(id => id !== auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid)
        });

        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: liked ? post.likes - 1 : post.likes + 1,
              liked: !liked
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleShare = async (postId) => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to share posts");
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);

      await updateDoc(postRef, {
        shares: increment(1)
      });

      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            shares: post.shares + 1
          };
        }
        return post;
      }));
      
      toast.success("Post shared successfully!");
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    }
  };

  const toggleCommentSection = (postId) => {
    setActiveCommentId(activeCommentId === postId ? null : postId);
    setCommentText('');
  };

  const handleCommentSubmit = async (postId) => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to comment");
      return;
    }

    if (commentText.trim()) {
      try {
        const postRef = doc(db, "posts", postId);
        const currentUser = auth.currentUser;

        const newComment = {
          userId: currentUser.uid,
          username: currentUser.displayName || currentUser.email,
          text: commentText,
          timestamp: new Date()
        };

        await updateDoc(postRef, {
          comments: arrayUnion(newComment)
        });

        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1
            };
          }
          return post;
        }));
        
        setCommentText('');
        toast.success("Comment added successfully!");
      } catch (error) {
        console.error("Error adding comment:", error);
        toast.error("Failed to add comment");
      }
    }
  };

  return (
    <div className="App farming-background">
      <ChatPanel isChatOpen={isChatOpen} onClose={toggleChatPanel} />

      <div className="top-right-icons">
        <img
          src={profileIcon}
          alt="Profile"
          onClick={() => navigate('/ProfilePage')}
        />
        <img
          src={message}
          alt="Messages"
          onClick={toggleChatPanel}
        />
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : (
        <div className="posts-container">
          {posts.length > 0 ? (
            posts.map(post => (
              <div className="post" key={post.id}>
                <div className="post-header">
                  <img
                    src={userProfiles[post.userId]?.profilePic || profileIcon}
                    alt={`${userProfiles[post.userId] ? 
                      `${userProfiles[post.userId].firstName} ${userProfiles[post.userId].lastName}` : 
                      post.username}'s profile`}
                    className="post-profile-pic"
                  />
                  <div className="post-user-info">
                    <div className="username">
                      {userProfiles[post.userId] ? 
                        `${userProfiles[post.userId].firstName} ${userProfiles[post.userId].lastName}` : 
                        post.username}
                    </div>
                    <div className="timestamp">{post.timestamp}</div>
                  </div>
                </div>
                <div className="content">{post.content}</div>
                
                {post.media && post.media.length > 0 && (
                  <div className="post-media">
                    {post.media.map((url, index) => (
                      <img 
                        key={index} 
                        src={url} 
                        alt={`Post media ${index}`} 
                        className="post-image" 
                      />
                    ))}
                  </div>
                )}
                
                <div className="post-engagement">
                  <div className={`engagement-action ${post.liked ? 'active' : ''}`} onClick={() => handleLike(post.id)}>
                    <ThumbsUp size={18} className={post.liked ? 'liked' : ''} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="engagement-action" onClick={() => toggleCommentSection(post.id)}>
                    <MessageCircle size={18} />
                    <span>{post.comments}</span>
                  </div>
                  <div className="engagement-action" onClick={() => handleShare(post.id)}>
                    <Share2 size={18} />
                    <span>{post.shares}</span>
                  </div>
                </div>
                
                {activeCommentId === post.id && (
                  <div className="comment-section">
                    <div className="comment-input-container">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="comment-input"
                      />
                      <button 
                        className="comment-submit"
                        onClick={() => handleCommentSubmit(post.id)}
                      >
                        Post
                      </button>
                    </div>
                    <div className="sample-comments">
                      <div className="sample-comment">
                        <img src={profileIcon} alt="Commenter" className="comment-profile-pic" />
                        <div className="comment-content">
                          <div className="comment-username">FarmingEnthusiast</div>
                          <div className="comment-text">Great post! Thanks for sharing your experience.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-posts">
              <p>No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      )}
      
      <ComposePost
        isActive={isComposeActive}
        onClose={handleCloseCompose}
        onPost={handleCreatePost}
      />
      
      <div className="add-post-button" onClick={handleAddPost}>+</div>
    </div>
  );
}

export default MainPage_farmer;