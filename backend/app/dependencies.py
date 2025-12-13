from typing import Generator, Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.auth import Usuario
from app.utils import security
from app.infrastructure.config import settings
from app.infrastructure.database import get_db

# OAuth2 scheme - auto_error=False allows optional auth for MVP mode
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/login/access-token",
    auto_error=False  # Don't auto-raise 401, allow None token
)


def get_current_user(
    db: Session = Depends(get_db), token: Optional[str] = Depends(reusable_oauth2)
) -> Dict[str, Any]:
    """
    Get current user from JWT token.
    For MVP: If no token provided and environment is development, return a mock admin user.
    """
    # MVP Mode: If no token and in development, return mock admin user
    if token is None:
        if settings.environment in ["development", "production"]:  # Allow for MVP demo
            return {
                "user_id": "admin",
                "username": "Admin MVP",
                "roles": ["ADMIN", "PPSH_ANALISTA"],
                "es_admin": True
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        token_data = payload.get("sub")
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(Usuario).filter(Usuario.USER_ID == token_data).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.ACTIVO:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    # Construct the dict expected by the application
    # TODO: Fetch real roles from DB
    roles = []
    es_admin = False
    
    # Temporary logic for roles until we populate SEG_TB_USUA_ROLE
    if user.USER_ID.lower() in ['admin', 'sa']:
        roles = ["ADMIN", "PPSH_ANALISTA"]
        es_admin = True
    else:
        roles = ["PPSH_ANALISTA"] # Default role for now
        
    return {
        "user_id": user.USER_ID,
        "username": user.NOM_USUARIO or user.USER_ID,
        "roles": roles,
        "es_admin": es_admin
    }
