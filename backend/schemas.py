from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class CreateAlbumRequest(BaseModel):
    albumName: str = Field(min_length=1, description="Album Name")
    albumReleaseDate: datetime = Field(default_factory=datetime.now)
    albumDescription: str = Field(min_length=1, description="Album Description")

class CreateArtistRequest(BaseModel):
    artistName: str = Field(min_length=1, description="Artist Name")
    artistDescription: str = Field(min_length=1, description="Artist Description")
    artistLocation: str = Field(min_length=1, description="Artist Location")
    artistPicture: str = Field(min_length=1, description="Artist Picture")

class CreateSongRequest(BaseModel):
    songName: str = Field(min_length=1, description="Song Name")
    songDuration: int = Field(gt=0, description="Song Duration")
    songExplicit: bool = Field(default=False, description="Song Explicit")
    songLyrics: str = Field(min_length=1, description="Song Lyrics")
    songGenre: str = Field(min_length=1, description="Song Genre")

class UpdateSongRequest(BaseModel):
    songName: str = Field(min_length=1, description="Song Name")
    songDuration: int = Field(gt=0, description="Song Duration")
    songExplicit: bool = Field(default=False, description="Song Explicit")
    songLyrics: str = Field(min_length=1, description="Song Lyrics")
    songGenre: str = Field(min_length=1, description="Song Genre")

class ArtistResponse(BaseModel):
    artistID: int
    artistName: str
    artistDescription: str
    artistLocation: str
    artistPicture: str
    class Config:
        from_attributes = True

class AlbumResponse(BaseModel):
    albumID: int
    albumName: str
    albumReleaseDate: datetime
    albumDescription: str
    songCount: int = 0
    class Config:
        from_attributes = True

class CreateUserRequest(BaseModel):
    userName: str = Field(min_length=1)
    userEmail: EmailStr
    userPassword: str = Field(min_length=6)
    userProfilePhoto: Optional[str] = None
    userLocation: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str


class CreatePlaylistRequest(BaseModel):
    playlistName: str = Field(min_length=1, description="Playlist Name")
    playlistDescription: Optional[str] = Field(default="", description="Playlist Description")
    playlistPicture: Optional[str] = Field(default=None, description="Playlist Picture (URL or path)")


class UpdatePlaylistRequest(BaseModel):
    playlistName: Optional[str] = None
    playlistDescription: Optional[str] = None
    playlistPicture: Optional[str] = None
