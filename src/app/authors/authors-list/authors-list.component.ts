import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { AuthenticationService } from '../../authentication.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseAuthorService } from '../firebase-author.service';
import { Author } from '../../types/author';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-authors-list',
  standalone: true,
  imports: [LoaderComponent, RouterLink, JsonPipe],
  templateUrl: './authors-list.component.html',
  styleUrl: './authors-list.component.css',
})
export class AuthorsListComponent implements OnInit {
  isLoading = signal<boolean>(true);

  authors = signal<Author[]>([]);

  constructor(
    private authenticationService: AuthenticationService,
    private authorService: FirebaseAuthorService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadAuthors();
  }

  get isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }

  loadAuthors() {
    this.isLoading.set(true);

    this.authorService
      .getAuthors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authors) => {
        this.authors.set(authors || []);
        this.isLoading.set(false);
      });
  }
}
