from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.infrastructure.database import get_db
from app.models.auth import Usuario
from app.utils import security
from app.infrastructure.config import settings

router = APIRouter()

@router.post("/login/access-token")
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(Usuario).filter(Usuario.USER_ID == form_data.username).first()
    
    if not user:
        # Fallback for development/migration if user doesn't exist or password not set
        # BUT for production we should be strict.
        # For now, let's assume strict check.
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.PASSWORD:
         raise HTTPException(status_code=400, detail="User has no password set")

    if not security.verify_password(form_data.password, user.PASSWORD):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.ACTIVO:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    return {
        "access_token": security.create_access_token(
            user.USER_ID, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
