import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { AlbumService } from "../album.service";
import { Album } from "../models/album.model";
import { Song, CreateSongRequest } from "../models/song.model";
import Swal from "sweetalert2";

@Component({
  selector: "app-show-album",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./show-album.component.html",
  styleUrls: ["./show-album.component.scss"],
})
export class ShowAlbumComponent implements OnInit {
  album: Album | null = null;
  songs: Song[] = [];
  isLoading = true;
  showCreateSongModal = false;
  showEditSongModal = false;
  showDeleteSongModal = false;
  newSong: any = {};
  editingSong: any = {};
  deletingSongId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const albumId = +params["id"];
      this.loadAlbum(albumId);
    });
  }

  loadAlbum(albumId: number): void {
    this.isLoading = true;
    this.albumService.getAlbumById(albumId).subscribe({
      next: (album) => {
        this.album = album;
        this.isLoading = false;
        this.loadSongs(albumId);
      },
      error: (error) => {
        console.error("Error loading album:", error);
        this.isLoading = false;
        Swal.fire({
          title: "Error",
          text: "Could not load album details",
          icon: "error",
          background: "#212529",
          color: "#fff",
          iconColor: "#dc3545",
          confirmButtonText: "OK",
        });
      },
    });
  }

  loadSongs(albumId: number): void {
    this.albumService.getSongsByAlbum(albumId).subscribe(
      (songs: Song[]) => {
        this.songs = songs;
        console.log("Songs:", songs);
      },
      (error: HttpErrorResponse) => {
        console.error("Error loading songs:", error);
      },
    );
  }

  openCreateSongModal(): void {
    this.showCreateSongModal = true;
    this.newSong = {
      songName: "",
      songDuration: 0,
      songLyrics: "",
      songExplicit: false,
      songGenre: "",
    } as CreateSongRequest;
  }

  closeCreateSongModal(): void {
    this.showCreateSongModal = false;
  }

  createSong(): void {
    if (!this.album) return;

    if (!this.album || isNaN(this.album.albumID)) {
      Swal.fire({
        title: "Error",
        text: "Invalid album ID",
        icon: "error",
        background: "#212529",
        color: "#fff",
      });
      return;
    }

    console.log("Sending song data:", JSON.stringify(this.newSong));

    this.albumService.createSong(this.album.albumID, this.newSong).subscribe(
      (response) => {
        console.log("Success response:", response);
        this.loadSongs(this.album!.albumID);
        this.closeCreateSongModal();
        Swal.fire({
          title: "Success",
          text: "Song created successfully",
          icon: "success",
          background: "#212529",
          color: "#fff",
          iconColor: "#28a745",
          confirmButtonText: "OK",
        });
      },
      (error: HttpErrorResponse) => {
        console.error("Error creating song:", error);
        console.error("Error details:", error.error);
        console.error("Status:", error.status);
        console.error("Message:", error.message);

        const errorMsg = error.error?.detail || "Failed to create song";

        Swal.fire({
          title: "Error",
          text: errorMsg,
          icon: "error",
          background: "#212529",
          color: "#fff",
          iconColor: "#dc3545",
          confirmButtonText: "OK",
        });
      },
    );
  }

  openEditSongModal(song: Song): void {
    this.showEditSongModal = true;
    this.editingSong = { ...song };
  }

  closeEditSongModal(): void {
    this.showEditSongModal = false;
  }

  confirmEditSong(): void {
    if (!this.album) return;

    this.albumService
      .updateSong(this.editingSong.songID, this.editingSong)
      .subscribe(
        (response) => {
          this.loadSongs(this.album!.albumID);
          this.closeEditSongModal();
          Swal.fire({
            title: "Success",
            text: "Song updated successfully",
            icon: "success",
            background: "#212529",
            color: "#fff",
            iconColor: "#28a745",
            confirmButtonText: "OK",
          });
        },
        (error: HttpErrorResponse) => {
          console.error("Error updating song:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to update song",
            icon: "error",
            background: "#212529",
            color: "#fff",
            iconColor: "#dc3545",
            confirmButtonText: "OK",
          });
        },
      );
  }

  openDeleteSongModal(songId: number): void {
    this.showDeleteSongModal = true;
    this.deletingSongId = songId;
  }

  closeDeleteSongModal(): void {
    this.showDeleteSongModal = false;
    this.deletingSongId = null;
  }

  confirmDeleteSong(): void {
    if (!this.album || !this.deletingSongId) return;

    this.albumService
      .deleteSong(this.album.albumID, this.deletingSongId)
      .subscribe(
        () => {
          this.loadSongs(this.album!.albumID);
          this.closeDeleteSongModal();
          Swal.fire({
            title: "Success",
            text: "Song deleted successfully",
            icon: "success",
            background: "#212529",
            color: "#fff",
            iconColor: "#28a745",
            confirmButtonText: "OK",
          });
        },
        (error: HttpErrorResponse) => {
          console.error("Error deleting song:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to delete song",
            icon: "error",
            background: "#212529",
            color: "#fff",
            iconColor: "#dc3545",
            confirmButtonText: "OK",
          });
        },
      );
  }
}
