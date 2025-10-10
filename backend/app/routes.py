from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from app.database import get_db
from app.redis_client import get_redis
from app import models, schemas

router = APIRouter()

@router.get("/tramites", response_model=List[schemas.TramiteResponse])
async def get_tramites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tramites with pagination"""
    redis = get_redis()
    
    # Try to get from cache
    cache_key = f"tramites:{skip}:{limit}"
    cached_data = redis.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    
    # If not in cache, get from database
    tramites = db.query(models.Tramite).filter(models.Tramite.activo == True).offset(skip).limit(limit).all()
    
    # Cache the result
    redis.setex(cache_key, 300, json.dumps([
        {
            "id": t.id,
            "titulo": t.titulo,
            "descripcion": t.descripcion,
            "estado": t.estado,
            "activo": t.activo,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat() if t.updated_at else None
        } for t in tramites
    ]))
    
    return tramites

@router.get("/tramites/{tramite_id}", response_model=schemas.TramiteResponse)
async def get_tramite(tramite_id: int, db: Session = Depends(get_db)):
    """Get a specific tramite by ID"""
    tramite = db.query(models.Tramite).filter(
        models.Tramite.id == tramite_id,
        models.Tramite.activo == True
    ).first()
    
    if not tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tramite not found"
        )
    
    return tramite

@router.post("/tramites", response_model=schemas.TramiteResponse, status_code=status.HTTP_201_CREATED)
async def create_tramite(tramite: schemas.TramiteCreate, db: Session = Depends(get_db)):
    """Create a new tramite"""
    redis = get_redis()
    
    db_tramite = models.Tramite(**tramite.model_dump())
    db.add(db_tramite)
    db.commit()
    db.refresh(db_tramite)
    
    # Invalidate cache
    keys = redis.keys("tramites:*")
    if keys:
        redis.delete(*keys)
    
    return db_tramite

@router.put("/tramites/{tramite_id}", response_model=schemas.TramiteResponse)
async def update_tramite(
    tramite_id: int,
    tramite_update: schemas.TramiteUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing tramite"""
    redis = get_redis()
    
    db_tramite = db.query(models.Tramite).filter(
        models.Tramite.id == tramite_id,
        models.Tramite.activo == True
    ).first()
    
    if not db_tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tramite not found"
        )
    
    update_data = tramite_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tramite, field, value)
    
    db.commit()
    db.refresh(db_tramite)
    
    # Invalidate cache
    keys = redis.keys("tramites:*")
    if keys:
        redis.delete(*keys)
    
    return db_tramite

@router.delete("/tramites/{tramite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tramite(tramite_id: int, db: Session = Depends(get_db)):
    """Soft delete a tramite (set activo to False)"""
    redis = get_redis()
    
    db_tramite = db.query(models.Tramite).filter(
        models.Tramite.id == tramite_id,
        models.Tramite.activo == True
    ).first()
    
    if not db_tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tramite not found"
        )
    
    db_tramite.activo = False
    db.commit()
    
    # Invalidate cache
    keys = redis.keys("tramites:*")
    if keys:
        redis.delete(*keys)
    
    return None
