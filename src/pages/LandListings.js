import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/LandListings.css";

function LandListings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    minSize: "",
    maxSize: "",
    minPrice: "",
    maxPrice: "",
    propertyType: ""
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(
          collection(db, "landListings"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const listingsData = [];
        querySnapshot.forEach((doc) => {
          listingsData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });

        setListings(listingsData);
        setFilteredListings(listingsData);
      } catch (err) {
        console.error("Error fetching land listings:", err);
        setError("Failed to load land listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.location.toLowerCase().includes(query)
      );
    }

    if (filters.location) {
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minSize) {
      const minSize = parseFloat(filters.minSize);
      filtered = filtered.filter((listing) => {
        const sizeValue = parseFloat(listing.size);
        return !isNaN(sizeValue) && sizeValue >= minSize;
      });
    }

    if (filters.maxSize) {
      const maxSize = parseFloat(filters.maxSize);
      filtered = filtered.filter((listing) => {
        const sizeValue = parseFloat(listing.size);
        return !isNaN(sizeValue) && sizeValue <= maxSize;
      });
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter((listing) => {
        const priceValue = parseFloat(listing.price);
        return !isNaN(priceValue) && priceValue >= minPrice;
      });
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter((listing) => {
        const priceValue = parseFloat(listing.price);
        return !isNaN(priceValue) && priceValue <= maxPrice;
      });
    }

    if (filters.propertyType) {
      filtered = filtered.filter(
        (listing) => listing.propertyType === filters.propertyType
      );
    }

    setFilteredListings(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      location: "",
      minSize: "",
      maxSize: "",
      minPrice: "",
      maxPrice: "",
      propertyType: ""
    });
    setFilteredListings(listings);
  };

  const viewListingDetails = (listingId) => {
    navigate(`/land-listing/${listingId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="land-listings-container">
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by title, description, or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          placeholder="Min Size (acres)"
          name="minSize"
          value={filters.minSize}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          placeholder="Max Size (acres)"
          name="maxSize"
          value={filters.maxSize}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          placeholder="Min Price"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          placeholder="Max Price"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <select
          name="propertyType"
          value={filters.propertyType}
          onChange={handleFilterChange}
        >
          <option value="">All Property Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="agricultural">Agricultural</option>
        </select>
        <button onClick={applyFilters}>Apply Filters</button>
        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      {loading ? (
        <div className="loading">Loading land listings...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="listings-grid">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="listing-card"
                onClick={() => viewListingDetails(listing.id)}
              >
                <h3>{listing.title}</h3>
                <p className="description">{listing.description}</p>
                <p className="location">{listing.location}</p>
                <p className="date">{formatDate(listing.createdAt)}</p>
                <p className="size">{listing.size} acres</p>
                <p className="price">${listing.price.toLocaleString()}</p>
              </div>
            ))
          ) : (
            <div className="no-results">No land listings match your search criteria.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default LandListings;