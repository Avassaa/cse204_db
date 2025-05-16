export interface Artist {
  artistID: number;
  artistDescription: string;
  artistName: String;
  artistLocation: String;
  artistPicture: String;
}

export interface CreateArtistRequest {
  artistName: string;
  artistDescription: string;
  artistLocation?: string;
  artistPicture: string;
}

export interface UpdateArtistRequest {
  artistName?: string;
  artistDescription?: string;
  artistLocation?: string;
  artistPicture?: string;
}
