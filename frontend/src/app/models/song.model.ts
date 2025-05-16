export interface Song {
  songID: number;
  songName: string;
  songDuration: number;
  songLyrics: string;
  songExplicit: boolean;
  songGenre: string;
  albumID: number;
}

export interface CreateSongRequest {
  songName: string;
  songDuration: number;
  songLyrics: string;
  songExplicit: boolean;
  songGenre: string;
}

export interface UpdateSongRequest {
  songName: string;
  songDuration: number;
  songLyrics: string;
  songExplicit: boolean;
  songGenre: string;
}
