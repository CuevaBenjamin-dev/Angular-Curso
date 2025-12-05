import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const accessToken = this.authService.getAccessToken();

    let authReq = req;
    if (accessToken) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {

        // Si expira → pedir nuevo token
        if (err.status === 401) {

          return this.authService.refreshToken().pipe(
            switchMap(() => {

              const newToken = this.authService.getAccessToken();

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });

              return next.handle(retryReq);
            })
          );
        }

        return throwError(() => err);
      })
    );
  }
}
