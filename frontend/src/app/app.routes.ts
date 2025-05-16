import { Routes } from "@angular/router";
import { ShowAlbumComponent } from "./show-album/show-album.component";
import { ShowArtistsComponent } from "./show-artists/show-artists.component";
import { SpecificArtistComponent } from "./specific-artist/specific-artist.component";
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";
import { PlaylistsComponent } from "./playlists/playlists.component";
import { AuthGuard } from "./auth.guard";
import { HomeComponent } from "./home/home.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "artists",
    component: ShowArtistsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "artist/:id",
    component: SpecificArtistComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "album/:id",
    component: ShowAlbumComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "song/:id",
    component: ShowAlbumComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "playlists",
    component: PlaylistsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "playlists/:id",
    loadComponent: () =>
      import("./playlist-detail/playlist-detail.component").then(
        (m) => m.PlaylistDetailComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard],
  },

  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "**", redirectTo: "/home" },
];
