import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const userSession = localStorage.getItem('currentUser');

  if (userSession) {
    return true;
  } else {
    console.warn('Unauthorized access blocked. Redirecting to Login...');
    router.navigate(['/login']);
    return false;
  }
};