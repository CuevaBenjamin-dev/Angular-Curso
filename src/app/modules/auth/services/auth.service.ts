import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  // Guardamos el token en memoria
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Lo obtenemos desde memoria
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Para logout
  clearAccessToken() {
    this.accessToken = null;
  }

  // LOGIN (access token viene del backend por JSON)
  login(email: string, password: string) {
    return this.http
      .post<any>(
        `${environment.api}/auth/login`,
        { email, password },
        { withCredentials: true } // <-- permite recibir la cookie HttpOnly
      )
      .pipe(
        tap((resp) => {
          // Guardamos el access token en memoria
          this.setAccessToken(resp.token);
        })
      );
  }

  // Llamado cuando el access token expira
  refreshToken() {
    return this.http
      .post<any>(
        `${environment.api}/auth/refresh-token`,
        {},
        { withCredentials: true } // <-- aquí viaja la cookie HttpOnly
      )
      .pipe(
        tap((resp) => {
          this.setAccessToken(resp.token);
        })
      );
  }

  logout() {
    this.clearAccessToken();
    return this.http.post(
      `${environment.api}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }
}
