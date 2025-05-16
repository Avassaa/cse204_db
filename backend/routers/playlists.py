from fastapi import APIRouter, Depends
from sqlalchemy import func
from db_ops import db_dependency
from models import Playlist, PlaylistUser, User, PlaylistSong, Song
from routers.auth import get_current_user
from schemas import UpdatePlaylistRequest
from fastapi import HTTPException, status, Path
playlistRouter = APIRouter(prefix="/playlists", tags=["Playlists"])
from schemas import CreatePlaylistRequest
from fastapi import Body


@playlistRouter.get("")
def get_playlists_with_owners_and_song_count(db: db_dependency):
    results = (
        db.query(
            Playlist.playlistID,
            Playlist.playlistName,
            User.userID,
            User.userName,
            func.count(PlaylistSong.songID).label("song_count")
        )
        .join(PlaylistUser, PlaylistUser.playlistID == Playlist.playlistID)
        .join(User, User.userID == PlaylistUser.userID)
        .outerjoin(PlaylistSong, PlaylistSong.playlistID == Playlist.playlistID)
        .group_by(Playlist.playlistID, User.userID)
        .all()
    )
    playlists = []
    for playlistID, playlistName, userID, userName, song_count in results:
        playlists.append({
            "playlistID": playlistID,
            "playlistName": playlistName,
            "owner": {"userID": userID, "userName": userName},
            "songCount": song_count
        })
    return playlists

@playlistRouter.get("/me")
def get_my_playlists(
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    results = (
        db.query(
            Playlist.playlistID,
            Playlist.playlistName,
            func.count(PlaylistSong.songID).label("song_count")
        )
        .join(PlaylistUser, PlaylistUser.playlistID == Playlist.playlistID)
        .outerjoin(PlaylistSong, PlaylistSong.playlistID == Playlist.playlistID)
        .filter(PlaylistUser.userID == user_id)
        .group_by(Playlist.playlistID)
        .all()
    )
    playlists = []
    for playlistID, playlistName, song_count in results:
        playlists.append({
            "playlistID": playlistID,
            "playlistName": playlistName,
            "songCount": song_count
        })
    return playlists

@playlistRouter.post("", status_code=status.HTTP_201_CREATED)
def create_playlist(
        playlist_data: CreatePlaylistRequest,
        db: db_dependency,
        current_user: dict = Depends(get_current_user)
    ):
        new_playlist = Playlist(
            playlistName=playlist_data.playlistName,
            playlistDescription=playlist_data.playlistDescription,
            playlistPicture=playlist_data.playlistPicture
        )
        db.add(new_playlist)
        db.commit()
        db.refresh(new_playlist)

        playlist_user = PlaylistUser(
            playlistID=new_playlist.playlistID,
            userID=current_user["user_id"]
        )
        db.add(playlist_user)
        db.commit()

        return {
            "playlistID": new_playlist.playlistID,
            "playlistName": new_playlist.playlistName,
            "playlistDescription": new_playlist.playlistDescription,
            "playlistPicture": new_playlist.playlistPicture,
            "ownerID": current_user["user_id"]
        }



@playlistRouter.get("/{playlist_id}/songs")
def get_songs_in_playlist(db: db_dependency, playlist_id: int = Path(..., gt=0)):
    results = (
        db.query(Song)
        .join(PlaylistSong, PlaylistSong.songID == Song.songID)
        .filter(PlaylistSong.playlistID == playlist_id)
        .all()
    )
    return results


@playlistRouter.post("/{playlist_id}/songs", status_code=status.HTTP_201_CREATED)
def add_song_to_playlist(
    db: db_dependency,

    playlist_id: int = Path(..., gt=0),
    song_ids: list[int] = Body(..., embed=True),  # Accepts a list of song IDs in the request body
    current_user: dict = Depends(get_current_user)
):
    # Check if playlist exists and belongs to the current user
    playlist_user = db.query(PlaylistUser).filter(
        PlaylistUser.playlistID == playlist_id,
        PlaylistUser.userID == current_user["user_id"]
    ).first()
    if not playlist_user:
        raise HTTPException(status_code=403, detail="Not authorized to modify this playlist")

    added = []
    for song_id in song_ids:
        # Check if song exists
        song = db.query(PlaylistSong).filter(
            PlaylistSong.playlistID == playlist_id,
            PlaylistSong.songID == song_id
        ).first()
        if song:
            continue  # Already in playlist
        new_entry = PlaylistSong(playlistID=playlist_id, songID=song_id)
        db.add(new_entry)
        added.append(song_id)
    db.commit()
    return {"added_song_ids": added}


@playlistRouter.put("/{playlist_id}", status_code=status.HTTP_200_OK)
def update_playlist(
    db: db_dependency,

    playlist_id: int = Path(..., gt=0),
    update_data: UpdatePlaylistRequest = Body(...),
    current_user: dict = Depends(get_current_user)
):
    # Check if playlist exists and belongs to the current user
    playlist_user = db.query(PlaylistUser).filter(
        PlaylistUser.playlistID == playlist_id,
        PlaylistUser.userID == current_user["user_id"]
    ).first()
    if not playlist_user:
        raise HTTPException(status_code=403, detail="Not authorized to update this playlist")

    playlist = db.query(Playlist).filter(Playlist.playlistID == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Update fields if provided
    if update_data.playlistName is not None:
        playlist.playlistName = update_data.playlistName
    if update_data.playlistDescription is not None:
        playlist.playlistDescription = update_data.playlistDescription
    if update_data.playlistPicture is not None:
        playlist.playlistPicture = update_data.playlistPicture

    db.commit()
    db.refresh(playlist)
    return {
        "playlistID": playlist.playlistID,
        "playlistName": playlist.playlistName,
        "playlistDescription": playlist.playlistDescription,
        "playlistPicture": playlist.playlistPicture
    }

@playlistRouter.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playlist(
    db: db_dependency,
    playlist_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    playlist_user = db.query(PlaylistUser).filter(
        PlaylistUser.playlistID == playlist_id,
        PlaylistUser.userID == current_user["user_id"]
    ).first()
    if not playlist_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this playlist")

    db.query(PlaylistSong).filter(PlaylistSong.playlistID == playlist_id).delete()

    db.query(PlaylistUser).filter(PlaylistUser.playlistID == playlist_id).delete()

    playlist = db.query(Playlist).filter(Playlist.playlistID == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    db.delete(playlist)
    db.commit()
    return None




@playlistRouter.delete("/{playlist_id}/songs", status_code=status.HTTP_200_OK)
def remove_songs_from_playlist(
    db: db_dependency,
    playlist_id: int = Path(..., gt=0),
    song_ids: list[int] = Body(..., embed=True),
     current_user: dict = Depends(get_current_user)
):
    playlist_user = db.query(PlaylistUser).filter(
        PlaylistUser.playlistID == playlist_id,
        PlaylistUser.userID == current_user["user_id"]
    ).first()
    if not playlist_user:
        raise HTTPException(status_code=403, detail="Not authorized to modify this playlist")

    removed = []
    for song_id in song_ids:
        playlist_song = db.query(PlaylistSong).filter(
            PlaylistSong.playlistID == playlist_id,
            PlaylistSong.songID == song_id
        ).first()
        if playlist_song:
            db.delete(playlist_song)
            removed.append(song_id)

    db.commit()
    return {"removed_song_ids": removed}
