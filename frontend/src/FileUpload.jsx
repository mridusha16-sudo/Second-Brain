import React, { useEffect, useState } from "react";
import "./FileUpload.css";

function FileUpload() {
  const [files, setFiles] = useState([]);

  const API_URL = "https://second-brain-backend-bvxz.onrender.com";

  // ==========================================
  // LOAD UPLOADED FILES
  // ==========================================

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch(`${API_URL}/upload/`);

        if (!response.ok) {
          throw new Error("Could not load files");
        }

        const data = await response.json();

        setFiles(data);
      } catch (error) {
        console.error("Error loading files:", error);
      }
    };

    loadFiles();
  }, []);

  // ==========================================
  // UPLOAD PDF
  // ==========================================

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_URL}/upload/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();

      setFiles((previousFiles) => [
        ...previousFiles,
        {
          id: data.id,
          file_name: data.file_name,
          file_path: data.file_path,
        },
      ]);

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);

      alert("File upload failed!");
    }

    e.target.value = "";
  };

  // ==========================================
  // OPEN PDF
  // ==========================================

  const openFile = (file) => {
    const fileName = file.file_path.split(/[\\/]/).pop();

    window.open(
      `${API_URL}/upload/view/${encodeURIComponent(fileName)}`,
      "_blank"
    );
  };

  // ==========================================
  // DELETE PDF
  // ==========================================

  const deleteFile = async (file) => {
    try {
      const fileName = file.file_path.split(/[\\/]/).pop();

      const response = await fetch(
        `${API_URL}/upload/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setFiles((previousFiles) =>
        previousFiles.filter(
          (item) => item.id !== file.id
        )
      );

      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);

      alert("Could not delete file!");
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="file-page">

      <div className="file-container">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="file-header">

          <span className="file-label">
            DOCUMENT LIBRARY
          </span>

          <h1>📄 PDF Files</h1>

          <p>
            Upload, view and manage your study documents
            in one place.
          </p>

        </div>


        {/* ==========================================
            UPLOAD CARD
        ========================================== */}

        <div className="upload-card">

          <div className="upload-icon">
            📄
          </div>

          <h2>Upload a PDF</h2>

          <p>
            Add lecture notes, study material,
            assignments or other PDF documents.
          </p>

          <label className="upload-button">

            <span>＋ Choose PDF</span>

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
            />

          </label>

          <span className="upload-hint">
            PDF files only
          </span>

        </div>


        {/* ==========================================
            FILE SECTION
        ========================================== */}

        <div className="files-section">

          <div className="files-section-header">

            <div>
              <span className="section-label">
                YOUR DOCUMENTS
              </span>

              <h2>Uploaded PDFs</h2>
            </div>

            <div className="file-count">
              {files.length}
            </div>

          </div>


          {/* ==========================================
              EMPTY STATE
          ========================================== */}

          {files.length === 0 ? (

            <div className="empty-files">

              <div className="empty-icon">
                📂
              </div>

              <h3>No files uploaded yet</h3>

              <p>
                Your uploaded PDFs will appear here.
              </p>

            </div>

          ) : (

            <div className="file-list">

              {files.map((file) => (

                <div
                  key={file.id}
                  className="file-card"
                >

                  <div className="file-card-left">

                    <div className="pdf-icon">
                      PDF
                    </div>

                    <div className="file-info">

                      <h3>
                        {file.file_name}
                      </h3>

                      <span>
                        PDF Document
                      </span>

                    </div>

                  </div>


                  <div className="file-actions">

                    <button
                      className="open-file-btn"
                      onClick={() =>
                        openFile(file)
                      }
                    >
                      👁 Open
                    </button>

                    <button
                      className="delete-file-btn"
                      onClick={() =>
                        deleteFile(file)
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default FileUpload;