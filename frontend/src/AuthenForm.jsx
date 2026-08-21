import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://10.120.56.140:8000";

const AuthenForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      console.log("LOGIN STATUS:", response.status);
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setError(data.detail || "Login failed.");
        return;
      }

      const user = {
        id: data.id,
        email: data.email,
      };

      localStorage.setItem("user", JSON.stringify(user));

      console.log("USER SAVED:", localStorage.getItem("user"));

      setMessage("Login successful!");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setError("Could not connect to the server.");
    }
  };

  const handleSignup = async () => {
    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Signup failed.");
        return;
      }

      setMessage("Account created successfully! Please login.");

      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Signup error:", error);
      setError("Could not connect to the server.");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Could not process request.");
        return;
      }

      if (data.reset_link) {
        navigate(
          data.reset_link.replace("http://localhost:5173", "")
        );
      } else {
        setMessage(
          "If this email is registered, a reset link has been generated."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Could not connect to the server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-layout">
        <div className="auth-brand">
          <div className="brain-icon">🧠</div>

          <h1>Second Brain</h1>

          <p>
            Organize your knowledge.
            <br />
            Remember what matters.
          </p>

          <div className="brand-line"></div>

          <span>Your personal knowledge workspace</span>
        </div>

        <div className="form-container">
          {forgotPassword ? (
            <div className="form">
              <div className="form-header">
                <span className="form-icon">🔐</span>

                <h2>Reset your password</h2>

                <p>
                  Enter your registered email and we'll help you get back in.
                </p>
              </div>

              {error && (
                <div className="message error-message">
                  {error}
                </div>
              )}

              {message && (
                <div className="message success-message">
                  {message}
                </div>
              )}

              <label>Email address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                className="primary-button"
                onClick={handleForgotPassword}
              >
                Reset Password
              </button>

              <button
                className="back-button"
                onClick={() => {
                  setForgotPassword(false);
                  setIsLogin(true);
                  setError("");
                  setMessage("");
                }}
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="form-toggle">
                <button
                  className={isLogin ? "active" : ""}
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setMessage("");
                  }}
                >
                  Login
                </button>

                <button
                  className={!isLogin ? "active" : ""}
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setMessage("");
                  }}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="message error-message">
                  {error}
                </div>
              )}

              {message && (
                <div className="message success-message">
                  {message}
                </div>
              )}

              {isLogin ? (
                <div className="form">
                  <div className="form-header">
                    <span className="form-icon">👋</span>

                    <h2>Welcome back</h2>

                    <p>
                      Sign in to continue to your Second Brain.
                    </p>
                  </div>

                  <label>Email address</label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <label>Password</label>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="forgot-row">
                    <button
                      className="forgot-link"
                      onClick={() => {
                        setForgotPassword(true);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    className="primary-button"
                    onClick={handleLogin}
                  >
                    Login
                  </button>

                  <p className="bottom-text">
                    Don't have an account?

                    <button
                      className="switch-link"
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              ) : (
                <div className="form">
                  <div className="form-header">
                    <span className="form-icon">✨</span>

                    <h2>Create your account</h2>

                    <p>
                      Start organizing your knowledge with Second Brain.
                    </p>
                  </div>

                  <label>Email address</label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <label>Password</label>

                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <label>Confirm password</label>

                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <button
                    className="primary-button"
                    onClick={handleSignup}
                  >
                    Create Account
                  </button>

                  <p className="bottom-text">
                    Already have an account?

                    <button
                      className="switch-link"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Login
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenForm;