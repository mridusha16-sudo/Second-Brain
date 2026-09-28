# Second Brain — Personal Knowledge Management System

A full-stack personal knowledge management web application designed to help students organize subjects, notes, and PDF study materials in one place.

**Live Demo:** https://second-brain-frontend-t3xg.onrender.com
**Repository:** https://github.com/mridusha16-sudo/Second-Brain

---

## Features

### 🔐 Authentication

* User signup and login
* Logout functionality
* Protected frontend routes
* Password settings
* Forgot-password and reset-password workflow

### 📚 Subjects & Notes

* Create, view, update, and delete subjects
* Create, view, update, and delete notes
* Organize study material by subject
* Search across subjects and notes

### 📄 PDF Upload & OCR

* Upload PDF study materials
* Extract text from regular PDFs
* OCR fallback for scanned/image-based PDFs
* Uses **PyMuPDF, Pillow, and Tesseract OCR**
* Extracted content can be searched through the application

### 🔎 Search

* Search subjects, notes, and extracted PDF content
* Subject-specific search
* Search results can be opened and highlighted in the relevant content

### 📊 Dashboard

* Overview of subjects, notes, and uploaded files
* Recent activity tracking
* Basic statistics for stored study material

### 👀 PDF Viewer

* View uploaded PDFs directly inside the application
* Zoom controls
* Fullscreen mode
* Download functionality
* Navigation back to the application

### ⚙️ Settings

* Profile-related settings
* Password update functionality
* Account-related controls

---

## Tech Stack

### Frontend

* React
* Vite
* HTML
* CSS
* JavaScript

### Backend

* Python
* FastAPI
* Uvicorn
* SQLAlchemy

### Database

* PostgreSQL
* SQL

### PDF & OCR

* pypdf
* PyMuPDF
* Pillow
* pytesseract
* Tesseract OCR

### Deployment

* Render
* Neon PostgreSQL

---

## Architecture

The application follows a frontend–backend–database architecture:

```text
┌─────────────────────┐
│    React / Vite     │
│      Frontend       │
└──────────┬──────────┘
           │
           │ HTTP / REST API
           ▼
┌─────────────────────┐
│   FastAPI Backend   │
│      Python         │
└──────────┬──────────┘
           │
           │ SQLAlchemy
           ▼
┌─────────────────────┐
│     PostgreSQL       │
│      Database        │
└─────────────────────┘
```

For PDF processing, uploaded files are processed by the backend. Text is extracted directly from PDFs when possible, with OCR used as a fallback for scanned documents.

---

## Database Models

The application uses SQLAlchemy models for the main entities:

* **User** — stores user account information
* **Subject** — stores subjects created by users
* **Note** — stores notes associated with subjects
* **UploadedFile** — stores information and extracted text from uploaded PDFs
* **Activity** — records recent application activity
* **PasswordReset** — manages password-reset information

---

## PDF Processing Workflow

```text
PDF Upload
    │
    ▼
Validate File
    │
    ▼
Extract Text with pypdf
    │
    ├── Sufficient Text ──► Store Extracted Text
    │
    └── Insufficient Text
              │
              ▼
        OCR Fallback
              │
      PyMuPDF + Pillow
              │
              ▼
       Tesseract OCR
              │
              ▼
       Store Extracted Text
```

This allows the application to work with both regular text-based PDFs and scanned documents.

---

## Search Workflow

The search functionality allows users to find information across different types of stored content.

The backend searches relevant database fields using PostgreSQL queries, including:

* Subject names
* Note titles/content
* Extracted PDF text

The frontend uses a short debounce period before sending search requests to reduce unnecessary API calls.

---

## Project Structure

```text
Second-Brain/
│
├── backend/
│   ├── main.py
│   ├── models/
│   ├── routes/
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── .gitignore
└── README.md
```

> The exact files and folders may change as the project is developed further.

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/mridusha16-sudo/Second-Brain.git
cd Second-Brain
```

---

### 2. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables, including the PostgreSQL database connection.

Then start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

---

### 3. Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at the local URL provided by Vite.

---

## Deployment

The application is deployed using:

* **Frontend:** Render
* **Backend:** Render
* **Database:** Neon PostgreSQL

### Live Application

https://second-brain-frontend-t3xg.onrender.com

---

## What I Learned

Building Second Brain provided hands-on experience with:

* Full-stack web application development
* REST API development using FastAPI
* React frontend development
* PostgreSQL database design
* SQLAlchemy ORM
* Authentication workflows
* CRUD operations
* PDF processing
* OCR integration
* Search functionality
* Frontend-backend communication
* Deployment and environment configuration

---

## Current Limitations

Some areas of the project can be improved further:

* Server-side authorization can be strengthened for individual resources.
* File storage currently relies on filesystem storage rather than object storage.
* The OCR configuration includes environment-specific setup.
* The password-reset workflow currently generates the reset link through the application rather than sending it through a production email service.
* The application can be further improved with stronger per-user resource ownership and authorization.

---

## Future Improvements

Possible future improvements include:

* Stronger server-side authorization and resource ownership
* Cloud-based file storage
* Production email integration for password resets
* More advanced search and filtering
* Improved OCR processing
* Additional analytics and study insights
* Automated testing
* Improved deployment and monitoring

---

## Project Links

**GitHub:**
https://github.com/mridusha16-sudo/Second-Brain

**Live Demo:**
https://second-brain-frontend-t3xg.onrender.com
