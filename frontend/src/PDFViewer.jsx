import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PDFViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  const [zoom, setZoom] = useState(100);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const params = new URLSearchParams(location.search);
  const fileName = params.get("file");

  // ==========================================
  // NO FILE SELECTED
  // ==========================================

  if (!fileName) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1>📄 PDF Viewer</h1>

        <p>No PDF file selected.</p>

        <button
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // ==========================================
  // PDF URL
  // ==========================================

  const pdfURL =
    `http://10.120.56.140:8000/upload/view/${encodeURIComponent(
      fileName
    )}`;

  // ==========================================
  // ZOOM
  // ==========================================

  const zoomIn = () => {
    setZoom((previous) =>
      Math.min(previous + 10, 200)
    );
  };

  const zoomOut = () => {
    setZoom((previous) =>
      Math.max(previous - 10, 50)
    );
  };

  const resetZoom = () => {
    setZoom(100);
  };

  // ==========================================
  // FULLSCREEN
  // ==========================================

  const openFullscreen = () => {
    const viewer =
      document.getElementById(
        "pdf-viewer-container"
      );

    if (viewer && viewer.requestFullscreen) {
      viewer.requestFullscreen();
    }
  };

  // ==========================================
  // DOWNLOAD
  // ==========================================

  const downloadPDF = () => {
    const link =
      document.createElement("a");

    link.href = pdfURL;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ==========================================
  // PDF LOADED
  // ==========================================

  const handlePDFLoad = () => {
    setLoading(false);
    setError(false);
  };

  // ==========================================
  // PDF ERROR
  // ==========================================

  const handlePDFError = () => {
    setLoading(false);
    setError(true);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      id="pdf-viewer-container"
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f1f1f1",
      }}
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "#ffffff",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >

        {/* FILE NAME */}

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
            }}
          >
            📄 {fileName}
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#777",
              fontSize: "13px",
            }}
          >
            PDF Viewer
          </p>
        </div>

        {/* ==================================
            CONTROLS
        ================================== */}

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >

          {/* ZOOM OUT */}

          <button
            onClick={zoomOut}
            title="Zoom Out"
          >
            −
          </button>

          {/* ZOOM LEVEL */}

          <span
            style={{
              minWidth: "55px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {zoom}%
          </span>

          {/* ZOOM IN */}

          <button
            onClick={zoomIn}
            title="Zoom In"
          >
            +
          </button>

          {/* RESET */}

          <button
            onClick={resetZoom}
            title="Reset Zoom"
          >
            Reset
          </button>

          {/* FULLSCREEN */}

          <button
            onClick={openFullscreen}
            title="Fullscreen"
          >
            ⛶
          </button>

          {/* DOWNLOAD */}

          <button
            onClick={downloadPDF}
            title="Download PDF"
          >
            ⬇️
          </button>

          {/* BACK */}

          <button
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

        </div>
      </div>

      {/* ======================================
          PDF AREA
      ====================================== */}

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
        }}
      >

        {/* ==================================
            LOADING
        ================================== */}

        {loading && !error && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 5,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #ddd",
                borderTop: "4px solid #555",
                borderRadius: "50%",
                animation:
                  "pdfSpin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />

            <p>
              Loading PDF...
            </p>
          </div>
        )}

        {/* ==================================
            ERROR
        ================================== */}

        {error && (
          <div
            style={{
              textAlign: "center",
              marginTop: "100px",
            }}
          >
            <h2>⚠️ Unable to load PDF</h2>

            <p>
              The PDF could not be displayed.
            </p>

            <button
              onClick={() => {
                setError(false);
                setLoading(true);
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => navigate(-1)}
              style={{
                marginLeft: "10px",
              }}
            >
              ← Go Back
            </button>
          </div>
        )}

        {/* ==================================
            PDF
        ================================== */}

        {!error && (
          <div
            style={{
              width: `${zoom}%`,
              height: "calc(100vh - 100px)",
              minWidth:
                zoom < 100
                  ? "100%"
                  : "1000px",
              transition:
                "width 0.2s ease",
            }}
          >

            <iframe
              src={pdfURL}
              title={fileName}
              onLoad={handlePDFLoad}
              onError={handlePDFError}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "#ffffff",
                borderRadius: "8px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.12)",
              }}
            />

          </div>
        )}

      </div>

      {/* ======================================
          SPINNER ANIMATION
      ====================================== */}

      <style>
        {`
          @keyframes pdfSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

    </div>
  );
}

export default PDFViewer;