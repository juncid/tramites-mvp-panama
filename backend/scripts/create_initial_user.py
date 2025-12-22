import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.infrastructure.database import SessionLocal
from app.models.auth import Usuario
from app.utils.security import get_password_hash

def create_initial_user():
    db = SessionLocal()
    try:
        user_id = "admin"
        password = "admin123" # Change this in production!
        hashed_password = get_password_hash(password)
        
        user = db.query(Usuario).filter(Usuario.USER_ID == user_id).first()
        if not user:
            print(f"Creating user {user_id}...")
            user = Usuario(
                USER_ID=user_id,
                NOM_USUARIO="Administrador",
                EMAIL_USUARIO="admin@migracion.gob.pa",
                PASSWORD=hashed_password,
                ACTIVO=True,
                LOGIN=True,
                RESETPASS=False
            )
            db.add(user)
        else:
            print(f"Updating user {user_id} password...")
            user.PASSWORD = hashed_password
            user.ACTIVO = True
            
        db.commit()
        print("User created/updated successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_user()
