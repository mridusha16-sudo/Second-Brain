from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Subject, Note, UploadedFile


router = APIRouter(
    prefix="/stats",
    tags=["Statistics"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_stats(
    db: Session = Depends(get_db)
):
    subject_count = db.query(Subject).count()
    note_count = db.query(Note).count()
    file_count = db.query(UploadedFile).count()

    return {
        "subjects": subject_count,
        "notes": note_count,
        "files": file_count
    }