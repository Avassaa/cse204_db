import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ArtistService } from "../artist.service";
import { AlbumService } from "../album.service";
import { Album } from "../models/album.model";
import { Artist } from "../models/artist.model";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import Swal from "sweetalert2";

@Component({
  selector: "app-specific-artist",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./specific-artist.component.html",
  styleUrls: ["./specific-artist.component.scss"],
})
export class SpecificArtistComponent implements OnInit {
  artist: Artist | null = null;
  isLoading = true;
  showCreateAlbumModal = false;
  showEditAlbumModal = false;
  showDeleteAlbumModal = false;
  newAlbum: any = {};
  editingAlbum: any = {};
  deletingAlbumId: number | null = null;
  albums: Album[] = [];
  imageFallbackApplied = false;
  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
    private albumService: AlbumService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const artistId = +params["id"];
      this.loadArtist(artistId);
    });
  }

  getArtistAlbums(artistId: number): void {
    this.albumService.getAllAlbums(artistId).subscribe(
      (albums: Album[]) => {
        this.albums = albums;
        console.log("Albums:", albums);
      },
      (error: HttpErrorResponse) => {
        console.error("Error loading albums:", error);
      },
    );
  }

  openCreateAlbumModal(): void {
    this.showCreateAlbumModal = true;
    this.newAlbum = {
      albumName: "",
      albumReleaseDate: "",
      albumDescription: "",
    };
  }
  handleImageError(event: any): void {
    event.target.onerror = null;
    event.target.src = "assets/default-artist.jpg";
  }
  closeCreateAlbumModal(): void {
    this.showCreateAlbumModal = false;
  }

  createAlbum(): void {
    if (!this.artist) return;

    this.albumService
      .createAlbum(this.artist.artistID, this.newAlbum)
      .subscribe(
        (response) => {
          this.getArtistAlbums(this.artist!.artistID);
          this.closeCreateAlbumModal();
          Swal.fire({
            title: "Success",
            text: "Album created successfully",
            icon: "success",
            background: "#212529",
            color: "#fff",
            iconColor: "#28a745",
            confirmButtonText: "OK",
          });
        },
        (error: HttpErrorResponse) => {
          console.error("Error creating album:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to create album",
            icon: "error",
            background: "#212529",
            color: "#fff",
            iconColor: "#dc3545",
            confirmButtonText: "OK",
          });
        },
      );
  }

  // Edit Album Methods
  openEditAlbumModal(album: Album): void {
    this.showEditAlbumModal = true;
    this.editingAlbum = { ...album };
  }

  closeEditAlbumModal(): void {
    this.showEditAlbumModal = false;
  }

  confirmEditAlbum(): void {
    if (!this.artist) return;

    this.albumService
      .updateAlbum(
        this.artist.artistID,
        this.editingAlbum.albumID,
        this.editingAlbum,
      )
      .subscribe(
        (response) => {
          this.getArtistAlbums(this.artist!.artistID);
          this.closeEditAlbumModal();
          Swal.fire({
            title: "Success",
            text: "Album updated successfully",
            icon: "success",
            background: "#212529",
            color: "#fff",
            iconColor: "#28a745",
            confirmButtonText: "OK",
          });
        },
        (error: HttpErrorResponse) => {
          console.error("Error updating album:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to update album",
            icon: "error",
            background: "#212529",
            color: "#fff",
            iconColor: "#dc3545",
            confirmButtonText: "OK",
          });
        },
      );
  }

  openDeleteAlbumModal(albumId: number): void {
    this.showDeleteAlbumModal = true;
    this.deletingAlbumId = albumId;
  }

  closeDeleteAlbumModal(): void {
    this.showDeleteAlbumModal = false;
    this.deletingAlbumId = null;
  }

  confirmDeleteAlbum(): void {
    if (!this.artist || !this.deletingAlbumId) return;

    this.albumService
      .deleteAlbum(this.artist.artistID, this.deletingAlbumId)
      .subscribe(
        () => {
          this.getArtistAlbums(this.artist!.artistID);
          this.closeDeleteAlbumModal();
          Swal.fire({
            title: "Success",
            text: "Album deleted successfully",
            icon: "success",
            background: "#212529",
            color: "#fff",
            iconColor: "#28a745",
            confirmButtonText: "OK",
          });
        },
        (error: HttpErrorResponse) => {
          console.error("Error deleting album:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to delete album",
            icon: "error",
            background: "#212529",
            color: "#fff",
            iconColor: "#dc3545",
            confirmButtonText: "OK",
          });
        },
      );
  }

  loadArtist(artistId: number): void {
    this.isLoading = true;
    this.artistService.getArtistById(artistId).subscribe({
      next: (artist) => {
        this.artist = artist;
        this.isLoading = false;
        // Load the artist's albums once we have the artist
        this.getArtistAlbums(artistId);
      },
      error: (error) => {
        console.error("Error loading artist:", error);
        this.isLoading = false;
        Swal.fire({
          title: "Error",
          text: "Could not load artist details",
          icon: "error",
          background: "#212529",
          color: "#fff",
          iconColor: "#dc3545",
          confirmButtonText: "OK",
        });
      },
    });
  }
}
