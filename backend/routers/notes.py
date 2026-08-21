
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Note, Activity
from schemas import NoteCreate, NoteResponse


router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create Note
@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db)
):
    new_note = Note(
        title=note.title,
        content=note.content,
        subject_id=note.subject_id
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    # Record activity
    activity = Activity(
        action="Note Created",
        description=f"Note created: {new_note.title}"
    )

    db.add(activity)
    db.commit()

    return new_note


# Get Notes
@router.get("/", response_model=list[NoteResponse])
def get_notes(
    db: Session = Depends(get_db)
):
    notes = db.query(Note).all()

    return notes


# Update Note
@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note: NoteCreate,
    db: Session = Depends(get_db)
):
    existing_note = db.query(Note).filter(
        Note.id == note_id
    ).first()

    if not existing_note:
        return {"message": "Note not found"}

    existing_note.title = note.title
    existing_note.content = note.content
    existing_note.subject_id = note.subject_id

    db.commit()
    db.refresh(existing_note)

    return existing_note


# Delete Note
@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(
        Note.id == note_id
    ).first()

    if not note:
        return {"message": "Note not found"}

    db.delete(note)
    db.commit()

    return {
        "message": "Note deleted successfully"
    }

