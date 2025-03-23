import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "./firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import "../styles/LandDetails.css";

function LandDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        const docRef = doc(db, "landListings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const listingData = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          };

          setListing(listingData);

          const currentUser = auth.currentUser;
          if (currentUser && currentUser.uid === listingData.userId) {
            setIsOwner(true);
          }
        } else {
          setError("Listing not found");
        }
      } catch (err) {
        console.error("Error fetching listing details:", err);
        setError("Failed to load listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteDoc(doc(db, "landListings", id));
        alert("Listing deleted successfully");
        navigate("/land-listings");
      } catch (err) {
        console.error("Error deleting listing:", err);
        alert("Failed to delete listing");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-land/${id}`);
  };

  const propertyTypeLabels = {
    agricultural: "Agricultural Land",
    residential: "Residential Farm",
    commercial: "Commercial Farm",
    mixed: "Mixed Use",
  };

  const availabilityLabels = {
    available: "Available Now",
    pending: "Pending",
    coming_soon: "Coming Soon",
  };

  return (
    <div className="land-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back to Listings
      </button>

      {loading ? (
        <div className="loading">Loading listing details...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : listing ? (
        <div className="listing-details-card">
          <div className="listing-header">
            <h1>{listing.title}</h1>
            <div className={`availability-badge ${listing.availability}`}>
              {availabilityLabels[listing.availability] || "Available"}
            </div>
          </div>

          <div className="listing-image-placeholder">
            <div className="placeholder-text">Land Image</div>
          </div>

          <div className="listing-main-details">
            <div className="detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-value">{listing.location}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Size</span>
              <span className="detail-value">{listing.size}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Price</span>
              <span className="detail-value">${Number(listing.price).toLocaleString()}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Property Type</span>
              <span className="detail-value">
                {propertyTypeLabels[listing.propertyType] || listing.propertyType}
              </span>
            </div>
          </div>

          <div className="listing-description">
            <h3>Description</h3>
            <p>{listing.description}</p>
          </div>

          {listing.features && listing.features.length > 0 && (
            <div className="listing-features">
              <h3>Features</h3>
              <div className="features-list">
                {listing.features.map((feature, index) => (
                  <div key={index} className="feature-tag">{feature}</div>
                ))}
              </div>
            </div>
          )}

          <div className="contact-info">
            <h3>Contact Information</h3>
            <div className="contact-details">
              {listing.contactPhone && (
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span className="contact-value">{listing.contactPhone}</span>
                </div>
              )}

              {listing.contactEmail && (
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">{listing.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          <div className="listing-footer">
            <div className="listing-date">
              <span>Posted: {formatDate(listing.createdAt)}</span>
              <span>By: {listing.userName || "Anonymous"}</span>
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
        <div className="not-found">Listing not found</div>
      )}
    </div>
  );
}

export default LandDetails;
