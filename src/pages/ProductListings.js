import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, getDocs, where } from "firebase/firestore";


function ProductListingsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    setSearchQuery(search);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let productQuery;
        
        if (searchQuery) {
          productQuery = query(
            collection(db, "productListings"),
            where("title", ">=", searchQuery),
            where("title", "<=", searchQuery + "\uf8ff")
          );
        } else {
          productQuery = query(collection(db, "productListings"));
        }

        const querySnapshot = await getDocs(productQuery);
        
        const productList = [];
        querySnapshot.forEach((doc) => {
          productList.push({ id: doc.id, ...doc.data() });
        });
        const filteredProducts = searchQuery 
          ? productList.filter(product => 
              product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
            )
          : productList;

        console.log("Fetched products:", filteredProducts);
        setProducts(filteredProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/product-listings?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const viewProductDetails = (productId) => {
    navigate(`/product-Info/${productId}`);
  };

  return (
    <div className="product-listings-page">
      <div className="listings-header">
        
        <h1>
          {searchQuery ? `Product Results for "${searchQuery}"`: "All Products"}
        </h1>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      <div className="products-container">
        {loading ? (
          <p className="loading-message">Loading products...</p>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <div className="product-header">
                  <h3>{product.title}</h3>
                  {product.category && <span className="product-category">{product.category}</span>}
                </div>
                <div className="product-details">
                  <p>
                    <strong>Price:</strong> ${typeof product.price === 'number' ? 
                      product.price.toLocaleString() : product.price} per {product.unit}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {product.quantity} {product.unit} available
                  </p>
                  {product.organicCertified && (
                    <p className="organic-badge">Organic Certified</p>
                  )}
                </div>
                <p className="product-description">
                  {product.description ? 
                    (product.description.length > 100 ? 
                      `${product.description.substring(0, 100)}... `: 
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
          <div className="no-results">
            <p>No products found matching "{searchQuery}"</p>
            <button 
              className="clear-search-button"
              onClick={() => navigate("/product-listings")}
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductListingsPage;