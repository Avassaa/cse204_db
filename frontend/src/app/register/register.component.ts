import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class RegisterComponent {
  registerData = {
    userName: "",
    userEmail: "",
    userPassword: "",
    userLocation: "",
  };
  errorMessage = "";
  successMessage = "";

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.errorMessage = "";
    this.successMessage = "";
    this.auth.register(this.registerData).subscribe({
      next: () => {
        this.successMessage = "Registration successful! You can now log in.";
        setTimeout(() => this.router.navigate(["/login"]), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || "Registration failed.";
      },
    });
  }
}
