import React, { useState } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/PostLand.css";

function PostLandForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    size: "",
    location: "",
    price: "",
    description: "",
    features: [],
    contactPhone: "",
    contactEmail: "",
    propertyType: "agricultural", 
    availability: "available"
  });
  const [featureInput, setFeatureInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addFeature = () => {
    if (featureInput.trim() !== "") {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      
      if (!user) {
        setError("You must be logged in to post land listings");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "landListings"), {
        ...formData,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      alert("Land listing posted successfully!");
      navigate("/land-listings");
    } catch (error) {
      console.error("Error posting land listing:", error);
      setError("Failed to post land listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-land-container">
      <h2>Post Land Listing</h2>
      <form onSubmit={handleSubmit} className="post-land-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Fertile Valley Plot"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Size (acres)</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="e.g., 15 acres"
              required
            />
          </div>

          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 45000"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Northern California"
            required
          />
        </div>

        <div className="form-group">
          <label>Property Type</label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
          >
            <option value="agricultural">Agricultural Land</option>
            <option value="residential">Residential Farm</option>
            <option value="commercial">Commercial Farm</option>
            <option value="mixed">Mixed Use</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the land, soil quality, water access, etc."
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Features</label>
          <div className="feature-input">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="e.g., Water well, Barn, Fencing"
            />
            <button type="button" onClick={addFeature}>Add</button>
          </div>
          <div className="features-list">
            {formData.features.map((feature, index) => (
              <div key={index} className="feature-tag">
                {feature}
                <span onClick={() => removeFeature(index)}>&times;</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Availability</label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
          >
            <option value="available">Available Now</option>
            <option value="pending">Pending</option>
            <option value="coming_soon">Coming Soon</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="Contact phone number"
            />
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="Contact email"
            />
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Posting..." : "Post Land Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostLandForm;