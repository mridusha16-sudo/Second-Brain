from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
from io import BytesIO
import pymupdf
import pytesseract
import uuid
import os

from database import SessionLocal
from models import UploadedFile, Activity


router = APIRouter(
    prefix="/upload",
    tags=["File Upload"]
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ==========================================
# Tesseract installation path
# ==========================================
# On Windows, use the local Tesseract installation.
# On Render/Linux, Tesseract will be searched
# from the system PATH.

if os.name == "nt":

    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path


# ==========================================
# Database connection
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# Upload PDF
# ==========================================

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Check if file is PDF
    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Create unique filename
    file_id = str(uuid.uuid4())

    file_name = f"{file_id}_{file.filename}"

    file_path = UPLOAD_DIR / file_name

    # Read uploaded file
    contents = await file.read()

    # Save PDF physically
    with open(file_path, "wb") as buffer:

        buffer.write(contents)

    # ==========================================
    # STEP 1: Try normal PDF text extraction
    # ==========================================

    reader = PdfReader(file_path)

    extracted_text = ""

    for page in reader.pages:

        text = page.extract_text()

        if text:

            extracted_text += text + "\n"

    # ==========================================
    # STEP 2: OCR for scanned PDFs
    # ==========================================

    if len(extracted_text.strip()) < 50:

        print("Normal text extraction insufficient.")
        print("Starting OCR...")

        pdf_document = pymupdf.open(file_path)

        ocr_text = ""

        for page_number, page in enumerate(pdf_document):

            print(
                f"OCR processing page {page_number + 1}"
            )

            # Convert PDF page to image
            pix = page.get_pixmap(
                matrix=pymupdf.Matrix(2, 2)
            )

            # Convert image to PNG bytes
            image_bytes = pix.tobytes("png")

            # Convert PNG bytes into PIL Image
            image = Image.open(
                BytesIO(image_bytes)
            )

            # Run Tesseract OCR
            text = pytesseract.image_to_string(
                image
            )

            ocr_text += text + "\n"

        pdf_document.close()

        extracted_text = ocr_text

        print("OCR completed.")

    # ==========================================
    # STEP 3: Save file information in database
    # ==========================================

    new_file = UploadedFile(
        file_name=file.filename,
        file_path=str(file_path),
        content=extracted_text
    )

    db.add(new_file)

    db.commit()

    db.refresh(new_file)

    # ==========================================
    # STEP 4: Record activity
    # ==========================================

    activity = Activity(
        action="PDF Uploaded",
        description=f"PDF uploaded: {new_file.file_name}"
    )

    db.add(activity)

    db.commit()

    # ==========================================
    # STEP 5: Return response
    # ==========================================

    return {
        "message": "File uploaded successfully",
        "id": new_file.id,
        "file_name": new_file.file_name,
        "file_path": new_file.file_path
    }


# ==========================================
# Get all uploaded files
# ==========================================

@router.get("/")
def get_files(
    db: Session = Depends(get_db)
):

    files = db.query(UploadedFile).all()

    return files


# ==========================================
# View PDF
# ==========================================

@router.get("/view/{file_name}")
def view_file(file_name: str):

    file_path = UPLOAD_DIR / file_name

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf"
    )


# ==========================================
# Delete PDF
# ==========================================

@router.delete("/{file_name}")
def delete_file(
    file_name: str,
    db: Session = Depends(get_db)
):

    file_path = UPLOAD_DIR / file_name

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Delete physical PDF
    file_path.unlink()

    # Delete database record
    saved_file = db.query(UploadedFile).filter(
        UploadedFile.file_path == str(file_path)
    ).first()

    if saved_file:

        db.delete(saved_file)

        db.commit()

    return {
        "message": "File deleted successfully"
    }
