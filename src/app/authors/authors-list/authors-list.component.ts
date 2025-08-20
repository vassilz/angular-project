import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { AuthenticationService } from '../../authentication.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { FirebaseAuthorService } from '../firebase-author.service';
import { Author } from '../../types/author';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HighlightSearchPipe } from '../../highlight-search.pipe';

@Component({
    selector: 'app-authors-list',
    imports: [LoaderComponent, RouterLink, FormsModule, HighlightSearchPipe],
    templateUrl: './authors-list.component.html',
    styleUrl: './authors-list.component.css'
})
export class AuthorsListComponent implements OnInit {
  isLoading = signal<boolean>(true);

  authors = signal<Author[]>([]);

  allAuthorsCount: number = 0;

  searchTerm: string = '';
  searchActive: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private authorService: FirebaseAuthorService,
    private changeDetectorRef: ChangeDetectorRef
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
      .pipe(take(1))
      .subscribe((authors) => {
        this.authors.set(authors || []);
        this.isLoading.set(false);
      });
  }

  keyUp(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.searchAuthors();
    }
  }

  searchAuthors() {
    console.log('Searching authors with term:', this.searchTerm);
    if (this.searchTerm == null || this.searchTerm === '') {
      return;
    }
    this.authorService
      .getSearchAuthorsCount(this.searchTerm)
      .pipe(take(1))
      .subscribe((count) => {
        this.allAuthorsCount = count;
      });

    this.authorService
      .searchAuthors(this.searchTerm)
      .pipe(take(1))
      .subscribe((foundAuthors) => {
        console.log('Found authors by search term ' + this.searchTerm + ':');
        console.log(foundAuthors);

        this.authors.set(foundAuthors || []);

        this.changeDetectorRef.detectChanges();

        this.searchActive = true;
      });
  }

  resetSearch() {
    this.searchTerm = '';
    this.searchActive = false;
    this.loadAuthors();
  }
}
