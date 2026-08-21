import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dash.css";
import SearchBar from "./SearchBar";

function Dash() {
  const navigate = useNavigate();

  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState("");

  const [stats, setStats] = useState({
    subjects: 0,
    notes: 0,
    files: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  const API_URL = "http://10.120.56.140:8000";

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // ==========================================
  // LOAD RECENT ACTIVITY
  // ==========================================

  const loadActivity = async () => {
    setLoadingActivity(true);
    setActivityError("");

    try {
      const response = await fetch(`${API_URL}/activity/`);

      if (!response.ok) {
        throw new Error("Could not load activity");
      }

      const data = await response.json();

      setRecentActivity(data);
    } catch (error) {
      console.error("Error loading activity:", error);
      setActivityError("Unable to load recent activity.");
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  // ==========================================
  // LOAD DASHBOARD STATISTICS
  // ==========================================

  const loadStats = async () => {
    setLoadingStats(true);
    setStatsError("");

    try {
      const response = await fetch(`${API_URL}/stats/`);

      if (!response.ok) {
        throw new Error("Could not load statistics");
      }

      const data = await response.json();

      setStats(data);
    } catch (error) {
      console.error("Error loading statistics:", error);
      setStatsError("Unable to load dashboard statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // ==========================================
  // OPEN ACTIVITY
  // ==========================================

  const openActivity = (activity) => {
    if (!activity) {
      return;
    }

    const action = String(
      activity.action || ""
    ).toLowerCase();

    const description = String(
      activity.description || ""
    ).toLowerCase();

    // ------------------------------------------
    // NOTE ACTIVITY
    // ------------------------------------------

    if (
      action.includes("note") ||
      description.includes("note")
    ) {
      const noteId =
        activity.note_id ||
        activity.noteId ||
        activity.entity_id ||
        activity.entityId;

      if (noteId) {
        navigate("/notes", {
          state: {
            noteId: Number(noteId),
          },
        });
      } else {
        navigate("/notes");
      }

      return;
    }

    // ------------------------------------------
    // SUBJECT ACTIVITY
    // ------------------------------------------

    if (
      action.includes("subject") ||
      description.includes("subject")
    ) {
      const subjectId =
        activity.subject_id ||
        activity.subjectId ||
        activity.entity_id ||
        activity.entityId;

      if (subjectId) {
        navigate(`/subjects?subject=${subjectId}`);
      } else {
        navigate("/subjects");
      }

      return;
    }

    // ------------------------------------------
    // PDF / FILE ACTIVITY
    // ------------------------------------------

    if (
      action.includes("file") ||
      action.includes("pdf") ||
      action.includes("upload") ||
      description.includes("file") ||
      description.includes("pdf") ||
      description.includes("upload")
    ) {
      navigate("/upload");
      return;
    }

    // ------------------------------------------
    // FALLBACK
    // ------------------------------------------

    navigate("/dashboard");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="dashboard-header">

        <div className="brand-section">

          <div className="brand-icon">
            🧠
          </div>

          <div>
            <h1>Second Brain</h1>
            <p>Your knowledge, organized.</p>
          </div>

        </div>

        <div className="header-actions">

          <button
            className="settings-header-btn"
            onClick={() => navigate("/settings")}
          >
            ⚙️ <span>Settings</span>
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ==========================================
          MAIN DASHBOARD
      ========================================== */}

      <main className="dashboard">

        {/* ==========================================
            WELCOME
        ========================================== */}

        <section className="dashboard-welcome">

          <div>

            <span className="welcome-label">
              YOUR DASHBOARD
            </span>

            <h2>
              Welcome back 👋
            </h2>

            <p>
              Keep your knowledge organized and everything
              important in one place.
            </p>

          </div>

          <div className="welcome-decoration">

            <span>✦</span>
            <span>✧</span>
            <span>✦</span>

          </div>

        </section>


        {/* ==========================================
            SEARCH
        ========================================== */}

        <div className="dashboard-search">
          <SearchBar />
        </div>


        {/* ==========================================
            STATISTICS
        ========================================== */}

        <section className="stats-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                OVERVIEW
              </span>

              <h2>
                Your Knowledge at a Glance
              </h2>

            </div>

          </div>


          <div className="stats-container">

            {/* SUBJECTS */}

            <div
              className="stat-card subjects-stat"
              onClick={() => navigate("/subjects")}
            >

              <div className="stat-icon">
                📚
              </div>

              <div className="stat-info">

                <span>
                  Subjects
                </span>

                <p>
                  {loadingStats
                    ? "..."
                    : statsError
                    ? "⚠️"
                    : stats.subjects}
                </p>

              </div>

              <div className="stat-arrow">
                →
              </div>

            </div>


            {/* NOTES */}

            <div
              className="stat-card notes-stat"
              onClick={() => navigate("/notes")}
            >

              <div className="stat-icon">
                📝
              </div>

              <div className="stat-info">

                <span>
                  Notes
                </span>

                <p>
                  {loadingStats
                    ? "..."
                    : statsError
                    ? "⚠️"
                    : stats.notes}
                </p>

              </div>

              <div className="stat-arrow">
                →
              </div>

            </div>


            {/* FILES */}

            <div
              className="stat-card files-stat"
              onClick={() => navigate("/upload")}
            >

              <div className="stat-icon">
                📄
              </div>

              <div className="stat-info">

                <span>
                  PDF Files
                </span>

                <p>
                  {loadingStats
                    ? "..."
                    : statsError
                    ? "⚠️"
                    : stats.files}
                </p>

              </div>

              <div className="stat-arrow">
                →
              </div>

            </div>

          </div>


          {statsError && (

            <div className="error-message stats-error">

              <p>
                ⚠️ {statsError}
              </p>

              <button onClick={loadStats}>
                🔄 Try Again
              </button>

            </div>

          )}

        </section>


        {/* ==========================================
            QUICK ACCESS
        ========================================== */}

        <section className="quick-access-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                QUICK ACCESS
              </span>

              <h2>
                Manage Your Knowledge
              </h2>

            </div>

          </div>


          <div className="dashboard-content">


            {/* ==========================================
                SUBJECTS
            ========================================== */}

            <div
              className="dashboard-card"
              onClick={() => navigate("/subjects")}
            >

              <div className="card-top">

                <div className="card-icon">
                  📚
                </div>

                <span className="card-arrow">
                  ↗
                </span>

              </div>

              <h2>
                Subjects
              </h2>

              <p>
                Organize your learning into subjects and
                keep everything structured.
              </p>

              <span className="card-link">
                Explore subjects →
              </span>

            </div>


            {/* ==========================================
                NOTES
            ========================================== */}

            <div
              className="dashboard-card"
              onClick={() => navigate("/notes")}
            >

              <div className="card-top">

                <div className="card-icon">
                  📝
                </div>

                <span className="card-arrow">
                  ↗
                </span>

              </div>

              <h2>
                Notes
              </h2>

              <p>
                Create, edit, and manage your important
                notes in one place.
              </p>

              <span className="card-link">
                View notes →
              </span>

            </div>


            {/* ==========================================
                PDF LIBRARY
            ========================================== */}

            <div
              className="dashboard-card"
              onClick={() => navigate("/upload")}
            >

              <div className="card-top">

                <div className="card-icon">
                  📄
                </div>

                <span className="card-arrow">
                  ↗
                </span>

              </div>

              <h2>
                PDF Library
              </h2>

              <p>
                Upload documents and use OCR to make
                scanned PDFs searchable.
              </p>

              <span className="card-link">
                Open library →
              </span>

            </div>


            {/* ==========================================
                RECENT ACTIVITY
            ========================================== */}

            <div className="dashboard-card activity-card">

              <div className="card-top">

                <div className="card-icon">
                  📌
                </div>

                <button
                  className="refresh-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    loadActivity();
                  }}
                  title="Refresh activity"
                >
                  ↻
                </button>

              </div>


              <h2>
                Recent Activity
              </h2>


              {/* LOADING */}

              {loadingActivity ? (

                <div className="loading-message">

                  <div className="loading-spinner"></div>

                  <p>
                    Loading activity...
                  </p>

                </div>

              ) : activityError ? (

                /* ERROR */

                <div className="error-message">

                  <p>
                    ⚠️ {activityError}
                  </p>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      loadActivity();
                    }}
                  >
                    🔄 Try Again
                  </button>

                </div>

              ) : recentActivity.length === 0 ? (

                /* EMPTY */

                <div className="empty-activity">

                  <span>
                    🌱
                  </span>

                  <p>
                    No recent activity yet.
                  </p>

                </div>

              ) : (

                /* ACTIVITY LIST */

                <div className="activity-list">

                  {recentActivity.map(
                    (activity) => (

                      <div
                        className="activity-item"
                        key={activity.id}
                        onClick={() =>
                          openActivity(activity)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            openActivity(activity);
                          }
                        }}
                      >

                        <div className="activity-dot"></div>

                        <p>

                          <strong>
                            {activity.action}
                          </strong>{" "}

                          {activity.description}

                        </p>

                        <span className="activity-arrow">
                          →
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dash;