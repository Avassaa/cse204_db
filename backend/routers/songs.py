from fastapi import APIRouter, Path, HTTPException
from starlette.status import HTTP_204_NO_CONTENT
from models import *
from db_ops import db_dependency
from models import Song
from schemas import CreateSongRequest, UpdateSongRequest
from email.policy import HTTP
from typing import Optional
from fastapi import Query

router = APIRouter(prefix="/songs", tags=["Songs"])


@router.get("")
def get_all_songs(db: db_dependency, search: Optional[str]):
    query = db.query(Song)
    if search:
        query = query.filter(Song.songName.ilike(f"%{search}%"))
    return query.all()





@router.get("/{album_id}")
def get_songs_by_album(db:db_dependency, album_id:int=Path(gt=0)):
    return db.query(Song).filter(Song.albumID==album_id).all()


@router.delete("/{song_id}", status_code=HTTP_204_NO_CONTENT)
def delete_song(db:db_dependency, song_id:int=Path(gt=0)):
    # First delete playlist references
    db.query(PlaylistSong).filter(PlaylistSong.songID == song_id).delete(synchronize_session=False)

    # Now delete the song
    song = db.query(Song).filter(Song.songID==song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    db.delete(song)
    db.commit()
    return {"message": "Song deleted successfully"}



@router.get("/{song_id}")
def get_song_by_id(db:db_dependency, song_id:int=Path(gt=0)):
    return db.query(Song).filter(Song.songID==song_id).first()


@router.put("/{song_id}")
def update_song(db:db_dependency, updateSongRequest:UpdateSongRequest, song_id:int=Path(gt=0)):
    song = db.query(Song).filter(Song.songID==song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    song.songName = updateSongRequest.songName
    song.songDuration = updateSongRequest.songDuration
    song.songExplicit = updateSongRequest.songExplicit
    song.songLyrics = updateSongRequest.songLyrics
    song.songGenre = updateSongRequest.songGenre
    db.commit()
    return song


@router.post("/{album_id}")
def create_song(createSongRequest:CreateSongRequest, db:db_dependency, album_id:int=Path(gt=0)):
    # Check if album exists
    album = db.query(Album).filter(Album.albumID == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    song = Song(
        songName=createSongRequest.songName,
        songDuration=createSongRequest.songDuration,
        songLyrics=createSongRequest.songLyrics,
        songExplicit=createSongRequest.songExplicit,
        songGenre=createSongRequest.songGenre,
        albumID=album_id
    )
    db.add(song)
    db.commit()
    db.refresh(song)

    return song
