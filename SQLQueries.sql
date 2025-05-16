CREATE TABLE MusicData_UNF ( 

    recordID INT PRIMARY KEY AUTO_INCREMENT, 

    artistID VARCHAR(255), 

    artistName VARCHAR(255), 

    artistLocation VARCHAR(255), 

    artistDescription TEXT, 

    artistPicture VARCHAR(255), 

    genreID VARCHAR(255), 

    genreName VARCHAR(255), 

    albumID VARCHAR(255), 

    albumName VARCHAR(255), 

    albumReleaseDate VARCHAR(255), 

    albumPicture VARCHAR(255), 

    albumDescription TEXT, 

    songID VARCHAR(255), 

    songOrder VARCHAR(255), 

    songName VARCHAR(255), 

    songDuration VARCHAR(255), 

    songLyrics TEXT, 

    songExplicit VARCHAR(255), 

    playlistID VARCHAR(255), 

    playlistName VARCHAR(255), 

    playlistDescription TEXT, 

    playlistPicture VARCHAR(255), 

    playlistSongID VARCHAR(255), 

    userID VARCHAR(255), 

    userName VARCHAR(255), 

    userEmail VARCHAR(255), 

    userPassword VARCHAR(255), 

    userProfilePhoto VARCHAR(255), 

    userLocation VARCHAR(255), 

    userPlaylists TEXT 

); 

 

 

 

 

  

INSERT INTO MusicData_UNF ( 

    artistID, artistName, artistLocation, artistDescription, artistPicture, 

    genreID, genreName, 

    albumID, albumName, albumReleaseDate, albumPicture, albumDescription, 

    songID, songOrder, songName, songDuration, songLyrics, songExplicit, 

    playlistID, playlistName, playlistDescription, playlistPicture, playlistSongID, 

    userID, userName, userEmail, userPassword, userProfilePhoto, userLocation, 

    userPlaylists 

) 

SELECT  

    GROUP_CONCAT(DISTINCT a.artistID), 

    GROUP_CONCAT(DISTINCT a.artistName), 

    a.artistLocation, a.artistDescription, a.artistPicture, 

    GROUP_CONCAT(DISTINCT g.genreID), 

    GROUP_CONCAT(DISTINCT g.genreName), 

    GROUP_CONCAT(DISTINCT alb.albumID), 

    GROUP_CONCAT(DISTINCT alb.albumName), 

    GROUP_CONCAT(DISTINCT alb.albumReleaseDate), 

    alb.albumPicture, alb.albumDescription, 

    GROUP_CONCAT(DISTINCT s.songID), 

    GROUP_CONCAT(DISTINCT s.songOrder), 

    GROUP_CONCAT(DISTINCT s.songName), 

    GROUP_CONCAT(DISTINCT s.songDuration), 

    s.songLyrics, 

    GROUP_CONCAT(DISTINCT s.songExplicit), 

    GROUP_CONCAT(DISTINCT p.playlistID), 

    GROUP_CONCAT(DISTINCT p.playlistName), 

    p.playlistDescription, p.playlistPicture, 

    GROUP_CONCAT(DISTINCT ps.songID), 

    u.userID, u.userName, u.userEmail, u.userPassword, u.userProfilePhoto, u.userLocation, 

    GROUP_CONCAT(DISTINCT up.playlistID) 

FROM original_dataset 

GROUP BY a.artistLocation, a.artistDescription, a.artistPicture,  

         alb.albumPicture, alb.albumDescription, s.songLyrics, 

         p.playlistDescription, p.playlistPicture, 

         u.userID, u.userName, u.userEmail, u.userPassword, u.userProfilePhoto, u.userLocation; 

 

  

CREATE TABLE MusicData_1NF ( 

    RecordID INT PRIMARY KEY AUTO_INCREMENT, 

    artistID INT, 

    artistName VARCHAR(100), 

    artistLocation VARCHAR(100), 

    artistDescription TEXT, 

    artistPicture VARCHAR(255), 

    genreID INT, 

    genreName VARCHAR(100), 

    albumID INT, 

    albumName VARCHAR(100), 

    albumReleaseDate DATE, 

    albumPicture VARCHAR(255), 

    albumDescription TEXT, 

    songID INT, 

    songOrder INT, 

    songName VARCHAR(100), 

    songDuration INT, 

    songLyrics TEXT, 

    songExplicit BOOLEAN, 

    playlistID INT, 

    playlistName VARCHAR(255), 

    playlistDescription TEXT, 

    playlistPicture VARCHAR(255), 

    playlistSongID INT, 

    userID INT, 

    userName VARCHAR(100), 

    userEmail VARCHAR(300), 

    userPassword VARCHAR(100), 

    userProfilePhoto VARCHAR(255), 

    userLocation VARCHAR(100) 

); 

 

 

 

 

 

 

