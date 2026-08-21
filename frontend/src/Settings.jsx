import { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    username: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const API_URL = "http://10.120.56.140:8000";

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const userId = user?.id;

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setProfileMessage(
          "❌ User information not found."
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/profile/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not load profile."
          );
        }

        setProfile({
          fullName: data.full_name || "",
          email: data.email || "",
          username: data.username || "",
        });

      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        setProfileMessage(
          `❌ ${error.message}`
        );
      }
    };

    loadProfile();
  }, [userId]);

  // ==========================================
  // PROFILE INPUT CHANGE
  // ==========================================

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

    setProfileMessage("");
  };

  // ==========================================
  // PASSWORD INPUT CHANGE
  // ==========================================

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });

    setPasswordMessage("");
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const saveProfile = async () => {
    setProfileMessage("");

    if (
      !profile.fullName.trim() ||
      !profile.email.trim() ||
      !profile.username.trim()
    ) {
      setProfileMessage(
        "❌ Please fill all fields."
      );

      return;
    }

    if (!userId) {
      setProfileMessage(
        "❌ User information not found."
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/profile/${userId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            full_name: profile.fullName,
            email: profile.email,
            username: profile.username,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(
          `❌ ${data.detail || "Could not update profile."}`
        );

        return;
      }

      // Update localStorage with new email
      const updatedUser = {
        id: data.id,
        email: data.email,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfile({
        fullName: data.full_name || "",
        email: data.email || "",
        username: data.username || "",
      });

      setProfileMessage(
        "✅ Profile updated successfully!"
      );

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setProfileMessage(
        "❌ Could not connect to the server."
      );
    }
  };

  // ==========================================
  // UPDATE PASSWORD
  // ==========================================

  const updatePassword = async () => {
    setPasswordMessage("");

    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      setPasswordMessage(
        "❌ Fill all password fields."
      );

      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordMessage(
        "❌ Password must be at least 8 characters."
      );

      return;
    }

    if (
      password.newPassword !==
      password.confirmPassword
    ) {
      setPasswordMessage(
        "❌ Passwords do not match."
      );

      return;
    }

    if (!userId) {
      setPasswordMessage(
        "❌ User information not found."
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/password/${userId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            current_password:
              password.currentPassword,

            new_password:
              password.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage(
          `❌ ${data.detail || "Could not update password."}`
        );

        return;
      }

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        "✅ Password updated successfully!"
      );

    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      setPasswordMessage(
        "❌ Could not connect to the server."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="settings-page">

      <h1>⚙️ Settings</h1>

      {/* ======================================
          PROFILE
      ====================================== */}

      <div className="settings-card">

        <h2>👤 Profile Information</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={profile.fullName}
          onChange={handleProfileChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleProfileChange}
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={profile.username}
          onChange={handleProfileChange}
        />

        <button onClick={saveProfile}>
          Save Changes
        </button>

        {profileMessage && (
          <p>{profileMessage}</p>
        )}

      </div>

      {/* ======================================
          PASSWORD
      ====================================== */}

      <div className="settings-card">

        <h2>🔒 Change Password</h2>

        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={password.currentPassword}
          onChange={handlePasswordChange}
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={password.newPassword}
          onChange={handlePasswordChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={password.confirmPassword}
          onChange={handlePasswordChange}
        />

        <button onClick={updatePassword}>
          Update Password
        </button>

        {passwordMessage && (
          <p>{passwordMessage}</p>
        )}

      </div>

    </div>
  );
}

export default Settings;