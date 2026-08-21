import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./SubWork.css";

function SubWork() {
  const location = useLocation();

  // ==========================================
  // STATE
  // ==========================================

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");

  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [subjectNotes, setSubjectNotes] = useState([]);

  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState("");

  const [highlightedSubjectId, setHighlightedSubjectId] =
    useState(null);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const API_URL = "http://10.120.56.140:8000";

  // ==========================================
  // GET SUBJECTS
  // ==========================================

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setSubjectError("");

    try {
      const response = await fetch(`${API_URL}/subjects/`);

      if (!response.ok) {
        throw new Error("Could not load subjects");
      }

      const data = await response.json();

      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);

      setSubjectError(
        "Unable to load subjects. Please check your connection and try again."
      );
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ==========================================
  // LOAD NOTES FOR SUBJECT
  // ==========================================

  const loadSubjectNotes = async (subjectId) => {
    setLoadingNotes(true);
    setNotesError("");

    try {
      const response = await fetch(
        `${API_URL}/subjects/${subjectId}/notes`
      );

      if (!response.ok) {
        throw new Error("Could not load subject notes");
      }

      const data = await response.json();

      setSubjectNotes(data);
    } catch (error) {
      console.error("Error fetching subject notes:", error);

      setSubjectNotes([]);

      setNotesError(
        "Unable to load notes. Please try again."
      );
    } finally {
      setLoadingNotes(false);
    }
  };

  // ==========================================
  // EXPAND / COLLAPSE SUBJECT
  // ==========================================

  const showSubjectNotes = async (subjectId) => {
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(null);
      setSubjectNotes([]);
      setNoteTitle("");
      setNoteContent("");
      setNotesError("");
      return;
    }

    setExpandedSubjectId(subjectId);

    await loadSubjectNotes(subjectId);
  };

  // ==========================================
  // OPEN SUBJECT FROM SEARCH
  // ==========================================

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const subjectId = Number(params.get("subject"));

    if (!subjectId || subjects.length === 0) {
      return;
    }

    const subjectExists = subjects.some(
      (subject) => subject.id === subjectId
    );

    if (!subjectExists) {
      return;
    }

    setExpandedSubjectId(subjectId);
    setHighlightedSubjectId(subjectId);

    loadSubjectNotes(subjectId);

    const scrollTimer = setTimeout(() => {
      const element = document.getElementById(
        `subject-${subjectId}`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);

    const highlightTimer = setTimeout(() => {
      setHighlightedSubjectId(null);
    }, 3000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }, [location.search, subjects]);

  // ==========================================
  // ADD SUBJECT
  // ==========================================

  const addSubject = async () => {
    if (!subjectName.trim()) {
      alert("Please enter a subject name.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/subjects/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: subjectName,
          description: description,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not add subject");
      }

      const newSubject = await response.json();

      setSubjects([...subjects, newSubject]);

      setSubjectName("");
      setDescription("");
    } catch (error) {
      console.error("Error adding subject:", error);

      alert("Unable to add subject. Please try again.");
    }
  };

  // ==========================================
  // DELETE SUBJECT
  // ==========================================

  const deleteSubject = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/subjects/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete subject");
      }

      setSubjects(
        subjects.filter(
          (subject) => subject.id !== id
        )
      );

      if (expandedSubjectId === id) {
        setExpandedSubjectId(null);
        setSubjectNotes([]);
        setNoteTitle("");
        setNoteContent("");
        setNotesError("");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);

      alert("Unable to delete subject. Please try again.");
    }
  };

  // ==========================================
  // EDIT SUBJECT
  // ==========================================

  const editSubject = async (subject) => {
    const newName = prompt(
      "Enter New Subject Name",
      subject.name
    );

    if (!newName || !newName.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/subjects/${subject.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: newName,
            description: subject.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not update subject");
      }

      const updatedSubject = await response.json();

      setSubjects(
        subjects.map((item) =>
          item.id === subject.id
            ? updatedSubject
            : item
        )
      );
    } catch (error) {
      console.error("Error updating subject:", error);

      alert("Unable to update subject. Please try again.");
    }
  };

  // ==========================================
  // ADD NOTE
  // ==========================================

  const addNoteToSubject = async (subjectId) => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert("Please enter note title and content.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notes/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            subject_id: Number(subjectId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not add note");
      }

      const newNote = await response.json();

      setSubjectNotes([
        ...subjectNotes,
        newNote,
      ]);

      setNoteTitle("");
      setNoteContent("");
      setNotesError("");
    } catch (error) {
      console.error("Error adding note:", error);

      alert("Unable to add note. Please try again.");
    }
  };

  // ==========================================
  // EDIT NOTE
  // ==========================================

  const editNote = async (note) => {
    const newTitle = prompt(
      "Enter New Note Title",
      note.title
    );

    if (!newTitle || !newTitle.trim()) {
      return;
    }

    const newContent = prompt(
      "Enter New Note Content",
      note.content
    );

    if (!newContent || !newContent.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notes/${note.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: newTitle,
            content: newContent,
            subject_id: note.subject_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not update note");
      }

      const updatedNote = await response.json();

      setSubjectNotes(
        subjectNotes.map((item) =>
          item.id === note.id
            ? updatedNote
            : item
        )
      );
    } catch (error) {
      console.error("Error updating note:", error);

      alert("Unable to edit note. Please try again.");
    }
  };

  // ==========================================
  // DELETE NOTE
  // ==========================================

  const deleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${API_URL}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete note");
      }

      setSubjectNotes(
        subjectNotes.filter(
          (note) => note.id !== noteId
        )
      );
    } catch (error) {
      console.error("Error deleting note:", error);

      alert("Unable to delete note. Please try again.");
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="subject-workspace">

      {/* HEADER */}

      <div className="workspace-header">

        <div>
          <span className="workspace-label">
            KNOWLEDGE SPACE
          </span>

          <h1>📚 Subject Workspace</h1>

          <p>
            Organize your subjects and keep your
            notes connected in one place.
          </p>
        </div>

        <div className="workspace-count">
          <span>{subjects.length}</span>

          <small>
            {subjects.length === 1
              ? "Subject"
              : "Subjects"}
          </small>
        </div>

      </div>

      {/* ADD SUBJECT */}

      <section className="add-subject-panel">

        <div className="add-subject-heading">

          <div className="add-subject-icon">
            +
          </div>

          <div>
            <h2>Add a New Subject</h2>

            <p>
              Create a space for a new area of
              knowledge.
            </p>
          </div>

        </div>

        <div className="subject-form">

          <input
            type="text"
            placeholder="Subject name"
            value={subjectName}
            onChange={(e) =>
              setSubjectName(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Short description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <button
            type="button"
            className="add-subject-btn"
            onClick={addSubject}
          >
            + Add Subject
          </button>

        </div>

      </section>

      {/* SUBJECTS */}

      <section className="subjects-section">

        <div className="subjects-heading">

          <span className="workspace-label">
            YOUR COLLECTION
          </span>

          <h2>Your Subjects</h2>

        </div>

        {loadingSubjects ? (

          <div className="workspace-state">

            <div className="loading-spinner"></div>

            <p>Loading subjects...</p>

          </div>

        ) : subjectError ? (

          <div className="workspace-state error-state">

            <div className="state-icon">
              ⚠️
            </div>

            <p>{subjectError}</p>

            <button
              type="button"
              onClick={fetchSubjects}
            >
              🔄 Try Again
            </button>

          </div>

        ) : subjects.length === 0 ? (

          <div className="workspace-state empty-state">

            <div className="empty-icon">
              📚
            </div>

            <h3>No subjects yet</h3>

            <p>
              Add your first subject above to start
              organizing your knowledge.
            </p>

          </div>

        ) : (

          <div className="subjects-list">

            {subjects.map((subject) => (

              <div
                key={subject.id}
                id={`subject-${subject.id}`}
                className={
                  highlightedSubjectId === subject.id
                    ? "topic-card highlighted"
                    : "topic-card"
                }
              >

                {/* SUBJECT HEADER */}

                <div className="subject-card-header">

                  <div
                    className="subject-main"
                    onClick={() =>
                      showSubjectNotes(subject.id)
                    }
                  >

                    <div className="subject-icon">
                      📂
                    </div>

                    <div className="subject-info">

                      <h3>
                        {subject.name}
                      </h3>

                      <p>
                        {subject.description ||
                          "No description added."}
                      </p>

                    </div>

                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="subject-actions">

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        editSubject(subject);
                      }}
                      title="Edit subject"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={(event) => {
                        event.stopPropagation();

                        const confirmed =
                          window.confirm(
                            `Delete "${subject.name}"?`
                          );

                        if (confirmed) {
                          deleteSubject(subject.id);
                        }
                      }}
                      title="Delete subject"
                    >
                      🗑️
                    </button>

                    <button
                      type="button"
                      className={`expand-btn ${
                        expandedSubjectId === subject.id
                          ? "expanded"
                          : ""
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        showSubjectNotes(subject.id);
                      }}
                      title={
                        expandedSubjectId === subject.id
                          ? "Collapse subject"
                          : "Expand subject"
                      }
                    >
                      <span className="arrow-icon"></span>
                    </button>

                  </div>

                </div>

                {/* NOTES */}

                {expandedSubjectId === subject.id && (

                  <div className="notes-section">

                    <div className="notes-heading">

                      <div>
                        <span>
                          SUBJECT NOTES
                        </span>

                        <h4>
                          📝 Notes
                        </h4>
                      </div>

                      <span className="notes-count">
                        {subjectNotes.length}
                      </span>

                    </div>

                    {/* ADD NOTE */}

                    <div className="add-note-panel">

                      <input
                        type="text"
                        placeholder="Note title"
                        value={noteTitle}
                        onChange={(e) =>
                          setNoteTitle(
                            e.target.value
                          )
                        }
                      />

                      <textarea
                        placeholder="Write your note..."
                        value={noteContent}
                        onChange={(e) =>
                          setNoteContent(
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="add-note-btn"
                        onClick={() =>
                          addNoteToSubject(
                            subject.id
                          )
                        }
                      >
                        + Add Note
                      </button>

                    </div>

                    {/* EXISTING NOTES */}

                    {loadingNotes ? (

                      <div className="notes-state">

                        <div className="loading-spinner"></div>

                        <p>
                          Loading notes...
                        </p>

                      </div>

                    ) : notesError ? (

                      <div className="notes-state">

                        <p>
                          ⚠️ {notesError}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            loadSubjectNotes(
                              subject.id
                            )
                          }
                        >
                          🔄 Try Again
                        </button>

                      </div>

                    ) : subjectNotes.length === 0 ? (

                      <div className="notes-empty">

                        <span>📝</span>

                        <p>
                          No notes added to this
                          subject yet.
                        </p>

                      </div>

                    ) : (

                      <div className="notes-list">

                        {subjectNotes.map((note) => (

                          <div
                            key={note.id}
                            className="note-card"
                          >

                            <div className="note-card-top">

                              <div className="note-title">

                                <span>📝</span>

                                <h4>
                                  {note.title}
                                </h4>

                              </div>

                              <div className="note-actions">

                                <button
                                  type="button"
                                  className="edit-btn"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    editNote(note);
                                  }}
                                  title="Edit note"
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  className="delete-btn"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    const confirmed =
                                      window.confirm(
                                        `Delete "${note.title}"?`
                                      );

                                    if (confirmed) {
                                      deleteNote(
                                        note.id
                                      );
                                    }
                                  }}
                                  title="Delete note"
                                >
                                  🗑️
                                </button>

                              </div>

                            </div>

                            <p className="note-content">
                              {note.content}
                            </p>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default SubWork;