INSERT INTO MusicData_1NF ( 

    artistID, artistName, artistLocation, artistDescription, artistPicture, 

    genreID, genreName, 

    albumID, albumName, albumReleaseDate, albumPicture, albumDescription, 

    songID, songOrder, songName, songDuration, songLyrics, songExplicit, 

    playlistID, playlistName, playlistDescription, playlistPicture, playlistSongID, 

    userID, userName, userEmail, userPassword, userProfilePhoto, userLocation 

) 

SELECT  

    a.artistID, a.artistName, a.artistLocation, a.artistDescription, a.artistPicture, 

    g.genreID, g.genreName, 

    alb.albumID, alb.albumName, alb.albumReleaseDate, alb.albumPicture, alb.albumDescription, 

    s.songID, s.songOrder, s.songName, s.songDuration, s.songLyrics, s.songExplicit, 

    p.playlistID, p.playlistName, p.playlistDescription, p.playlistPicture, ps.songID, 

    u.userID, u.userName, u.userEmail, u.userPassword, u.userProfilePhoto, u.userLocation 

FROM original_dataset; 

  

CREATE TABLE Artist_2NF ( 

    artistID INT PRIMARY KEY, 

    artistName VARCHAR(100), 

    artistLocation VARCHAR(100), 

    artistDescription TEXT, 

    artistPicture VARCHAR(255) 

); 

 INSERT INTO Artist_2NF (artistID, artistName, artistLocation, artistDescription, artistPicture) 

SELECT DISTINCT artistID, artistName, artistLocation, artistDescription, artistPicture 

FROM MusicData_1NF; 

  

CREATE TABLE Genre_2NF ( 

    genreID INT PRIMARY KEY, 

    genreName VARCHAR(100) 

); 

  

INSERT INTO Genre_2NF (genreID, genreName) 

SELECT DISTINCT genreID, genreName 

FROM MusicData_1NF; 

  

CREATE TABLE Album_2NF ( 

    albumID INT PRIMARY KEY, 

    albumName VARCHAR(100), 

    albumReleaseDate DATE, 

    albumPicture VARCHAR(255), 

    albumDescription TEXT, 

    artistID INT 

); 

  

INSERT INTO Album_2NF (albumID, albumName, albumReleaseDate, albumPicture, albumDescription, artistID) 

SELECT DISTINCT albumID, albumName, albumReleaseDate, albumPicture, albumDescription, artistID 

FROM MusicData_1NF; 

  

CREATE TABLE Song_2NF ( 

    songID INT PRIMARY KEY, 

    songName VARCHAR(100), 

    songDuration INT, 

    songOrder INT, 

    songLyrics TEXT, 

    songExplicit BOOLEAN, 

    albumID INT, 

    genreID INT 

); 

  

INSERT INTO Song_2NF (songID, songName, songDuration, songOrder, songLyrics, songExplicit, albumID, genreID) 

SELECT DISTINCT songID, songName, songDuration, songOrder, songLyrics, songExplicit, albumID, genreID 

FROM MusicData_1NF; 

  

CREATE TABLE User_2NF ( 

    userID INT PRIMARY KEY, 

    userName VARCHAR(100), 

    userEmail VARCHAR(300), 

    userPassword VARCHAR(100), 

    userProfilePhoto VARCHAR(255), 

    userLocation VARCHAR(100) 

); 

INSERT INTO User_2NF (userID, userName, userEmail, userPassword, userProfilePhoto, userLocation) 

SELECT DISTINCT userID, userName, userEmail, userPassword, userProfilePhoto, userLocation 

FROM MusicData_1NF; 

  

CREATE TABLE Playlist_2NF ( 

    playlistID INT PRIMARY KEY, 

    playlistName VARCHAR(255), 

    playlistDescription TEXT, 

    playlistPicture VARCHAR(255), 

    userID INT 

); 

  

