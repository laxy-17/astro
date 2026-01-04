from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm

from app import models, database, auth
from app.database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/register", response_model=models.User)
def register_user(user: models.UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    db_user = db.query(database.DBUser).filter(database.DBUser.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = auth.get_password_hash(user.password)
    new_user = database.DBUser(
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/token", response_model=models.Token)
def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    # Authenticate
    user = db.query(database.DBUser).filter(database.DBUser.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create Token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
