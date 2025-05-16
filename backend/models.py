from sqlalchemy.sql.schema import Index
from db_ops import Base
from sqlalchemy import Column, Date, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship

class Artist(Base):
    __tablename__ = "artists"
    artistID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    artistName = Column(Text)
    artistLocation = Column(Text)
    artistDescription = Column(Text)
    artistPicture = Column(Text)
    albums = relationship("Album", back_populates="artist", cascade="all, delete")
    song_artists = relationship("SongArtist", back_populates="artist", cascade="all, delete")

class Song(Base):
    __tablename__ = "songs"
    songID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    songOrder = Column(Integer, index=True, autoincrement=True)
    songName = Column(Text, index=True)
    songDuration = Column(Integer, index=True)
    songLyrics = Column(Text)
    songExplicit = Column(Boolean)
    songGenre = Column(Text)
    genreID = Column(Integer, ForeignKey('genres.genreID'))
    albumID = Column(Integer, ForeignKey('albums.albumID', ondelete="CASCADE"))
    album = relationship("Album", back_populates="songs")
    artists = relationship("SongArtist", back_populates="song", cascade="all, delete")
    playlists = relationship("PlaylistSong", back_populates="song", cascade="all, delete")

class Genre(Base):
    __tablename__="genres"
    genreID= Column(Integer, primary_key=True,index=True, autoincrement=True)
    genreName= Column(Text)

class Album(Base):
    __tablename__ = "albums"
    albumID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    albumName = Column(Text)
    albumReleaseDate = Column(Date)
    albumDescription = Column(Text)
    artistID = Column(Integer, ForeignKey('artists.artistID', ondelete="CASCADE"))
    songs = relationship("Song", back_populates="album", cascade="all, delete")
    artist = relationship("Artist", back_populates="albums")

class SongArtist(Base):
    __tablename__ = "song_artists"
    songID = Column(Integer, ForeignKey('songs.songID', ondelete="CASCADE"), primary_key=True)
    artistID = Column(Integer, ForeignKey('artists.artistID', ondelete="CASCADE"), primary_key=True)
    song = relationship("Song", back_populates="artists")
    artist = relationship("Artist", back_populates="song_artists")

class PlaylistUser(Base):
    __tablename__="playlist_users"
    playlistID= Column(Integer, ForeignKey('playlists.playlistID'), primary_key=True)
    userID= Column(Integer, ForeignKey('users.userID'), primary_key=True)

class PlaylistSong(Base):
    __tablename__="playlist_songs"
    playlistID= Column(Integer, ForeignKey('playlists.playlistID'), primary_key=True)
    songID= Column(Integer, ForeignKey('songs.songID', ondelete="CASCADE"), primary_key=True)
    song = relationship("Song", back_populates="playlists")
    playlist = relationship("Playlist", back_populates="songs")

class Playlist(Base):
    __tablename__="playlists"
    playlistID= Column(Integer, primary_key=True,index=True, autoincrement=True)
    playlistName= Column(Text)
    playlistDescription= Column(Text)
    playlistPicture = Column(Text)
    songs = relationship("PlaylistSong", back_populates="playlist", cascade="all, delete")


class User(Base):
    __tablename__="users"
    userID= Column(Integer, primary_key=True,index=True, autoincrement=True)
    userName= Column(Text, nullable=False, unique=True)
    userEmail= Column(Text, nullable=False,unique=True)
    userPassword= Column(Text)
    userProfilePhoto= Column(Text)
    userLocation= Column(Text)