INSERT INTO Playlist_2NF (playlistID, playlistName, playlistDescription, playlistPicture, userID) 

SELECT DISTINCT playlistID, playlistName, playlistDescription, playlistPicture, userID 

FROM MusicData_1NF; 

  

CREATE TABLE SongArtist_2NF ( 

    songID INT, 

    artistID INT, 

    PRIMARY KEY (songID, artistID) 

); 

  

INSERT INTO SongArtist_2NF (songID, artistID) 

SELECT DISTINCT songID, artistID 

FROM MusicData_1NF; 

  

CREATE TABLE PlaylistSong_2NF ( 

    playlistID INT, 

    songID INT, 

    PRIMARY KEY (playlistID, songID) 

); 

  

INSERT INTO PlaylistSong_2NF (playlistID, songID) 

SELECT DISTINCT playlistID, playlistSongID 

FROM MusicData_1NF 

WHERE playlistID IS NOT NULL AND playlistSongID IS NOT NULL; 

CREATE TABLE UserPlaylist_2NF ( userID INT, playlistID INT, PRIMARY KEY (userID, playlistID) ); 

 INSERT INTO UserPlaylist_2NF (userID, playlistID) SELECT DISTINCT userID, playlistIDFROM MusicData_1NF WHERE userID IS  NOT NULL AND playlistID IS NOT NULL; 

 

 

CREATE TABLE Artist ( artistID INT PRIMARY KEY, artistName VARCHAR(100), artistLocation VARCHAR(100), artistDescription TEXT, artistPicture VARCHAR(255) ); 

INSERT INTO Artist SELECT * FROM Artist_2NF; 

CREATE TABLE Genre ( genreID INT PRIMARY KEY, genreName VARCHAR(100) ); 

INSERT INTO Genre SELECT * FROM Genre_2NF; 

CREATE TABLE Album ( albumID INT PRIMARY KEY, albumName VARCHAR(100), albumReleaseDate DATE, albumPicture VARCHAR(255), albumDescription TEXT, artistID INT, FOREIGN KEY (artistID) REFERENCES Artist(artistID) ); 

INSERT INTO Album SELECT * FROM Album_2NF; 

CREATE TABLE Song ( songID INT PRIMARY KEY, songName VARCHAR(100), songDuration INT, songOrder INT, songLyrics TEXT, songExplicit BOOLEAN, albumID INT, genreID INT, FOREIGN KEY (albumID) REFERENCES Album(albumID), FOREIGN KEY (genreID) REFERENCES Genre(genreID) ); 

INSERT INTO Song SELECT * FROM Song_2NF; 

CREATE TABLE AppUser ( userID INT PRIMARY KEY, userName VARCHAR(100), userEmail VARCHAR(300), userPassword VARCHAR(100), userProfilePhoto VARCHAR(255), userLocation VARCHAR(100) ); 

INSERT INTO AppUser SELECT * FROM User_2NF; 

CREATE TABLE Playlist ( playlistID INT PRIMARY KEY, playlistName VARCHAR(255), playlistDescription TEXT, playlistPicture VARCHAR(255), userID INT, FOREIGN KEY (userID) REFERENCES AppUser(userID) ); 

INSERT INTO Playlist SELECT * FROM Playlist_2NF; 

CREATE TABLE SongArtist ( songID INT, artistID INT, PRIMARY KEY (songID, artistID), FOREIGN KEY (songID) REFERENCES Song(songID), FOREIGN KEY (artistID) REFERENCES Artist(artistID) ); 

ıNSERT INTO SongArtist SELECT * FROM SongArtist_2NF; 

CREATE TABLE PlaylistSong ( playlistID INT, songID INT, PRIMARY KEY (playlistID, songID), FOREIGN KEY (playlistID) REFERENCES Playlist(playlistID), FOREIGN KEY (songID) REFERENCES Song(songID) ); 

INSERT INTO PlaylistSong SELECT * FROM PlaylistSong_2NF; 

CREATE TABLE UserPlaylist ( userID INT, playlistID INT, PRIMARY KEY (userID, playlistID), FOREIGN KEY (userID) REFERENCES AppUser(userID), FOREIGN KEY (playlistID) REFERENCES Playlist(playlistID) ); 

INSERT INTO UserPlaylist SELECT * FROM UserPlaylist_2NF; 

 