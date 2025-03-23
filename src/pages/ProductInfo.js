import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "./firebase"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";
import "../styles/ProductInfo.css"; // Make sure this file exists

function ProductInfo() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    setDebugInfo({
      currentPath: location.pathname,
      params: params,
      productId: params.id 
    });
    
    console.log("Debug Info:", {
      currentPath: location.pathname,
      params: params,
      productId: params.id 
    });
  }, [location, params]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const productId = params.id; 
      
      if (!productId) {
        console.error("No product ID in params:", params);
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching product with ID:", productId);
        const productDoc = doc(db, "productListings", productId);
        const productSnap = await getDoc(productDoc);

        if (productSnap.exists()) {
          const productData = { id: productSnap.id, ...productSnap.data() };
          console.log("Product data retrieved:", productData);
          setProduct(productData);
        } else {
          console.error("No product found with ID:", productId);
          setError("Product not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(`Failed to load product details: ${err.message}`);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="back-button">
            &larr; Back
          </button>
          <h1>Loading Product Details...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="back-button">
            &larr; Back
          </button>
          <h1>Error</h1>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="action-button" 
            onClick={() => navigate("/product-listings")}
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
        <h1>{product ? product.title : "Product Detail"}</h1>
      </div>

      {product && (
        <div className="product-detail-container">
          <div className="product-main-info">
            <div className="product-header-section">
              <h2>{product.title}</h2>
              {product.category && <span className="product-category">{product.category}</span>}
              {product.organic && (
                <span className="organic-badge">Organic Certified</span>
              )}
            </div>

            <div className="product-details-section">
              <div className="detail-item">
                <span className="detail-label">Price:</span>
                <span className="detail-value">
                  ${product.price} per {product.unit}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Quantity Available:</span>
                <span className="detail-value">{product.quantity} {product.unit}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Harvest Date:</span>
                <span className="detail-value">{product.harvestDate}</span>
              </div>
            </div>

            <div className="product-description-section">
              <h3>Description</h3>
              <p>{product.description || "No description provided"}</p>
            </div>

            <div className="contact-information-section">
              <h3>Contact Information</h3>
              <div className="detail-item">
                <span className="detail-label">Seller Name:</span>
                <span className="detail-value">{product.userName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  <a href={`mailto:${product.contactEmail}`}>{product.contactEmail}</a>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  <a href={`tel:${product.contactPhone}`}>{product.contactPhone}</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductInfo;