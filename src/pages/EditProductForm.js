import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/PostProduct.css"; // Reusing the same styles

function EditProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    quantity: "",
    unit: "",
    price: "",
    description: "",
    harvestDate: "",
    organic: false,
    features: [],
    contactPhone: "",
    contactEmail: "",
    availability: ""
  });
  const [featureInput, setFeatureInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const docRef = doc(db, "productListings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();
          
          // Check if current user is the owner
          const currentUser = auth.currentUser;
          if (!currentUser || currentUser.uid !== productData.userId) {
            setError("You don't have permission to edit this product");
            navigate(-1);
            return;
          }

          setFormData({
            title: productData.title || "",
            category: productData.category || "vegetables",
            quantity: productData.quantity || "",
            unit: productData.unit || "kg",
            price: productData.price || "",
            description: productData.description || "",
            harvestDate: productData.harvestDate || "",
            organic: productData.organic || false,
            features: productData.features || [],
            contactPhone: productData.contactPhone || "",
            contactEmail: productData.contactEmail || "",
            availability: productData.availability || "available"
          });
        } else {
          setError("Product not found");
          navigate("/product-listings");
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to load product data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
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
        setError("You must be logged in to update products");
        setLoading(false);
        return;
      }

      const productRef = doc(db, "productListings", id);
      await updateDoc(productRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });

      alert("Product listing updated successfully!");
      navigate(`/product-listing/${id}`);
    } catch (error) {
      console.error("Error updating product listing:", error);
      setError("Failed to update product listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="loading">Loading product data...</div>;
  }

  return (
    <div className="post-product-container">
      <div className="post-product-header">
        <button onClick={() => navigate("/product-listings")} className="back-button">
          &larr; Back
        </button>
        <h2>Edit Farm Product</h2>
      </div>
      <form onSubmit={handleSubmit} className="post-product-form">
        <div className="form-group">
          <label>Product Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Organic Tomatoes"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="herbs">Herbs</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Organic</label>
            <div className="checkbox-container">
              <input
                type="checkbox"
                name="organic"
                checked={formData.organic}
                onChange={handleChange}
              />
              <span>This product is grown organically</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantity Available</label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 50"
              required
            />
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
              <option value="g">Grams (g)</option>
              <option value="oz">Ounces (oz)</option>
              <option value="bunch">Bunch</option>
              <option value="piece">Piece</option>
              <option value="dozen">Dozen</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price (per unit)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 3.99"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your product, quality, taste, etc."
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Harvest Date</label>
            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Availability</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
            >
              <option value="available">Available Now</option>
              <option value="limited">Limited Stock</option>
              <option value="sold_out">Sold Out</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Features</label>
          <div className="feature-input">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="e.g., Pesticide-free, Heirloom variety"
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
            {loading ? "Updating..." : "Update Product Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProductForm;