from starlette.status import HTTP_404_NOT_FOUND
from models import *
from fastapi import APIRouter,Path, HTTPException,status
from starlette.routing import Route
from db_ops import db_dependency
from schemas import ArtistResponse, CreateArtistRequest,CreateAlbumRequest,CreateSongRequest,AlbumResponse
from sqlalchemy import func

artistRouter= APIRouter(prefix="/artists")


@artistRouter.get("")
async def get_all_artists(db:db_dependency):
    return db.query(Artist).all()

@artistRouter.get(
    "/{artist_id}",
    response_model=ArtistResponse,
    responses={
        404: {"description": "Artist not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_artist(
    db: db_dependency,
    artist_id: int = Path(..., gt=0, description="The ID of the artist to retrieve")
):
    try:
        artist = db.query(Artist).filter(Artist.artistID == artist_id).first()
        if not artist:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND,
                detail=f"Artist with ID {artist_id} not found"
            )
        return artist
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while retrieving the artist: {str(e)}"
        )
#@artistRouter.get("/{artist_id}", response_model=None)
#async def get_artist_with_albums(db: db_dependency, artist_id: int = Path(..., gt=0)):
#    artist = db.query(Artist).filter(Artist.artistID == artist_id).first()
#    if not artist:
#        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Artist not found")
#
#    albums = db.query(Album).filter(Album.artistID == artist_id).all()
#
#    result = {
#        "artistID": artist.artistID,
#        "artistName": artist.artistName,
#        "artistDescription": artist.artistDescription,
#        "artistLocation": artist.artistLocation,
#        "artistPicture": artist.artistPicture,
#        "albums": albums
#    }
#
#    return result

@artistRouter.get("/albums")
async def get_albums(db:db_dependency):
    return db.query(Album).all()



@artistRouter.get("/{artist_id}/albums", response_model=list[AlbumResponse])
async def get_albums_by_artist(db: db_dependency, artist_id: int = Path(..., gt=0)):
    albums_with_count = db.query(
        Album,
        func.count(Song.songID).label('song_count')
    ).outerjoin(
        Song, Song.albumID == Album.albumID
    ).filter(
        Album.artistID == artist_id
    ).group_by(
        Album.albumID
    ).all()

    result = []
    for album, song_count in albums_with_count:
        album_dict = {
            "albumID": album.albumID,
            "albumName": album.albumName,
            "albumReleaseDate": album.albumReleaseDate,
            "albumDescription": album.albumDescription,
            "artistID": album.artistID,
            "songCount": song_count
        }
        result.append(album_dict)

    return result
@artistRouter.get("/{artist_id}/albums/{album_id}")
async def get_album_by_artist(db:db_dependency,artist_id:int=Path(...,gt=0),album_id:int=Path(...,gt=0)):
    album = db.query(Album).filter(Album.albumID==album_id, Album.artistID==artist_id).first()
    if not album:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Album not found for this artist")
    return album


@artistRouter.get("/albums/{album_id}", response_model=AlbumResponse)
async def get_album_by_id(db: db_dependency, album_id: int = Path(..., gt=0)):
    album = db.query(Album).filter(Album.albumID == album_id).first()

    if not album:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail="Album not found"
        )

    # Get song count
    song_count = db.query(func.count(Song.songID)).filter(Song.albumID == album_id).scalar()

    # Format response
    album_dict = {
        "albumID": album.albumID,
        "albumName": album.albumName,
        "albumReleaseDate": album.albumReleaseDate,
        "albumDescription": album.albumDescription,
        "artistID": album.artistID,
        "songCount": song_count
    }

    return album_dict

@artistRouter.put("/{artist_id}")
async def update_artist(db: db_dependency, artist: CreateArtistRequest, artist_id: int = Path(..., gt=0)):
    db_artist = db.query(Artist).filter(Artist.artistID == artist_id).first()
    if not db_artist:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Artist not found")

    db_artist.artistName = artist.artistName
    db_artist.artistDescription = artist.artistDescription
    db_artist.artistLocation = artist.artistLocation  # Missing
    db_artist.artistPicture = artist.artistPicture    # Missing
    db.commit()
    return db_artist

