from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import SessionLocal
from models import Subject, Note, UploadedFile


router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


# Database connection
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/")
def search(
    q: str,
    db: Session = Depends(get_db)
):

    # Empty search
    if not q.strip():
        return {
            "subjects": [],
            "notes": [],
            "files": []
        }


    search_term = f"%{q}%"


    # ==========================================
    # Search Subjects
    # ==========================================

    subjects = db.query(Subject).filter(
        or_(
            Subject.name.ilike(search_term),
            Subject.description.ilike(search_term)
        )
    ).all()


    # ==========================================
    # Search Notes
    # ==========================================

    notes = db.query(Note).filter(
        or_(
            Note.title.ilike(search_term),
            Note.content.ilike(search_term)
        )
    ).all()


    # ==========================================
    # Search Uploaded PDFs
    # ==========================================

    files = db.query(UploadedFile).filter(
        or_(
            UploadedFile.file_name.ilike(search_term),
            UploadedFile.content.ilike(search_term)
        )
    ).all()


    # ==========================================
    # Return all results
    # ==========================================

    return {
        "subjects": subjects,
        "notes": notes,
        "files": files
    }