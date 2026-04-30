import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const auth = storage.read();
  const isAuthEndpoint = req.url.includes('/Auth/login');

  const cloned = auth?.token && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } })
    : req;

  return next(cloned).pipe(
    catchError((err) => {
      if (err.status === 401 && !isAuthEndpoint) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
