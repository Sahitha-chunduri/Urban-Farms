import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import ComposePost from './ComposePost';
import ProfilePage from './ProfilePage';
import ChatPanel from './ChatPanel';
import message from '../posts/Message.png';
import profileIcon from '../posts/profileIcon.jpg';
import SalesUpdate from "./SalesUpdate";
import { db, auth } from '../firebase'; // Make sure path is correct
import { collection, addDoc, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';

function Feed() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isComposeActive, setIsComposeActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Check for authentication and fetch user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/');
        return;
      }
      
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: formatTimestamp(doc.data().createdAt)
        }));
        
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser]);

  // Format timestamp function
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const now = new Date();
      const postDate = timestamp.toDate();
      const diffInMs = now - postDate;
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMins < 60) {
        return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
      }
    } catch (error) {
      console.error("Error formatting timestamp: ", error);
      return 'Unknown';
    }
  };

  const toggleChatPanel = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleAddPost = () => {
    setIsComposeActive(true);
  };

  const handleCloseCompose = () => {
    setIsComposeActive(false);
  };

  const handleCreatePost = async (content, media) => {
    try {
      // Get current user info
      const user = auth.currentUser;
      
      if (!user) {
        console.error("User not authenticated");
        navigate('/');
        return;
      }
      
      // Create post object
      const postData = {
        username: user.displayName || `${currentUser.firstName} ${currentUser.lastName}` || 'Anonymous User',
        userId: user.uid,
        content: content,
        media: media || [],
        profilePic: user.photoURL || profileIcon,
        createdAt: Timestamp.now()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Add to local state with ID from Firestore
      const newPost = {
        id: docRef.id,
        ...postData,
        timestamp: 'Just now'
      };
      
      setPosts([newPost, ...posts]);
      setIsComposeActive(false);
    } catch (error) {
      console.error("Error adding post: ", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="App">
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
        <button 
          className="logout-button" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      
      <div className="posts-container">
        {loading ? (
          <div className="loading-indicator">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts-message">No posts yet. Be the first to share!</div>
        ) : (
          posts.map(post => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <img 
                  src={post.profilePic} 
                  alt={`${post.username}'s profile`} 
                  className="post-profile-pic" 
                />
                <div className="post-user-info">
                  <div className="username">{post.username}</div>
                  <div className="timestamp">{post.timestamp}</div>
                </div>
              </div>
              <div className="content">{post.content}</div>
              {post.media && post.media.length > 0 && (
                <div className="media-container">
                  {post.media.map((mediaItem, index) => (
                    <img 
                      key={index}
                      src={mediaItem} 
                      alt={`Post media ${index}`}
                      className="post-media" 
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <ComposePost 
        isActive={isComposeActive}
        onClose={handleCloseCompose}
        onPost={handleCreatePost}
      />
      
      <div className="add-post-button" onClick={handleAddPost}>+</div>
    </div>
  );
}

export default Feed;