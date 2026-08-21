from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pwdlib import PasswordHash
from database import SessionLocal
from models import User, PasswordReset
from datetime import datetime, timedelta
import secrets


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==========================================
# Password hashing
# ==========================================

password_hash = PasswordHash.recommended()


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
# Request schemas
# ==========================================

class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    full_name: str
    email: str
    username: str


class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ==========================================
# Signup
# ==========================================

@router.post("/signup")
def signup(
    user_data: SignupRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    hashed_password = password_hash.hash(
        user_data.password
    )

    new_user = User(
        email=user_data.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "id": new_user.id,
        "email": new_user.email
    }


# ==========================================
# Login
# ==========================================

@router.post("/login")
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = password_hash.verify(
        user_data.password,
        user.password
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "id": user.id,
        "email": user.email
    }


# ==========================================
# GET PROFILE
# ==========================================

@router.get("/profile/{user_id}")
def get_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name or "",
        "username": user.username or ""
    }


# ==========================================
# UPDATE PROFILE
# ==========================================

@router.put("/profile/{user_id}")
def update_profile(
    user_id: int,
    profile_data: ProfileUpdateRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_email = db.query(User).filter(
        User.email == profile_data.email,
        User.id != user_id
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_username = db.query(User).filter(
        User.username == profile_data.username,
        User.id != user_id
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )

    user.full_name = profile_data.full_name
    user.email = profile_data.email
    user.username = profile_data.username

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name or "",
        "username": user.username or ""
    }


# ==========================================
# UPDATE PASSWORD
# ==========================================

@router.put("/password/{user_id}")
def update_password(
    user_id: int,
    password_data: PasswordUpdateRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    current_password_valid = password_hash.verify(
        password_data.current_password,
        user.password
    )

    if not current_password_valid:
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )

    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters"
        )

    user.password = password_hash.hash(
        password_data.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully"
    }


# ==========================================
# FORGOT PASSWORD
# ==========================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    # Don't reveal whether an email exists
    if not user:
        return {
            "message": "If this email is registered, a password reset link has been generated."
        }

    # Delete previous unused reset tokens
    db.query(PasswordReset).filter(
        PasswordReset.user_id == user.id,
        PasswordReset.used == 0
    ).delete()

    # Generate secure token
    token = secrets.token_urlsafe(32)

    expires_at = datetime.utcnow() + timedelta(
        minutes=15
    )

    reset_record = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
        used=0
    )

    db.add(reset_record)
    db.commit()

    # DEVELOPMENT ONLY
    # Later this link will be sent through email.
    reset_link = (
        f"http://localhost:5173/reset-password?token={token}"
    )

    return {
        "message": "Password reset link generated.",
        "reset_link": reset_link
    }


# ==========================================
# RESET PASSWORD
# ==========================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    reset_record = db.query(PasswordReset).filter(
        PasswordReset.token == request.token,
        PasswordReset.used == 0
    ).first()

    if not reset_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset link."
        )

    # Check expiry
    if datetime.utcnow() > reset_record.expires_at:

        reset_record.used = 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Reset link has expired."
        )

    # Validate password
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters."
        )

    # Find user
    user = db.query(User).filter(
        User.id == reset_record.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # Update password
    user.password = password_hash.hash(
        request.new_password
    )

    # Make token one-time use
    reset_record.used = 1

    db.commit()

    return {
        "message": "Password reset successfully."
    }