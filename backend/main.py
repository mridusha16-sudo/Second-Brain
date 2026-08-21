from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

from routers.subjects import router as subjects_router
from routers.notes import router as notes_router
from routers.upload import router as upload_router
from routers.search import router as search_router
from routers.activity import router as activity_router
from routers.auth import router as auth_router
from routers.stats import router as stats_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI()


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(subjects_router)
app.include_router(notes_router)
app.include_router(upload_router)
app.include_router(search_router)
app.include_router(activity_router)
app.include_router(auth_router)
app.include_router(stats_router)


@app.get("/")
def home():
    return {
        "message": "Second Brain API is running!"
    }


@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            return {
                "message": "Database connected successfully!"
            }

    except Exception as e:
        return {
            "message": "Database connection failed",
            "error": str(e)
        }