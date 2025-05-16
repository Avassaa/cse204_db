from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker,Session
from typing import Annotated
from fastapi import Depends

SQLALCHEMY_DATABASE_URL = "mysql://avassa:8161@localhost/cse204_music_library"

engine=  create_engine (
SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker (autocommit=False, autoflush=False, bind = engine)
Base = declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency= Annotated[Session,Depends(get_db)]
