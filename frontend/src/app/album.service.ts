import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Album } from "./models/album.model";
import {
  Song,
  CreateSongRequest,
  UpdateSongRequest,
} from "./models/song.model";
@Injectable({
  providedIn: "root",
})
export class AlbumService {
  constructor(private http: HttpClient) {}

  apiUrl = "http://localhost:8000/artists";

  getAllAlbums(artistID: number): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/${artistID}/albums`);
  }

  createAlbum(artistID: number, album: Album): Observable<Album> {
    return this.http.post<Album>(`${this.apiUrl}/${artistID}/albums`, album);
  }
  updateAlbum(
    artistID: number,
    albumID: number,
    album: Album,
  ): Observable<Album> {
    return this.http.put<Album>(
      `${this.apiUrl}/${artistID}/albums/${albumID}`,
      album,
    );
  }

  deleteAlbum(artistID: number, albumID: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${artistID}/albums/${albumID}`,
    );
  }
  getAlbumById(albumId: number): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/albums/${albumId}`);
  }

  getSongsByAlbum(albumId: number): Observable<Song[]> {
    return this.http.get<Song[]>(`http://localhost:8000/songs/${albumId}`);
  }

  createSong(albumId: number, song: CreateSongRequest): Observable<Song> {
    return this.http.post<Song>(`http://localhost:8000/songs/${albumId}`, song);
  }

  updateSong(
    songId: number,
    updateSongRequest: UpdateSongRequest,
  ): Observable<any> {
    return this.http.put<any>(
      `http://localhost:8000/songs/${songId}`,
      updateSongRequest,
    );
  }

  deleteSong(albumId: number, songId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8000/songs/${songId}`);
  }
}
