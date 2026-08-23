import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ResetPassword.css";

function ResetPassword() {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const API_URL = "https://second-brain-backend-bvxz.onrender.com";


  const handleResetPassword = async () => {

    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token: token,
            new_password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          "Could not reset password."
        );

        return;
      }

      setMessage(
        "Password reset successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      setError(
        "Could not connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="reset-password-page">

      <div className="reset-password-card">

        <h2>
          🔐 Reset Password
        </h2>

        <p>
          Enter your new password below.
        </p>


        {error && (
          <div className="reset-error">
            {error}
          </div>
        )}


        {message && (
          <div className="reset-success">
            {message}
          </div>
        )}


        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />


        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />


        <button
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>


        <a
          href="/"
          className="reset-password-back"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          ← Back to Login
        </a>

      </div>

    </div>
  );
}

export default ResetPassword;