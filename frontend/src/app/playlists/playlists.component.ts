import { Component, OnInit } from "@angular/core";
import { PlaylistsService } from "../playlists.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import Swal from "sweetalert2";
import { RouterModule } from "@angular/router";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "app-playlists",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./playlists.component.html",
  styleUrl: "./playlists.component.scss",
})
export class PlaylistsComponent implements OnInit {
  myPlaylists: any[] = [];
  allPlaylists: any[] = [];
  showAll = false;
  loading = false;
  error = "";
  showAddSongsModal = false;
  selectedPlaylistForSongs: any = null;
  songIdsInput = "";
  addSongsError = "";
  addSongsSuccess = "";
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedPlaylist: any = null;

  searchQuery = "";
  searchSubject = new Subject<string>();

  allSongs: any[] = [];
  selectedSongIds: Set<number> = new Set();

  newPlaylist = {
    playlistName: "",
    playlistDescription: "",
    playlistPicture: "",
  };

  constructor(
    private playlistsService: PlaylistsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadMyPlaylists();

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

  searchSongs(): void {
    this.searchSubject.next(this.searchQuery);
  }
  openAddSongsModal(playlist: any): void {
    this.selectedPlaylistForSongs = playlist;
    this.selectedSongIds = new Set<number>();
    this.searchQuery = "";
    this.showAddSongsModal = true;
    this.searchSongs();
  }

  viewPlaylist(playlist: any): void {
    this.router.navigate(["/playlists", playlist.playlistID]);
  }

  loadMyPlaylists() {
    this.loading = true;
    this.error = "";
    this.playlistsService.getMyPlaylists().subscribe({
      next: (data: any) => {
        this.myPlaylists = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = "Could not load your playlists.";
        this.loading = false;
      },
    });
  }

  loadAllPlaylists() {
    this.loading = true;
    this.error = "";
    this.playlistsService.getAllPlaylists().subscribe({
      next: (data) => {
        this.allPlaylists = data;
        this.showAll = true;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = "Could not load all playlists.";
        this.loading = false;
      },
    });
  }

  hideAllPlaylists() {
    this.showAll = false;
    this.allPlaylists = [];
  }

  openCreateModal() {
    this.newPlaylist = {
      playlistName: "",
      playlistDescription: "",
      playlistPicture: "",
    };
    this.showCreateModal = true;
  }
  createPlaylist() {
    this.playlistsService.createPlaylist(this.newPlaylist).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadMyPlaylists();
        Swal.fire("Created!", "Playlist created.", "success");
      },
      error: () => {
        Swal.fire("Error", "Could not create playlist.", "error");
      },
    });
  }

  openEditModal(playlist: any) {
    this.selectedPlaylist = { ...playlist };
    this.showEditModal = true;
  }
  updatePlaylist() {
    this.playlistsService
      .updatePlaylist(this.selectedPlaylist.playlistID, this.selectedPlaylist)
      .subscribe({
        next: () => {
          this.showEditModal = false;
          this.loadMyPlaylists();
          Swal.fire("Saved!", "Playlist updated.", "success");
        },
        error: () => {
          Swal.fire("Error", "Could not update playlist.", "error");
        },
      });
  }

  // DELETE
  openDeleteModal(playlist: any) {
    this.selectedPlaylist = playlist;
    this.showDeleteModal = true;
  }
  deletePlaylist() {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${this.selectedPlaylist.playlistName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        this.playlistsService
          .deletePlaylist(this.selectedPlaylist.playlistID)
          .subscribe({
            next: () => {
              this.showDeleteModal = false;
              this.loadMyPlaylists();
              Swal.fire("Deleted!", "Playlist has been deleted.", "success");
            },
            error: () => {
              Swal.fire("Error", "Could not delete playlist.", "error");
            },
          });
      }
    });
  }

  showPlaylistSongsModal = false;
  playlistSongs: any[] = [];
  selectedPlaylistForView: any = null;

  toggleSongSelection(songId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedSongIds.add(songId);
    } else {
      this.selectedSongIds.delete(songId);
    }
  }

  addSongsToPlaylist() {
    const songIds = Array.from(this.selectedSongIds);
    if (!songIds.length) {
      this.addSongsError = "Please select at least one song.";
      return;
    }
    this.playlistsService
      .addSongsToPlaylist(this.selectedPlaylistForSongs.playlistID, songIds)
      .subscribe({
        next: (res) => {
          this.showAddSongsModal = false;
          this.loadMyPlaylists();
          Swal.fire(
            "Added!",
            `Added songs: ${res.added_song_ids.join(", ")}`,
            "success",
          );
        },
        error: (err) => {
          Swal.fire("Error", "Could not add songs to playlist.", "error");
        },
      });
  }
}
