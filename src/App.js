import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ProfilePage from './pages/ProfilePage';
import SalesUpdate from "./pages/SalesUpdate";
import Login from './pages/Login';
import Signup from './pages/SignUp';
import MainPage_farmer from './pages/MainPage_farmer';
import LandListings from './pages/LandListings';
import LandDetails from './pages/LandDetails';
import PostLandForm from './pages/PostLandForm';
import { ToastContainer } from 'react-toastify';
import EditProductForm from './pages/EditProductForm';
import PostProductForm from './pages/PostProductForm';
import ProductDetails from './pages/ProductDetails';
import ProductListings from './pages/ProductListings';
import ProductInfo from './pages/ProductInfo';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/ProfilePage" element={<ProfilePage />} />
        <Route path="/SalesUpdate" element={<SalesUpdate />} /> 
        <Route path="/signup" element={<Signup />} />
        <Route path="/MainPage_farmer" element={<MainPage_farmer />} />
        <Route path="/land-listings" element={<LandListings />} />
        <Route path="/land-listing/:id" element={<LandDetails />} />
        <Route path="/post-land" element={<PostLandForm />} />
        <Route path="/edit-land/:id" element={<PostLandForm />} />   
        <Route path="/post-product" element={<PostProductForm />} />
        <Route path="/ProductDetails" element={<ProductDetails />} />
        <Route path="/product-listings" element={<ProductListings />} />
        <Route path="/product-listings/:id" element={<ProductListings />} />
        <Route path="/product-Info/:id" element={<ProductInfo />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;