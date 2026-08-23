import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Notes.css";

function Notes() {
  const location = useLocation();

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [highlightedNoteId, setHighlightedNoteId] =
    useState(null);

  const [expandedNoteId, setExpandedNoteId] =
    useState(null);

  const API_URL = "https://second-brain-backend-bvxz.onrender.com";

  // ==========================================
  // GET SUBJECTS
  // ==========================================

  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        `${API_URL}/subjects/`
      );

      if (!response.ok) {
        throw new Error("Could not load subjects");
      }

      const data = await response.json();

      setSubjects(data);
    } catch (error) {
      console.error(
        "Error fetching subjects:",
        error
      );
    }
  };

  // ==========================================
  // GET NOTES
  // ==========================================

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `${API_URL}/notes/`
      );

      if (!response.ok) {
        throw new Error("Could not load notes");
      }

      const data = await response.json();

      setNotes(data);
    } catch (error) {
      console.error(
        "Error fetching notes:",
        error
      );
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchSubjects();
    fetchNotes();
  }, []);

  // ==========================================
  // OPEN NOTE FROM SEARCH
  // ==========================================

  useEffect(() => {
    const noteId = location.state?.noteId;

    if (!noteId || notes.length === 0) {
      return;
    }

    const numericId = Number(noteId);

    const noteExists = notes.some(
      (note) => note.id === numericId
    );

    if (!noteExists) {
      return;
    }

    setHighlightedNoteId(numericId);
    setExpandedNoteId(numericId);

    const scrollTimer = setTimeout(() => {
      const element = document.getElementById(
        `note-${noteId}`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);

    const highlightTimer = setTimeout(() => {
      setHighlightedNoteId(null);
    }, 3000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }, [location.state, notes]);

  // ==========================================
  // GET SUBJECT NAME
  // ==========================================

  const getSubjectName = (id) => {
    const subject = subjects.find(
      (item) => item.id === id
    );

    return subject
      ? subject.name
      : "No subject";
  };

  // ==========================================
  // CREATE NOTE
  // ==========================================

  const addNote = async () => {
    if (
      !noteTitle.trim() ||
      !noteContent.trim() ||
      !subjectId
    ) {
      alert(
        "Please enter title, content and select a subject."
      );

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
        throw new Error("Could not create note");
      }

      const newNote = await response.json();

      setNotes((previousNotes) => [
        ...previousNotes,
        newNote,
      ]);

      setNoteTitle("");
      setNoteContent("");
      setSubjectId("");
    } catch (error) {
      console.error(
        "Error adding note:",
        error
      );

      alert(
        "Unable to add note. Please try again."
      );
    }
  };

  // ==========================================
  // DELETE NOTE
  // ==========================================

  const deleteNote = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete note");
      }

      setNotes((previousNotes) =>
        previousNotes.filter(
          (note) => note.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting note:",
        error
      );

      alert(
        "Unable to delete note. Please try again."
      );
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

    if (
      !newTitle ||
      !newTitle.trim()
    ) {
      return;
    }

    const newContent = prompt(
      "Enter New Note Content",
      note.content
    );

    if (
      !newContent ||
      !newContent.trim()
    ) {
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

      const updatedNote =
        await response.json();

      setNotes((previousNotes) =>
        previousNotes.map((item) =>
          item.id === note.id
            ? updatedNote
            : item
        )
      );
    } catch (error) {
      console.error(
        "Error updating note:",
        error
      );

      alert(
        "Unable to update note. Please try again."
      );
    }
  };

  // ==========================================
  // EXPAND / COLLAPSE
  // ==========================================

  const toggleExpand = (id) => {
    setExpandedNoteId((previousId) =>
      previousId === id ? null : id
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="notes-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="notes-header">

        <div>
          <span className="notes-label">
            SECOND BRAIN
          </span>

          <h1>My Notes</h1>

          <p>
            Capture, organize and revisit
            everything you learn.
          </p>
        </div>

        <div className="notes-header-icon">
          📝
        </div>

      </div>

      {/* ======================================
          CREATE NOTE
      ====================================== */}

      <section className="note-create-section">

        <div className="section-heading">
          <span>CREATE</span>
          <h2>Add a New Note</h2>
        </div>

        <div className="note-form">

          <div className="form-field">
            <label>Note Title</label>

            <input
              type="text"
              placeholder="Give your note a title..."
              value={noteTitle}
              onChange={(e) =>
                setNoteTitle(e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Subject</label>

            <select
              value={subjectId}
              onChange={(e) =>
                setSubjectId(e.target.value)
              }
            >
              <option value="">
                Select Subject
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field full-width">
            <label>Content</label>

            <textarea
              placeholder="Write your thoughts, concepts or important information..."
              value={noteContent}
              onChange={(e) =>
                setNoteContent(e.target.value)
              }
            />
          </div>

          <button
            className="add-note-button"
            onClick={addNote}
          >
            <span>＋</span>
            Add Note
          </button>

        </div>

      </section>

      {/* ======================================
          NOTES LIST
      ====================================== */}

      <section className="notes-list-section">

        <div className="notes-list-heading">

          <div>
            <span>YOUR COLLECTION</span>
            <h2>All Notes</h2>
          </div>

          <div className="notes-count">
            {notes.length}
            <small>
              {notes.length === 1
                ? " note"
                : " notes"}
            </small>
          </div>

        </div>

        {notes.length === 0 ? (

          <div className="empty-notes">

            <div className="empty-notes-icon">
              📝
            </div>

            <h3>No notes yet</h3>

            <p>
              Create your first note above
              and start building your
              second brain.
            </p>

          </div>

        ) : (

          <div className="notes-grid">

            {notes.map((note) => {

              const isExpanded =
                expandedNoteId === note.id;

              const isHighlighted =
                highlightedNoteId === note.id;

              return (
                <article
                  key={note.id}
                  id={`note-${note.id}`}
                  className={`note-card ${
                    isHighlighted
                      ? "highlighted"
                      : ""
                  } ${
                    isExpanded
                      ? "expanded"
                      : ""
                  }`}
                >

                  {/* CARD TOP */}

                  <div className="note-card-top">

                    <div className="note-icon">
                      📝
                    </div>

                    <div className="note-actions">

                      <button
                        className="icon-button expand-button"
                        title={
                          isExpanded
                            ? "Collapse"
                            : "Expand"
                        }
                        onClick={() =>
                          toggleExpand(note.id)
                        }
                      >
                        {isExpanded
                          ? "⌃"
                          : "⌄"}
                      </button>

                      <button
                        className="icon-button edit-button"
                        title="Edit Note"
                        onClick={() =>
                          editNote(note)
                        }
                      >
                        ✎
                      </button>

                      <button
                        className="icon-button delete-button"
                        title="Delete Note"
                        onClick={() =>
                          deleteNote(note.id)
                        }
                      >
                        ×
                      </button>

                    </div>

                  </div>

                  {/* TITLE */}

                  <h3>{note.title}</h3>

                  {/* SUBJECT */}

                  <div className="note-subject">
                    <span>◉</span>
                    {getSubjectName(
                      note.subject_id
                    )}
                  </div>

                  {/* CONTENT */}

                  <p
                    className={
                      isExpanded
                        ? "note-content expanded-content"
                        : "note-content"
                    }
                  >
                    {note.content}
                  </p>

                  {/* EXPAND LINK */}

                  {note.content &&
                    note.content.length > 180 && (
                      <button
                        className="read-more-button"
                        onClick={() =>
                          toggleExpand(note.id)
                        }
                      >
                        {isExpanded
                          ? "Show less"
                          : "Read more"}
                      </button>
                    )}

                </article>
              );
            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default Notes;