@artistRouter.post("")
async def create_artist(db: db_dependency, artist: CreateArtistRequest):
        new_artist = Artist(
              artistName=artist.artistName,
              artistDescription=artist.artistDescription,
              artistLocation=artist.artistLocation,
              artistPicture=artist.artistPicture
          )
        db.add(new_artist)
        db.commit()
        db.refresh(new_artist)
        return new_artist

@artistRouter.delete("/{artist_id}")
async def delete_artist(db: db_dependency, artist_id: int = Path(..., gt=0)):
    # Find all albums by this artist
    albums = db.query(Album).filter(Album.artistID == artist_id).all()

    # For each album, get all songs and delete playlist_song entries
    for album in albums:
        songs = db.query(Song).filter(Song.albumID == album.albumID).all()
        song_ids = [song.songID for song in songs]
        if song_ids:
            db.query(PlaylistSong).filter(PlaylistSong.songID.in_(song_ids)).delete(synchronize_session=False)

    # Find the artist
    db_artist = db.query(Artist).filter(Artist.artistID == artist_id).first()
    if not db_artist:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Artist not found")

    db.delete(db_artist)
    db.commit()
    return {"message": "Artist deleted successfully"}


@artistRouter.delete("/{artist_id}/albums/{album_id}")
async def delete_album(
    db: db_dependency,
    artist_id: int = Path(..., gt=0),
    album_id: int = Path(..., gt=0)
):
    # Find the album
    db_album = db.query(Album).filter(Album.albumID == album_id, Album.artistID == artist_id).first()
    if not db_album:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Album not found for this artist")

    # Get all songs in this album
    songs = db.query(Song).filter(Song.albumID == album_id).all()
    song_ids = [song.songID for song in songs]

    # Delete playlist_song entries for these songs
    if song_ids:
        db.query(PlaylistSong).filter(PlaylistSong.songID.in_(song_ids)).delete(synchronize_session=False)

    # Now we can safely delete the album
    db.delete(db_album)
    db.commit()
    return {"message": "Album deleted successfully"}

@artistRouter.post("/{artist_id}/albums", status_code=status.HTTP_201_CREATED)
async def create_album_for_artist(
    db: db_dependency,
    album: CreateAlbumRequest,
    artist_id: int = Path(..., gt=0)
):
    # First check if artist exists
    artist = db.query(Artist).filter(Artist.artistID == artist_id).first()
    if not artist:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Artist not found")

    # Create new album with artistID automatically set
    new_album = Album(
        albumName=album.albumName,
        albumReleaseDate=album.albumReleaseDate,
        albumDescription=album.albumDescription,
        artistID=artist_id  # Link to the artist
    )

    db.add(new_album)
    db.commit()
    db.refresh(new_album)
    return new_album



@artistRouter.put("/{artist_id}/albums/{album_id}")
async def update_album(
    db: db_dependency,
    album: CreateAlbumRequest,
    artist_id: int = Path(..., gt=0),
    album_id: int = Path(..., gt=0)
):
    db_album = db.query(Album).filter(
        Album.albumID == album_id,
        Album.artistID == artist_id
    ).first()

    if not db_album:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail="Album not found for this artist"
        )

    # Update album properties
    db_album.albumName = album.albumName
    db_album.albumReleaseDate = album.albumReleaseDate
    db_album.albumDescription = album.albumDescription

    # Commit changes
    db.commit()
    db.refresh(db_album)

    return db_album


@artistRouter.get("/{artist_id}/songs")
def get_songs_by_artist(db: db_dependency, artist_id: int = Path(..., gt=0)):
    # Join SongArtist, Song, Album
    results = (
        db.query(
            Song.songID,
            Song.songName,
            Album.albumID,
            Album.albumName
        )
        .join(SongArtist, SongArtist.songID == Song.songID)
        .join(Album, Album.albumID == Song.albumID)
        .filter(SongArtist.artistID == artist_id)
        .all()
    )

    # Format response
    songs = []
    for songID, songName, albumID, albumName in results:
        songs.append({
            "songID": songID,
            "songName": songName,
            "albumID": albumID,
            "albumName": albumName
        })
    return songs
