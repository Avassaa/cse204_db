import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class LoginComponent {
  loginData = {
    username: "",
    password: "",
  };
  errorMessage = "";

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(["/home"]);
    }
  }
  onSubmit() {
    this.errorMessage = "";
    this.auth
      .login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: () => {
          this.router.navigate(["/home"]);
        },
        error: (err) => {
          this.errorMessage = err.error?.detail || "Login failed.";
        },
      });
  }
}
