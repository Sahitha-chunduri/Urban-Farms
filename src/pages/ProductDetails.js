import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "./firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";


function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const docRef = doc(db, "productListings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          };

          setProduct(productData);

          const currentUser = auth.currentUser;
          if (currentUser && currentUser.uid === productData.userId) {
            setIsOwner(true);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product listing?")) {
      try {
        await deleteDoc(doc(db, "productListings", id));
        alert("Product listing deleted successfully");
        navigate("/product-listings");
      } catch (err) {
        console.error("Error deleting product listing:", err);
        alert("Failed to delete product listing");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-product/${id}`);
  };

  const categoryLabels = {
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
    dairy: "Dairy",
    meat: "Meat",
    herbs: "Herbs",
    other: "Other"
  };

  const availabilityLabels = {
    available: "Available Now",
    limited: "Limited Stock",
    sold_out: "Sold Out",
    coming_soon: "Coming Soon"
  };

  return (
    <div className="product-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back to Products
      </button>

      {loading ? (
        <div className="loading">Loading product details...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : product ? (
        <div className="product-details-card">
          <div className="product-header">
            <h1>{product.title}</h1>
            <div className={`availability-badge ${product.availability}`}>
              {availabilityLabels[product.availability] || "Available"}
            </div>
          </div>

          <div className="product-image-placeholder">
            <div className="placeholder-text">Product Image</div>
          </div>

          <div className="product-main-details">
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">
                {categoryLabels[product.category] || product.category}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Price</span>
              <span className="detail-value">${parseFloat(product.price).toFixed(2)} per {product.unit}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Available Quantity</span>
              <span className="detail-value">{product.quantity} {product.unit}</span>
            </div>

            {product.harvestDate && (
              <div className="detail-item">
                <span className="detail-label">Harvest Date</span>
                <span className="detail-value">{product.harvestDate}</span>
              </div>
            )}

            {product.organic && (
              <div className="organic-badge-large">Organic</div>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="product-features">
              <h3>Features</h3>
              <div className="features-list">
                {product.features.map((feature, index) => (
                  <div key={index} className="feature-tag">{feature}</div>
                ))}
              </div>
            </div>
          )}

          <div className="contact-info">
            <h3>Contact Information</h3>
            <div className="contact-details">
              {product.contactPhone && (
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span className="contact-value">{product.contactPhone}</span>
                </div>
              )}

              {product.contactEmail && (
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">{product.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          <div className="product-footer">
            <div className="product-date">
              <span>Posted: {formatDate(product.createdAt)}</span>
              <span>By: {product.userName || "Anonymous"}</span>
            </div>

            {isOwner && (
              <div className="owner-actions">
                <button onClick={handleEdit} className="edit-button">Edit Listing</button>
                <button onClick={handleDelete} className="delete-button">Delete Listing</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="not-found">Product not found</div>
      )}
    </div>
  );
}

export default ProductDetails;