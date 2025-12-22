"""
Tests para app/routers/auth.py
Sistema de Trámites Migratorios de Panamá

Objetivo: Cubrir líneas 21-39 para alcanzar 85%+ de cobertura.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.auth import Usuario


class TestLoginAccessToken:
    """Tests para el endpoint de login"""
    
    def test_login_user_not_found(self, client: TestClient, db_session: Session):
        """Test: Login con usuario inexistente retorna 400"""
        response = client.post(
            "/api/v1/login/access-token",
            data={"username": "nonexistent_user", "password": "password123"}
        )
        
        assert response.status_code == 400
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_user_no_password(self, client: TestClient, db_session: Session):
        """Test: Login con usuario sin password retorna 400"""
        # Crear usuario sin password
        user = Usuario(
            USER_ID="user_no_pass",
            NOM_USUARIO="Usuario Sin Password",
            PASSWORD=None,
            ACTIVO=True
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post(
            "/api/v1/login/access-token",
            data={"username": "user_no_pass", "password": "anypassword"}
        )
        
        assert response.status_code == 400
        assert "User has no password set" in response.json()["detail"]
    
    def test_login_incorrect_password(self, client: TestClient, db_session: Session):
        """Test: Login con password incorrecto retorna 400"""
        # Crear usuario con password
        from app.utils.security import get_password_hash
        hashed_password = get_password_hash("correct_password")
        
        user = Usuario(
            USER_ID="user_wrong_pass",
            NOM_USUARIO="Usuario Test",
            PASSWORD=hashed_password,
            ACTIVO=True
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post(
            "/api/v1/login/access-token",
            data={"username": "user_wrong_pass", "password": "wrong_password"}
        )
        
        assert response.status_code == 400
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_inactive_user(self, client: TestClient, db_session: Session):
        """Test: Login con usuario inactivo retorna 400"""
        from app.utils.security import get_password_hash
        hashed_password = get_password_hash("correct_password")
        
        user = Usuario(
            USER_ID="inactive_user",
            NOM_USUARIO="Usuario Inactivo",
            PASSWORD=hashed_password,
            ACTIVO=False  # Usuario inactivo
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post(
            "/api/v1/login/access-token",
            data={"username": "inactive_user", "password": "correct_password"}
        )
        
        assert response.status_code == 400
        assert "Inactive user" in response.json()["detail"]
    
    def test_login_success(self, client: TestClient, db_session: Session):
        """Test: Login exitoso retorna access_token"""
        from app.utils.security import get_password_hash
        hashed_password = get_password_hash("correct_password")
        
        user = Usuario(
            USER_ID="active_user",
            NOM_USUARIO="Usuario Activo",
            PASSWORD=hashed_password,
            ACTIVO=True
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post(
            "/api/v1/login/access-token",
            data={"username": "active_user", "password": "correct_password"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
