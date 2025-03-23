import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { toast } from "react-toastify";

function SignUp() {
  const [formData, setFormData] = useState({
    role: "Land Lender",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimateForm(true); 
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;


    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      document.querySelector(".signup-form").classList.add("shake");
      setTimeout(() => document.querySelector(".signup-form").classList.remove("shake"), 500);
      return;
    }

    setLoading(true);

    const { firstName, lastName, email, phone, address, password, confirmPassword, role } = formData;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        phone,
        address,
        role,
        createdAt: new Date().toISOString(),
      });

      toast.success("User Registered Successfully!", {
        position: "top-right",
      });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please use a different email.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else {
        toast.error(`Authentication error: ${error.code}`);
      }
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault(); 
    navigate("/");
  };

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="logo">AgriConnect</div>
        <nav className="nav-menu">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className={`main-content ${animateForm ? "fade-in" : ""}`}>
        <div className="page-background">
          <div className="bg-circle circle1"></div>
          <div className="bg-circle circle2"></div>
          <div className="bg-circle circle3"></div>
        </div>

        <div className="content-wrapper">
          <div className="info-section">
            <h1>Join Our Community</h1>
            <p>Connect with farmers, land lenders, and customers to grow your agricultural business.</p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🌱</div>
                <div className="feature-text">Connect with local farmers</div>
              </div>
              <div className="feature">
                <div className="feature-icon">🌎</div>
                <div className="feature-text">Find available farmland</div>
              </div>
              <div className="feature">
                <div className="feature-icon">🚜</div>
                <div className="feature-text">Access farming resources</div>
              </div>
            </div>
          </div>

          <div className="signup-section">
            <div className="signup-form">
              <h2>Sign Up</h2>
              {success && <p className="success-message">Signup successful! Redirecting...</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group compact">
                  <label htmlFor="role">I am a:</label>
                  <select 
                    id="role" 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Land Lender">Land Lender</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group compact">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "error" : ""}
                      required
                    />
                    {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                  </div>
                  
                  <div className="form-group compact">
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "error" : ""}
                      required
                    />
                    {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="form-group compact">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                    required
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div className="form-group compact">
                  <label htmlFor="phone">Phone:</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error" : ""}
                    required
                  />
                  {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>

                <div className="form-group compact">
                  <label htmlFor="address">Address:</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "error" : ""}
                    required
                  />
                  {errors.address && <p className="error-text">{errors.address}</p>}
                </div>

                <div className="form-group compact">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                    required
                  />
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>

                <div className="form-group compact">
                  <label htmlFor="confirmPassword">Confirm Password:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "error" : ""}
                    required
                  />
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>

                <button type="submit" className={`submit-button ${loading ? "loading" : ""}`}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </form>
              <p className="login-text">
                Already have an account? <a onClick={handleLoginClick}>Log in</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <p>&copy; 2025 AgriConnect. All rights reserved.</p>
          <div className="footer-links">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/help">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SignUp;
