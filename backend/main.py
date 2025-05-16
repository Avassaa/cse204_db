from fastapi import FastAPI
from fastapi.requests import Request
from db_ops import Base, engine
from starlette import status
from routers.songs import router as songs_router
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.artists import artistRouter as artists_router
from routers.playlists import playlistRouter
app = FastAPI()
app.include_router(songs_router)
app.include_router(artists_router)
app.include_router(auth_router)
app.include_router(playlistRouter)



@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    return response


Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello World"}
