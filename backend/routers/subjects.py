
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Subject, Note, Activity
from schemas import SubjectCreate, SubjectResponse, NoteResponse


router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create Subject
@router.post("/", response_model=SubjectResponse)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db)
):
    new_subject = Subject(
        name=subject.name,
        description=subject.description
    )

    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)

    # Record activity
    activity = Activity(
        action="Subject Created",
        description=f"Subject created: {new_subject.name}"
    )

    db.add(activity)
    db.commit()

    return new_subject


# Get Subjects
@router.get("/", response_model=list[SubjectResponse])
def get_subjects(
    db: Session = Depends(get_db)
):
    subjects = db.query(Subject).all()

    return subjects


# Update Subject
@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: int,
    subject: SubjectCreate,
    db: Session = Depends(get_db)
):
    existing_subject = db.query(Subject).filter(
        Subject.id == subject_id
    ).first()

    if not existing_subject:
        return {"message": "Subject not found"}

    existing_subject.name = subject.name
    existing_subject.description = subject.description

    db.commit()
    db.refresh(existing_subject)

    return existing_subject


# Delete Subject
@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id
    ).first()

    if not subject:
        return {"message": "Subject not found"}

    db.delete(subject)
    db.commit()

    return {
        "message": "Subject deleted successfully"
    }


# Get Notes of Subject
@router.get(
    "/{subject_id}/notes",
    response_model=list[NoteResponse]
)
def get_subject_notes(
    subject_id: int,
    db: Session = Depends(get_db)
):
    notes = db.query(Note).filter(
        Note.subject_id == subject_id
    ).all()

    return notes

