import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:8000";

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth`, data);
  }

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set("grant_type", "password")
      .set("username", username)
      .set("password", password);

    return this.http
      .post<any>(`${this.apiUrl}/auth/token`, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .pipe(
        tap((res) => {
          if (res.access_token) {
            localStorage.setItem("access_token", res.access_token);
          }
        }),
      );
  }

  logout() {
    localStorage.removeItem("access_token");
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("access_token");
  }
}
