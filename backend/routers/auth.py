from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from starlette.exceptions import HTTPException
from db_ops import db_dependency
from schemas import CreateUserRequest, Token
from models import User
from passlib.context import CryptContext
from typing import Annotated
from jose import jwt, JWTError
from datetime import datetime, timedelta

SECRET_KEY = "fp1p363NWe51t4TxOD19kmtpwS3mVDLF"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

o2_auth_bearer = OAuth2PasswordBearer(tokenUrl="/auth/token")
router = APIRouter(prefix="/auth", tags=["Authentication"])
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_current_user(token: Annotated[str, Depends(o2_auth_bearer)]):
    print(f"[DEBUG] Token received: {token}")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
        return {"username": username, "user_id": user_id}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    payload = {
        "sub": username,
        "id": user_id,
        "exp": datetime.utcnow() + expires_delta
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(username: str, password: str, db):
    user = db.query(User).filter(User.userName == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.userPassword):
        return False
    return user

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    user = User(
        userName=create_user_request.userName,
        userEmail=create_user_request.userEmail,
        userPassword=bcrypt_context.hash(create_user_request.userPassword),
        userProfilePhoto=create_user_request.userProfilePhoto,
        userLocation=create_user_request.userLocation,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"userID": user.userID, "userName": user.userName}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = create_access_token(user.userName, user.userID, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer"}
