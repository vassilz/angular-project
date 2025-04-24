import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseUserService } from '../firebase-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../types/user';
import { Book } from '../../types/book';
import { AuthenticationService } from '../../authentication.service';
import { Subscription } from 'rxjs';
import { JettyUserService } from '../jetty-user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  getUserSubscription: Subscription | null = null;
  favoritesSubscription: Subscription | null = null;
  updateUserSubscription: Subscription | null = null;

  constructor(
    // private userService: FirebaseUserService,
    private userService: JettyUserService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  user: User | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  pageSize: number = 5;

  favoriteBooks: Book[] = [];

  ngOnInit(): void {
    const uuid = this.authenticationService.user!.uid;

    this.getUserSubscription = this.userService
      .getUserById(uuid)
      .subscribe((user) => {
        this.user = user;
        this.firstName = user!.firstName;
        this.lastName = user!.lastName;
        this.pageSize = user!.settings.pageSize;
      });

    this.favoritesSubscription = this.userService
      .getFavoriteBooksForUser(uuid)
      .subscribe((book) => {
        this.favoriteBooks.push(book);
      });
  }

  editProfile(form: NgForm) {
    if (form.invalid) {
      console.warn('Invalid profile form!');
      return;
    }

    const { firstName, lastName, pageSize } = form.value;

    this.updateUserSubscription = this.userService
      .updateUser(
        this.user!.id,
        this.user!.username,
        this.user!.uuid,
        this.user!.email,
        firstName,
        lastName,
        this.user!.password,
        this.user!.favoriteBookIds,
        { pageSize }
      )
      .subscribe((data) => {
        console.info('User updated successfully');
        this.router.navigate(['/home']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.getUserSubscription!.unsubscribe();
    this.favoritesSubscription!.unsubscribe();
    this.updateUserSubscription?.unsubscribe();
  }
}
