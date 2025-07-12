import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { map } from 'rxjs';
import { ToastService } from './toast/toast.service';

export const UnauthenticatedGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  const toastService: ToastService = inject(ToastService);
  const router: Router = inject(Router);

  return authenticationService.user$.pipe(
    map((user) => {
      if (user) {
        router.navigate(['/home']);
        toastService.add(`You are already logged in!`);
        return false;
      } else {
        return true;
      }
    })
  );
};
