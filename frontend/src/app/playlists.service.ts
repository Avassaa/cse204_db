import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class PlaylistsService {
  private apiUrl = "http://localhost:8000/playlists";

  constructor(private http: HttpClient) {}

  getMyPlaylists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me`);
  }

  getAllPlaylists(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPlaylist(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updatePlaylist(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deletePlaylist(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  addSongsToPlaylist(playlistId: number, songIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${playlistId}/songs`, {
      song_ids: songIds,
    });
  }

  getSongsInPlaylist(playlistId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${playlistId}/songs`);
  }
  getAllSongs(search: string = ""): Observable<any[]> {
    return this.http.get<any[]>("http://localhost:8000/songs", {
      params: { search },
    });
  }

  removeSongsFromPlaylist(
    playlistId: number,
    songIds: number[],
  ): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${playlistId}/songs`, {
      body: { song_ids: songIds },
    });
  }
}
