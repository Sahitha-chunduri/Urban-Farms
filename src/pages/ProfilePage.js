import React, { useEffect, useState } from "react";
import "../styles/ProfilePage.css"; 
import { db, auth } from "./firebase"; 
import { getDoc, doc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";


const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    setError("");
    const user = auth.currentUser;
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    if (!user.email) {
      setError("User email not found.");
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password changed successfully!");
      onClose();
    } catch (error) {
      setError("Error changing password. Check your current password.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="button" className="save-button" onClick={handleChangePassword}>Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};


function PostsModal({ onClose, userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

useEffect(() => {   
const fetchUserPosts = async () => {
  console.log("Attempting to fetch posts for user:", userId);
  if (!userId) {
    console.error("No userId provided to PostsModal");
    setLoading(false);
    return;
  }
  
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log("Query snapshot size:", querySnapshot.size);
    
    const postsData = [];
    querySnapshot.forEach((doc) => {
      const postData = doc.data();
      const timeValue = postData.timestamp || postData.createdAt;
      
      postsData.push({
        id: doc.id,
        content: postData.content,
        media: postData.media || [],
        timestamp: timeValue ? 
                 formatTimestamp(timeValue.toDate()) : 
                 'Just now',
        likes: postData.likes || 0
      });
    });
    
    postsData.sort((a, b) => {
      const dateA = new Date(a.rawTimestamp || 0);
      const dateB = new Date(b.rawTimestamp || 0);
      return dateB - dateA;
    });
    
    console.log("Fetched user posts:", postsData);
    setPosts(postsData);
  } catch (error) {
    console.error("Error fetching user posts:", error);
  } finally {
    setLoading(false);
  }
};

    fetchUserPosts();
  }, [userId]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content posts-modal">
        <div className="modal-header">
          <h2>My Forum Posts</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="posts-content">
          {loading ? (
            <p>Loading your posts...</p>
          ) : posts.length > 0 ? (
            <div className="posts-list">
              {posts.map(post => (
                <div className="post-item" key={post.id}>
                  <div className="post-timestamp">{post.timestamp}</div>
                  <div className="post-content">{post.content}</div>
                  
                  {post.media && post.media.length > 0 && (
                    <div className="post-media">
                      {post.media.map((url, index) => (
                        <img 
                          key={index} 
                          src={url} 
                          alt={`Post media ${index}`} 
                          className="post-image-thumbnail" 
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="post-stats">
                    <span>Likes: {post.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't created any posts yet.</p>
          )}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Close</button>
            <button 
              type="button" 
              className="save-button" 
              onClick={() => {
                navigate("/MainPage_farmer");
                onClose();
              }}
            >
              Create New Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function MyLandsModal({ onClose, userId }) {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserLands = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(collection(db, "landListings"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        const landData = [];
        querySnapshot.forEach((doc) => {
          landData.push({ id: doc.id, ...doc.data() });
        });
        
        console.log("Fetched user lands:", landData);
        setLands(landData);
      } catch (error) {
        console.error("Error fetching user lands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLands();
  }, [userId]);

  const viewLandDetails = (landId) => {
    navigate(`/land-listing/${landId}`);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content lands-modal">
        <div className="modal-header">
          <h2>My Land Listings</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="lands-content">
          {loading ? (
            <p>Loading your land listings...</p>
          ) : lands.length > 0 ? (
            <div className="lands-list">
              {lands.map(land => (
                <div className="land-item" key={land.id}>
                  <div className="land-header">
                    <h3>{land.title}</h3>
                    <span className="land-location">{land.location}</span>
                  </div>
                  <div className="land-details">
                    <p><strong>Size:</strong> {land.size} acres</p>
                    <p><strong>Price:</strong> ${typeof land.price === 'number' ? 
                      land.price.toLocaleString() : land.price}</p>
                  </div>
                  <p className="land-description">
                    {land.description ? 
                      (land.description.length > 100 ? 
                       ` ${land.description.substring(0, 100)}... `: 
                        land.description) : 
                      "No description available"}
                  </p>
                  <button 
                    className="view-details-button" 
                    onClick={() => viewLandDetails(land.id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't posted any land listings yet.</p>
          )}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Close</button>
            <button 
              type="button" 
              className="save-button" 
              onClick={() => {
                navigate("/post-land");
                onClose();
              }}
            >
              Post New Land
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ placeholder, onSearch }) {
  const [query, setQuery] = useState("");
  
  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="search-wrapper">
      <div className="search-container">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
}

function SalesModal({ onClose, userId }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSales = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, "productListings"), 
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        
        const salesData = [];
        querySnapshot.forEach((doc) => {
          const product = doc.data();
          const date = product.createdAt 
            ? product.createdAt.toDate().toISOString().split('T')[0] 
            : "N/A";
            
          salesData.push({ 
            id: doc.id, 
            date: date,
            product: product.title || "Untitled",
            quantity:` ${product.quantity || 0} ${product.unit || "units"}`,
            revenue: `$${parseFloat((product.price || 0) * (product.quantity || 0)).toFixed(2)}`
          });
        });
        
        console.log("Fetched user sales:", salesData);
        setSales(salesData);
      } catch (error) {
        console.error("Error fetching user sales:", error);
        setError("Failed to load sales data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSales();
  }, [userId]);

  const handleViewAllSales = () => {
    navigate("/product-listings");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Recent Sales</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="sales-content">
          {loading ? (
            <p>Loading your sales data...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : sales.length > 0 ? (
            <>
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.date}</td>
                      <td>{sale.product}</td>
                      <td>{sale.quantity}</td>
                      <td>{sale.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="sales-summary">
                <div className="summary-item">
                  <span>Total Revenue:</span>
                  <span>
                    {`$${sales
                      .reduce((sum, sale) => sum + parseFloat(sale.revenue.replace('$', '')), 0)
                      .toFixed(2)}`}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Number of Sales:</span>
                  <span>{sales.length}</span>
                </div>
              </div>
            </>
          ) : (
            <p>No sales data found.</p>
          )}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Close</button>
            <button 
              type="button" 
              className="save-button"
              onClick={handleViewAllSales}
            >
              View All Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyProductsModal({ onClose, userId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try { 
        const q = query(
          collection(db, "productListings"), 
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        
        const productData = [];
        querySnapshot.forEach((doc) => {
          productData.push({ id: doc.id, ...doc.data() });
        });

        productData.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });
        
        console.log("Fetched user products:", productData);
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching user products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [userId]);

  const viewProductDetails = (productId) => {
    navigate(`/product-listing/${productId}`);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content lands-modal">
        <div className="modal-header">
          <h2>My Product Listings</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="lands-content">
          {loading ? (
            <p>Loading your product listings...</p>
          ) : products.length > 0 ? (
            <div className="lands-list">
              {products.map(product => (
                <div className="land-item" key={product.id}>
                  <div className="land-header">
                    <h3>{product.title || "Untitled Product"}</h3>
                    <span className="land-location">{product.category || "Uncategorized"}</span>
                  </div>
                  <div className="land-details">
                    <p><strong>Quantity:</strong> {product.quantity || 0} {product.unit || "units"}</p>
                    <p><strong>Price:</strong> ${typeof product.price === 'number' ? 
                      product.price.toLocaleString() : (product.price || 0)} per {product.unit || "unit"}</p>
                  </div>
                  <p className="land-description">
                    {product.description ? 
                      (product.description.length > 100 ? 
                       ` ${product.description.substring(0, 100)}... `: 
                        product.description) : 
                      "No description available"}
                  </p>
                  <button 
                    className="view-details-button" 
                    onClick={() => viewProductDetails(product.id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't posted any product listings yet.</p>
          )}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Close</button>
            <button 
              type="button" 
              className="save-button" 
              onClick={() => {
                navigate("/post-product");
                onClose();
              }}
            >
              Post New Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [showMyLandsModal, setShowMyLandsModal] = useState(false);
  const [showMyProductsModal, setShowMyProductsModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        console.log("Current authenticated user:", authUser.uid);
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docsnap = await getDoc(docRef);
          if (docsnap.exists()) {
            const userData = { uid: authUser.uid, ...docsnap.data() };
            console.log("User data set in state:", userData);
            setUser(userData);
          } else {
            console.log("No user data found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No authenticated user, redirecting to login");
        setLoading(false);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLandSearch = (query) => {
    navigate(`/land-listings?search=${encodeURIComponent(query)}`);
  };

  const handleProductSearch = (query) => {
    navigate(`/product-listings?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
  
      </div>
      
      <div className="profile-options">
        {loading ? (
          <p>Loading profile information...</p>
        ) : user ? (
          <div className="profile-section">
            <h2>Profile Details</h2>
            <div className="profile-detail">
              <span className="detail-label">Username:</span>
              <span className="detail-value">{user.firstName || "N/A"}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email || "N/A"}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{user.phone || "N/A"}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{user.address || "N/A"}</span>
            </div>
          </div>
        ) : (
          <p>No user information available. Please login again.</p>
        )}

        <div className="action-buttons">
          <h3>Find Agricultural Land</h3>
          <SearchBar placeholder="Search for land listings" onSearch={handleLandSearch} />
          <h3>Browse Products</h3>
          <SearchBar placeholder="Search for Products" onSearch={handleProductSearch} />
          <div className="button-section">
            <h3>Account Management</h3>
            <button className="profile-button primary-button" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
            <button className="profile-button primary-button" onClick={() => setShowSalesModal(true)}>
              Sales History
            </button>
          </div>
          
          <div className="button-section">
            <h3>My Content</h3>
            <button className="profile-button primary-button" onClick={() => setShowPostsModal(true)}>
              My Forum Posts
            </button>
            <button className="profile-button primary-button" onClick={() => setShowMyLandsModal(true)}>
              My Land Listings
            </button>
            <button className="profile-button primary-button" onClick={() => setShowMyProductsModal(true)}>
              My Product Listings
            </button>
          </div>
          
          <div className="button-section">
            <h3>Create Content</h3>
            <button 
              className="profile-button primary-button" 
              onClick={() => navigate("/post-land")}
            >
              Post New Land Listing
            </button>
            <button 
              className="profile-button primary-button" 
              onClick={() => navigate("/post-product")}
            >
              Post Products for sale
            </button>
          </div>
          
          <div className="button-section">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      
      {showSalesModal && user && (
        <SalesModal onClose={() => setShowSalesModal(false)} userId={user.uid} />
      )}
      
      {showMyLandsModal && user && (
        <MyLandsModal onClose={() => setShowMyLandsModal(false)} userId={user.uid} />
      )}
      
      {showMyProductsModal && user && (
        <MyProductsModal onClose={() => setShowMyProductsModal(false)} userId={user.uid} />
      )}
      
      {showPostsModal && user && (
        <PostsModal onClose={() => setShowPostsModal(false)} userId={user.uid} />
      )}
    </div>
  );
}

export default ProfilePage;