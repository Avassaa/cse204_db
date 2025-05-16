import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { Artist } from "./models/artist.model";
import { CreateArtistRequest } from "./models/artist.model";
import { UpdateArtistRequest } from "./models/artist.model";

@Injectable({
  providedIn: "root",
})
export class ArtistService {
  constructor(private http: HttpClient) {}
  getAllArtists(): Observable<any> {
    return this.http.get("http://localhost:8000/artists");
  }
  getArtistById(artistID: number): Observable<Artist> {
    return this.http.get<Artist>(`http://localhost:8000/artists/${artistID}`);
  }

  removeArtist(artistID: number): Observable<any> {
    return this.http.delete(`http://localhost:8000/artists/${artistID}`);
  }
  editArtist(artistID: number): Observable<any> {
    return this.http.put(`http://localhost:8000/artists/${artistID}`, {});
  }

  createArtist(createArtistRequest: CreateArtistRequest): Observable<Artist> {
    return this.http.post<Artist>(
      `http://localhost:8000/artists`,
      createArtistRequest,
    );
  }

  updateArtist(
    artistID: number,
    updateArtistRequest: UpdateArtistRequest,
  ): Observable<Artist> {
    return this.http.put<Artist>(
      `http://localhost:8000/artists/${artistID}`,
      updateArtistRequest,
    );
  }
}
