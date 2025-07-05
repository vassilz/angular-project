import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation-menu.component.html',
  styleUrl: './navigation-menu.component.css',
})
export class NavigationMenuComponent {
  constructor(private authenticationService: AuthenticationService) {}

  get isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }
}
