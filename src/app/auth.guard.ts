import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  const router: Router = inject(Router);

  return authenticationService.user$.pipe(
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    })
  );
};
