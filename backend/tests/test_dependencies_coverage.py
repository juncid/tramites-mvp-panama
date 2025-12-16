"""
Tests para app/dependencies.py
Sistema de Trámites Migratorios de Panamá

Objetivo: Cubrir líneas 28-71 para alcanzar 85%+ de cobertura.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi import HTTPException
from jose import jwt

from app.dependencies import get_current_user, reusable_oauth2
from app.models.auth import Usuario


class TestGetCurrentUser:
    """Tests para la función get_current_user"""
    
    def test_no_token_development_mode(self):
        """Test: Sin token en modo development retorna usuario mock"""
        mock_db = Mock()
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.environment = "development"
            
            result = get_current_user(db=mock_db, token=None)
            
            assert result["user_id"] == "admin"
            assert result["username"] == "Admin MVP"
            assert "ADMIN" in result["roles"]
            assert result["es_admin"] is True
    
    def test_no_token_production_mode(self):
        """Test: Sin token en modo production retorna usuario mock (MVP)"""
        mock_db = Mock()
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.environment = "production"
            
            result = get_current_user(db=mock_db, token=None)
            
            assert result["user_id"] == "admin"
            assert result["es_admin"] is True
    
    def test_no_token_strict_mode_raises_401(self):
        """Test: Sin token en modo estricto lanza 401"""
        mock_db = Mock()
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.environment = "strict"  # Modo no MVP
            
            with pytest.raises(HTTPException) as exc_info:
                get_current_user(db=mock_db, token=None)
            
            assert exc_info.value.status_code == 401
            assert exc_info.value.detail == "Not authenticated"
    
    def test_invalid_token_raises_403(self):
        """Test: Token inválido lanza 403"""
        mock_db = Mock()
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.secret_key = "test_secret"
            mock_settings.algorithm = "HS256"
            
            with pytest.raises(HTTPException) as exc_info:
                get_current_user(db=mock_db, token="invalid_token")
            
            assert exc_info.value.status_code == 403
            assert "Could not validate credentials" in exc_info.value.detail
    
    def test_valid_token_user_not_found_raises_404(self):
        """Test: Token válido pero usuario no existe lanza 404"""
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.secret_key = "test_secret"
            mock_settings.algorithm = "HS256"
            
            # Crear token válido
            valid_token = jwt.encode(
                {"sub": "nonexistent_user"},
                "test_secret",
                algorithm="HS256"
            )
            
            with pytest.raises(HTTPException) as exc_info:
                get_current_user(db=mock_db, token=valid_token)
            
            assert exc_info.value.status_code == 404
            assert "User not found" in exc_info.value.detail
    
    def test_valid_token_inactive_user_raises_400(self):
        """Test: Token válido pero usuario inactivo lanza 400"""
        mock_user = Mock(spec=Usuario)
        mock_user.USER_ID = "test_user"
        mock_user.ACTIVO = False  # Usuario inactivo
        
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.secret_key = "test_secret"
            mock_settings.algorithm = "HS256"
            
            valid_token = jwt.encode(
                {"sub": "test_user"},
                "test_secret",
                algorithm="HS256"
            )
            
            with pytest.raises(HTTPException) as exc_info:
                get_current_user(db=mock_db, token=valid_token)
            
            assert exc_info.value.status_code == 400
            assert "Inactive user" in exc_info.value.detail
    
    def test_valid_token_admin_user_returns_admin_roles(self):
        """Test: Token válido con usuario admin retorna roles de admin"""
        mock_user = Mock(spec=Usuario)
        mock_user.USER_ID = "admin"
        mock_user.NOM_USUARIO = "Administrador"
        mock_user.ACTIVO = True
        
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.secret_key = "test_secret"
            mock_settings.algorithm = "HS256"
            
            valid_token = jwt.encode(
                {"sub": "admin"},
                "test_secret",
                algorithm="HS256"
            )
            
            result = get_current_user(db=mock_db, token=valid_token)
            
            assert result["user_id"] == "admin"
            assert result["username"] == "Administrador"
            assert "ADMIN" in result["roles"]
            assert result["es_admin"] is True
    
    def test_valid_token_sa_user_returns_admin_roles(self):
        """Test: Token válido con usuario 'sa' retorna roles de admin"""
        mock_user = Mock(spec=Usuario)
        mock_user.USER_ID = "sa"
        mock_user.NOM_USUARIO = None  # Sin nombre, usa USER_ID
        mock_user.ACTIVO = True
        
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.secret_key = "test_secret"
            mock_settings.algorithm = "HS256"
            
            valid_token = jwt.encode(
                {"sub": "sa"},
                "test_secret",
                algorithm="HS256"
            )
            
            result = get_current_user(db=mock_db, token=valid_token)
            
            assert result["user_id"] == "sa"
            assert result["username"] == "sa"  # Usa USER_ID cuando NOM_USUARIO es None
            assert "ADMIN" in result["roles"]
            assert result["es_admin"] is True
    
    def test_valid_token_regular_user_returns_default_roles(self):
        """Test: Token válido con usuario regular retorna roles por defecto"""
        mock_user = Mock(spec=Usuario)
        mock_user.USER_ID = "regular_user"
        mock_user.NOM_USUARIO = "Usuario Regular"
        mock_user.ACTIVO = True
        
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        with patch('app.dependencies.settings') as mock_settings:
            mock_settings.secret_key = "test_secret"
            mock_settings.algorithm = "HS256"
            
            valid_token = jwt.encode(
                {"sub": "regular_user"},
                "test_secret",
                algorithm="HS256"
            )
            
            result = get_current_user(db=mock_db, token=valid_token)
            
            assert result["user_id"] == "regular_user"
            assert result["username"] == "Usuario Regular"
            assert "PPSH_ANALISTA" in result["roles"]
            assert result["es_admin"] is False


class TestOAuth2Scheme:
    """Tests para el esquema OAuth2"""
    
    def test_reusable_oauth2_configured(self):
        """Test: OAuth2 scheme está correctamente configurado"""
        assert reusable_oauth2 is not None
        # auto_error=False permite autenticación opcional
        assert reusable_oauth2.auto_error is False
