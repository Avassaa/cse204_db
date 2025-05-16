import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../auth.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { PlaylistsService } from "../playlists.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchTerm = "";
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  // Search results
  searchResults: any[] = [];
  showSearchResults = false;

  @ViewChild("searchInput") searchInput: ElementRef | undefined;
  @ViewChild("searchResults") searchResultsElement: ElementRef | undefined;

  constructor(
    public auth: AuthService,
    private router: Router,
    private playlistsService: PlaylistsService,
  ) {}

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        if (searchTerm.trim()) {
          this.fetchSearchResults(searchTerm);
        } else {
          this.searchResults = [];
          this.showSearchResults = false;
        }
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // Close search results if clicking outside
  @HostListener("document:click", ["$event"])
  closeSearchResults(event: MouseEvent): void {
    if (
      !this.searchInput?.nativeElement.contains(event.target) &&
      !this.searchResultsElement?.nativeElement.contains(event.target)
    ) {
      this.showSearchResults = false;
    }
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
    this.showSearchResults = this.searchTerm.trim() !== "";
  }

  fetchSearchResults(term: string): void {
    this.playlistsService.getAllSongs(term).subscribe({
      next: (songs) => {
        this.searchResults = songs;
        this.showSearchResults = songs.length > 0;
      },
      error: (err) => {
        console.error("Error fetching search results:", err);
      },
    });
  }

  navigateToSong(song: any): void {
    this.searchTerm = "";
    this.showSearchResults = false;

    console.log("Navigate to song:", song);

    if (song && song.albumID) {
      this.router.navigate(["/album/", song.albumID]);
    } else {
      this.router.navigate(["/playlists"]);
    }
  }

  submitSearch(): void {
    if (this.searchTerm.trim()) {
      this.showSearchResults = false;
      this.router.navigate(["/search"], {
        queryParams: { q: this.searchTerm },
      });
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
