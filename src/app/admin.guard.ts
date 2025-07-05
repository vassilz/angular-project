import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';

export const AdminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  const router: Router = inject(Router);

  if (
    authenticationService.user &&
    authenticationService.user.email === 'admin@gmail.com'
  ) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
