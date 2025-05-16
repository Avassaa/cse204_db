import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { PlaylistsService } from "../playlists.service";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "app-playlist-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./playlist-detail.component.html",
  styleUrls: ["./playlist-detail.component.scss"],
})
export class PlaylistDetailComponent implements OnInit {
  playlistId: number;
  playlist: any;
  songs: any[] = [];
  loading = true;
  error: string | null = null;
  isOwner = false;
  removingSongs = false;
  selectedSongsToRemove = new Set<number>();

  allSongs: any[] = [];
  filteredSongs: any[] = [];
  selectedSongIds = new Set<number>();
  searchQuery = "";
  showAddSongsModal = false;
  addingSongs = false;
  searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private playlistsService: PlaylistsService,
  ) {
    this.playlistId = +this.route.snapshot.paramMap.get("id")!;
  }

  ngOnInit(): void {
    this.loadPlaylistDetails();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.playlistsService.getAllSongs(searchTerm).subscribe({
          next: (songs) => {
            this.allSongs = songs;
          },
          error: (err) => {
            console.error("Error fetching songs:", err);
          },
        });
      });
  }

  loadPlaylistDetails(): void {
    this.loading = true;
    this.error = null;

    this.playlistsService.getAllPlaylists().subscribe({
      next: (playlists) => {
        const foundPlaylist = playlists.find(
          (p) => p.playlistID === this.playlistId,
        );

        if (foundPlaylist) {
          this.playlist = foundPlaylist;

          this.playlistsService.getMyPlaylists().subscribe({
            next: (myPlaylists) => {
              this.isOwner = myPlaylists.some(
                (p) => p.playlistID === this.playlistId,
              );
              this.loadPlaylistSongs();
            },
            error: (err) => {
              console.error("Error checking playlist ownership:", err);
              this.isOwner = false;
              this.loadPlaylistSongs();
            },
          });
        } else {
          this.error = "Playlist not found";
          this.loading = false;
        }
      },
      error: (err) => {
        console.error("Error fetching playlist:", err);
        this.error = "Failed to load playlist";
        this.loading = false;
      },
    });
  }

  loadPlaylistSongs(): void {
    this.playlistsService.getSongsInPlaylist(this.playlistId).subscribe({
      next: (songs) => {
        this.songs = songs;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching songs:", err);
        this.error = "Failed to load songs";
        this.loading = false;
      },
    });
  }

  searchSongs(): void {
    this.searchSubject.next(this.searchQuery);
  }

  toggleSongSelection(songId: number, event: any): void {
    if (event.target.checked) {
      this.selectedSongIds.add(songId);
    } else {
      this.selectedSongIds.delete(songId);
    }
  }

  addSongsToPlaylist(): void {
    if (this.selectedSongIds.size === 0) return;

    const songIdsArray = Array.from(this.selectedSongIds);
    this.addingSongs = true;

    this.playlistsService
      .addSongsToPlaylist(this.playlistId, songIdsArray)
      .subscribe({
        next: () => {
          this.addingSongs = false;
          this.showAddSongsModal = false;
          this.selectedSongIds.clear();
          this.loadPlaylistSongs();
        },
        error: (err) => {
          console.error("Error adding songs:", err);
          this.addingSongs = false;
        },
      });
  }

  toggleSongForRemoval(songId: number): void {
    if (this.selectedSongsToRemove.has(songId)) {
      this.selectedSongsToRemove.delete(songId);
    } else {
      this.selectedSongsToRemove.add(songId);
    }
  }

  removeSongsFromPlaylist(): void {
    if (!this.isOwner || this.selectedSongsToRemove.size === 0) return;

    this.removingSongs = true;
    const songIdsArray = Array.from(this.selectedSongsToRemove);

    this.playlistsService
      .removeSongsFromPlaylist(this.playlistId, songIdsArray)
      .subscribe({
        next: () => {
          this.removingSongs = false;
          this.selectedSongsToRemove.clear();
          this.loadPlaylistSongs();
        },
        error: (err) => {
          console.error("Error removing songs:", err);
          this.removingSongs = false;
        },
      });
  }
}
