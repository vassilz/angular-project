import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { ToastService } from './toast/toast.service';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs';

export const AdminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  const toastService: ToastService = inject(ToastService);
  const router: Router = inject(Router);

  const auth = inject(Auth);

  return authState(auth).pipe(
    map((user) => {
      if (user && user.email === 'admin@gmail.com') {
        return true;
      }

      router.navigate(['/home']);
      toastService.add(`You are not authorized to access this page!`);
      return false;
    })
  );
};
