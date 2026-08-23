import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

function SearchBar() {
  const [search, setSearch] = useState("");

  const [results, setResults] = useState({
    subjects: [],
    notes: [],
    files: [],
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // SEARCH DATABASE
  // ==========================================

  useEffect(() => {
    const searchDatabase = async () => {
      if (search.trim() === "") {
        setResults({
          subjects: [],
          notes: [],
          files: [],
        });

        setLoading(false);

        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `https://second-brain-backend-bvxz.onrender.com/search/?q=${encodeURIComponent(
            search
          )}`
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        setResults({
          subjects: data.subjects || [],
          notes: data.notes || [],
          files: data.files || [],
        });
      } catch (error) {
        console.error("Search error:", error);

        setResults({
          subjects: [],
          notes: [],
          files: [],
        });
      } finally {
        setLoading(false);
      }
    };

    const delaySearch = setTimeout(() => {
      searchDatabase();
    }, 300);

    return () => {
      clearTimeout(delaySearch);
    };
  }, [search]);

  // ==========================================
  // CHECK IF RESULTS EXIST
  // ==========================================

  const hasResults =
    results.subjects.length > 0 ||
    results.notes.length > 0 ||
    results.files.length > 0;

  // ==========================================
  // CLEAR SEARCH RESULTS
  // ==========================================

  const clearSearch = () => {
    setSearch("");

    setResults({
      subjects: [],
      notes: [],
      files: [],
    });
  };

  // ==========================================
  // OPEN SUBJECT
  // ==========================================

  const openSubject = (subject) => {
    navigate(`/subjects?subject=${subject.id}`);

    clearSearch();
  };

  // ==========================================
  // OPEN NOTE
  // ==========================================

  const openNote = (note) => {
    navigate("/notes", {
      state: {
        noteId: note.id,
      },
    });

    clearSearch();
  };

  // ==========================================
  // OPEN PDF VIEWER
  // ==========================================

  const openFile = (file) => {
    if (!file.file_path) {
      alert("PDF file path not available.");
      return;
    }

    const fileName = file.file_path
      .split(/[\\/]/)
      .pop();

    navigate(
      `/pdf-viewer?file=${encodeURIComponent(fileName)}`
    );

    clearSearch();
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="search-container">

      {/* ======================================
          SEARCH BOX
      ====================================== */}

      <div className="search-box">

        <span className="search-icon">
          🔍
        </span>

        <input
          type="text"
          placeholder="Search notes, files, subjects..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {loading && (
          <div className="search-spinner"></div>
        )}

      </div>

      {/* ======================================
          SEARCH RESULTS
      ====================================== */}

      <div className="search-results">

        {/* Empty Search */}

        {search.trim() === "" ? null : (

          loading ? (

            <div className="search-loading">

              <div className="search-loading-spinner"></div>

              <p>Searching...</p>

            </div>

          ) : !hasResults ? (

            <p>
              No results found for "{search}".
            </p>

          ) : (

            <>

              {/* ==================================
                  SUBJECT RESULTS
              ================================== */}

              {results.subjects.length > 0 && (

                <div>

                  <h4>
                    📚 Subjects
                  </h4>

                  {results.subjects.map(
                    (subject) => (

                      <div
                        className="result-card"
                        key={`subject-${subject.id}`}
                        onClick={() =>
                          openSubject(subject)
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >

                        <p>
                          <strong>
                            {subject.name}
                          </strong>
                        </p>

                        <p>
                          {subject.description}
                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

              {/* ==================================
                  NOTE RESULTS
              ================================== */}

              {results.notes.length > 0 && (

                <div>

                  <h4>
                    📝 Notes
                  </h4>

                  {results.notes.map(
                    (note) => (

                      <div
                        className="result-card"
                        key={`note-${note.id}`}
                        onClick={() =>
                          openNote(note)
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >

                        <p>
                          <strong>
                            {note.title}
                          </strong>
                        </p>

                        <p>
                          {note.content}
                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

              {/* ==================================
                  PDF RESULTS
              ================================== */}

              {results.files.length > 0 && (

                <div>

                  <h4>
                    📄 Files
                  </h4>

                  {results.files.map(
                    (file) => (

                      <div
                        className="result-card"
                        key={`file-${file.id}`}
                      >

                        <p>
                          <strong>
                            {file.file_name}
                          </strong>
                        </p>

                        <p>
                          PDF document
                        </p>

                        <button
                          onClick={() =>
                            openFile(file)
                          }
                        >
                          Open PDF
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </>

          )

        )}

      </div>

    </div>
  );
}

export default SearchBar;