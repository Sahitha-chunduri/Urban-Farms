import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";
import { AnimatePresence } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("User Login Successfully!", {
        position: "top-right",
      });
      navigate("/MainPage_farmer");
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        toast.error("User not found. Please check your email.");
      } else {
        toast.error(`Login error: ${error.code}`);
      }
    }
  };

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="background-animation"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      ></motion.div>
      <motion.div
        className="login-box"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <GiFarmer size={50} color="#4CAF50" />
        <h2>Welcome Back!</h2>
        <p>Grow your success by logging in</p>
        <form onSubmit={handleLogin}>
          <motion.input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />
          <motion.input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />

          <div className="extras">
            <label className="remember-me">
              <input type="checkbox" /> <span>Remember me</span>
            </label>
            <span
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Log In
          </motion.button>

          <div className="or-separator">or</div>

          <div className="social-login-buttons">
            <motion.button
              type="button"
              className="google-login"
              whileHover={{ scale: 1.05 }}
              onClick={() => console.log("Google login")}
            >
              <FaGoogle size={18} /> Google
            </motion.button>
            <motion.button
              type="button"
              className="facebook-login"
              whileHover={{ scale: 1.05 }}
              onClick={() => console.log("Facebook login")}
            >
              <FaFacebook size={18} /> Facebook
            </motion.button>
          </div>
        </form>
        <p className="signup-text">
          New to farming? <span onClick={() => navigate("/signup")}>Join us</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default Login;
