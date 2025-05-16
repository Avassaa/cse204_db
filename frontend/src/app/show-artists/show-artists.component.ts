import { Component, OnInit } from "@angular/core";
import { ArtistService } from "../artist.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { UpdateArtistRequest } from "../models/artist.model";
import { Artist } from "../models/artist.model";
import { FormsModule, NgModel } from "@angular/forms";
import Swal from "sweetalert2";

@Component({
  selector: "app-show-artists",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./show-artists.component.html",
  styleUrl: "./show-artists.component.scss",
})
export class ShowArtistsComponent implements OnInit {
  artists: Artist[] = [];
  showCreateArtistModal = false;
  showDeleteArtistModal = false;
  selectedArtistId: number | null = null;
  isDeleting = false;
  showEditArtistModal = false;

  editingArtist: Artist | null = null;

  newArtist = {
    artistName: "",
    artistDescription: "",
    artistLocation: "",
    artistPicture: "",
  };

  resetForm() {
    this.newArtist = {
      artistName: "",
      artistDescription: "",
      artistLocation: "",
      artistPicture: "",
    };
  }

  constructor(private artistService: ArtistService) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.artistService.getAllArtists().subscribe(
      (artists: Artist[]) => {
        this.artists = artists;
        console.log(artists);
        Swal.fire({
          title: "Success",
          text: "Artists loaded successfully",
          icon: "success",
          background: "#212529",
          color: "#fff",
          iconColor: "#a5dc86",
          confirmButtonText: "OK",
        });
      },
      (error) => {
        Swal.fire({
          title: "Error",
          text: "Could not load artists.",
          icon: "error",
          confirmButtonText: "OK",
          background: "#212529",
          color: "#fff",
          iconColor: "#dc3545",
          confirmButtonColor: "#0d6efd",
        });
        console.error("Error fetching artists:", error);
      },
    );
  }
  openDeleteArtistModal(artistID: number): void {
    this.selectedArtistId = artistID;
    this.showDeleteArtistModal = true;
  }
  confirmDeletion() {
    this.isDeleting = true;
    this.removeArtist();
  }
  removeArtist(): void {
    if (this.selectedArtistId) {
      this.artistService.removeArtist(this.selectedArtistId).subscribe(
        () => {
          this.artists = this.artists.filter(
            (artist) => artist.artistID !== this.selectedArtistId,
          );
          Swal.fire({
            title: "Success",
            text: "Artist deleted successfully",
            icon: "success",
            background: "#212529",
            color: "#fff",
            iconColor: "#a5dc86",
            confirmButtonText: "OK",
          });
          this.selectedArtistId = null;
          this.showDeleteArtistModal = false;
          this.isDeleting = false;
        },
        (error) => {
          console.error("Error removing artist:", error);
          Swal.fire({
            title: "Error",
            text: "Could not delete artist",
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

  createArtist(): void {
    this.artistService.createArtist(this.newArtist).subscribe({
      next: (newArtist: Artist) => {
        this.loadArtists();
        console.log("Artist created successfully:", newArtist);
        Swal.fire({
          title: "Success",
          text: "Artist created successfully",
          icon: "success",
          background: "#212529",
          color: "#fff",
          iconColor: "#a5dc86",
          confirmButtonText: "OK",
        });
        this.showCreateArtistModal = false;
      },
      error: (error) => {
        Swal.fire({
          title: "Error",
          text: "Artist could not be created.",
          icon: "error",
          confirmButtonText: "OK",
          background: "#212529",
          color: "#fff",
          iconColor: "#dc3545",
          confirmButtonColor: "#0d6efd",
        });
        console.error("Error creating artist:", error);
      },
    });
  }

  openCreateArtistModal(): void {
    this.resetForm();

    this.showCreateArtistModal = true;
  }

  openEditArtistModal(artist: Artist): void {
    this.editingArtist = { ...artist };
    this.showEditArtistModal = true;
  }

  confirmEdit(): void {
    if (this.editingArtist && this.editingArtist.artistID) {
      const updateRequest: UpdateArtistRequest = {
        artistName: this.editingArtist.artistName.toString(),
        artistDescription: this.editingArtist.artistDescription.toString(),
        artistLocation: this.editingArtist.artistLocation.toString(),
        artistPicture: this.editingArtist.artistPicture.toString(),
      };

      this.artistService
        .updateArtist(this.editingArtist.artistID, updateRequest)
        .subscribe({
          next: (updatedArtist) => {
            this.artists = this.artists.map((artist) =>
              artist.artistID === updatedArtist.artistID
                ? updatedArtist
                : artist,
            );
            this.loadArtists();

            this.showEditArtistModal = false;
            this.editingArtist = null;

            Swal.fire({
              title: "Success",
              text: "Artist edited successfully",
              icon: "success",
              background: "#212529",
              color: "#fff",
              iconColor: "#a5dc86",
              confirmButtonText: "OK",
            });
            this.showEditArtistModal = false;
          },
          error: (error) => {
            console.error("Error updating artist:", error);
            Swal.fire({
              title: "Error",
              text: "Could not update artist",
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

  closeEditModal(): void {
    this.showEditArtistModal = false;
    this.editingArtist = null;
  }
}
