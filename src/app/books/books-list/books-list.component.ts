import {
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { BookCardComponent } from '../book-card/book-card.component';
import { AuthenticationService } from '../../authentication.service';
import { combineLatest, map, Subject, take, TimeoutError } from 'rxjs';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { FormsModule } from '@angular/forms';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { UtilsService } from '../../shared/utils.service';

import moment from 'moment';
import { RerenderService } from '../../rerender.service';
import { RecentBooksListComponent } from '../recent/recent-books-list/recent-books-list.component';
import { FirebaseUserService } from '../../users/firebase-user.service';
import { JettyBookService } from '../jetty-book.service';
import { JettyUserService } from '../../users/jetty-user.service';
import { KeyValuePipe } from '@angular/common';
import { ErrorHandlingService } from '../../errors/error-handling.service';

@Component({
  selector: 'app-books-list',
  imports: [
    RouterLink,
    BookCardComponent,
    LoaderComponent,
    FormsModule,
    RecentBooksListComponent,
    KeyValuePipe,
  ],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
})
export class BooksListComponent implements OnInit {
  isLoading = signal<boolean>(true);

  sortBy: string = 'name';
  // sortByOptions: string[] = [
  //   'name',
  //   'author',
  //   'publishDate',
  //   'pages',
  //   'rating',
  // ];

  sortByOptions = new Map<string, string>();

  isDescending: boolean = false;

  SORT_BY_KEY: string = 'sortBy';
  IS_DESCENDING_KEY: string = 'isDescending';

  private comparatorFunctions: Map<string, (a: Book, b: Book) => number> =
    new Map([
      [
        'name',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.name.localeCompare(bookA.name, ['bg', 'en'])
            : bookA.name.localeCompare(bookB.name, ['bg', 'en']),
      ],
      // [
      //   'author',
      //   (bookA, bookB) =>
      //     this.isDescending
      //       ? bookB.authorId.localeCompare(bookA.authorId)
      //       : bookA.authorId.localeCompare(bookB.authorId),
      // ],
      [
        'author',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.authorId < bookA.authorId
              ? -1
              : 1
            : bookA.authorId < bookB.authorId
            ? -1
            : 1,
      ],
      [
        'publishDate',
        (bookA, bookB) =>
          this.isDescending
            ? this.compareDates(bookB.publishDate, bookA.publishDate)
            : this.compareDates(bookA.publishDate, bookB.publishDate),
      ],
      [
        'pages',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.pagesCount < bookA.pagesCount
              ? -1
              : 1
            : bookA.pagesCount < bookB.pagesCount
            ? -1
            : 1,
      ],
      [
        'rating',
        (bookA, bookB) =>
          this.isDescending
            ? this.compareRatings(bookB, bookA)
            : this.compareRatings(bookA, bookB),
      ],
    ]);

  constructor(
    // private bookService: JettyBookService,
    private bookService: FirebaseBookService,
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private utilsService: UtilsService,
    private changeDetectorRef: ChangeDetectorRef,
    private rerenderService: RerenderService,
    private userService: FirebaseUserService,
    private errorHandlingService: ErrorHandlingService // private userService: JettyUserService
  ) {
    this.sortByOptions.set('name', $localize`Name`);
    this.sortByOptions.set('author', $localize`Author`);
    this.sortByOptions.set('publishDate', $localize`Publish Date`);
    this.sortByOptions.set('pages', $localize`Pages`);
    this.sortByOptions.set('rating', $localize`Rating`);
  }

  books: WritableSignal<Book[]> = signal<Book[]>([]);

  allBooksCount: number = 0;

  pageStart: number = 0;
  pageSize: number = 5;
  // isLastPage: boolean = false;
  currentPage: number = 0;

  bookRatings: Map<number, number> = new Map();

  searchTerm: string = '';
  searchActive: boolean = false;

  recentBooksList = viewChild(RecentBooksListComponent);

  favoriteBookIds: WritableSignal<number[]> = signal<number[]>([]);

  ngOnInit(): void {
    const pageSizeLoaded = new Subject<void>();
    pageSizeLoaded.subscribe(() => {
      console.log('Page size loaded, proceeding to load books.');
      this.loadBooks();
    });

    this.authenticationService.user$.subscribe((firebaseUser) => {
      if (firebaseUser) {
        console.log('Loading page size for user: ' + firebaseUser.uid);

        this.userService
          .getUserById(firebaseUser.uid)
          .pipe(take(1))
          .subscribe({
            next: (user) => {
              if (user?.settings) {
                this.pageSize = user!.settings.pageSize;
                console.log('Page size loaded: ' + this.pageSize);
              } else {
                console.log(
                  'No settings found for user: ' +
                    firebaseUser.uid +
                    '. Loading default page size.'
                );
              }
              console.log('Page size: ' + this.pageSize);
              pageSizeLoaded.next();
            },
            error: (err) => {
              console.error('Error loading user settings:', err);
              if (err instanceof TimeoutError) {
                this.errorHandlingService.handleTimeout(err);
              }
              // else {
              //   this.errorHandlingService.handleError(err);
              // }
            },
          });

        this.userService
          .getFavoriteBookIdsForUser(firebaseUser.uid)
          .pipe(take(1))
          .subscribe((bookIds) => {
            this.favoriteBookIds.set(bookIds || []);
          });
      } else {
        console.log('Loading default page size');

        pageSizeLoaded.next();
      }
      // pageSizeLoaded.complete();
    });

    this.rerenderService.rerenderBooks.subscribe(() => {
      this.loadBooks();
    });
  }

  get isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }

  loadBooks() {
    this.isLoading.set(true);

    this.bookService
      .getBooksCount()
      .pipe(take(1))
      .subscribe({
        next: (count) => {
          this.allBooksCount = count;
        },
        error: (err) => {
          console.error('Error loading books count:', err);
          this.isLoading.set(false);
        },
      });

    this.restoreSorting();
    this.bookService
      .getBooks(
        this.pageStart,
        this.pageSize,
        this.comparatorFunctions.get(this.sortBy)
      )
      .pipe(take(1))
      .subscribe((books) => {
        this.books.set(books || []);
        // if (this.isDescending) {
        //   this.books().reverse();
        // }

        this.currentPage = this.books().length;

        // TODO - fix completion of forkJoin below
        // this.isLoading.set(false);

        const reviewObservables = this.books().map((book) =>
          this.reviewService.getReviews(book.id).pipe(
            map((reviews) => {
              const rating = this.utilsService.calculateAverageRating(reviews);
              this.bookRatings.set(book.id, rating);
            })
          )
        );

        console.log('Loading reviews for books:', this.books());
        combineLatest(reviewObservables)
          .pipe(take(1))
          .subscribe({
            complete: () => {
              console.log('All reviews have been processed.');

              this.isLoading.set(false);
              this.changeDetectorRef.detectChanges();
            },
          });
        // forkJoin(reviewObservables)
        //   .pipe(takeUntilDestroyed(this.destroyRef))
        //   .subscribe({
        //     next: () => {
        //       console.log('All reviews have been processed.');

        //       // Initial sort
        //       this.restoreSorting();
        //       this.sortBooks();

        //       this.isLoading.set(false);
        //     },
        //     complete: () => {
        //       console.log('ForkJoin completed for book reviews.');
        //       this.changeDetectorRef.detectChanges();
        //     },
        //   });
      });
  }

  restoreSorting() {
    if (localStorage.getItem(this.SORT_BY_KEY)) {
      this.sortBy = localStorage.getItem(this.SORT_BY_KEY)!;
    }

    if (localStorage.getItem(this.IS_DESCENDING_KEY)) {
      this.isDescending =
        localStorage.getItem(this.IS_DESCENDING_KEY) === 'true';
    }
  }

  sortBooks() {
    localStorage.setItem(this.SORT_BY_KEY, this.sortBy);
    localStorage.setItem(this.IS_DESCENDING_KEY, this.isDescending.toString());

    if (this.searchActive) {
      this.searchBooks();
    } else {
      this.loadBooks();
    }
    this.rerenderService.rerenderReviews.emit();
    // this.books.set(
    //   this.books().sort(this.comparatorFunctions.get(this.sortBy))
    // );
    // this.changeDetectorRef.detectChanges();
    // this.rerenderService.rerenderReviews.emit();
  }

  compareDates(dateA: string, dateB: string) {
    return moment(dateA).isBefore(dateB) ? -1 : 1;
  }

  compareRatings(bookA: Book, bookB: Book) {
    return this.bookRatings.get(bookA.id)! < this.bookRatings.get(bookB.id)!
      ? -1
      : 1;
  }

  keyUp(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.searchBooks();
    }
  }

  searchBooks() {
    console.log('Searching books with term:', this.searchTerm);
    if (this.searchTerm == null || this.searchTerm === '') {
      return;
    }
    this.bookService
      .getSearchBooksCount(this.searchTerm)
      .pipe(take(1))
      .subscribe((count) => {
        this.allBooksCount = count;
      });

    this.bookService
      .searchBooks(
        this.searchTerm,
        this.pageStart,
        this.pageSize,
        this.comparatorFunctions.get(this.sortBy)
      )
      .pipe(take(1))
      .subscribe((foundBooks) => {
        console.log('Found books by search term ' + this.searchTerm + ':');
        console.log(foundBooks);

        this.books.set(foundBooks || []);
        this.currentPage = this.books().length;

        // this.sortBooks();

        this.changeDetectorRef.detectChanges();
        // this.rerenderService.rerenderReviews.emit();

        this.searchActive = true;
      });
  }

  resetSearch() {
    this.searchTerm = '';
    this.searchActive = false;
    this.loadBooks();
  }

  previousPage() {
    if (this.pageStart === 0) {
      return;
    }
    this.pageStart = Math.max(0, this.pageStart - this.pageSize);
    if (this.searchActive) {
      this.searchBooks();
    } else {
      this.loadBooks();
    }
  }

  nextPage() {
    if (this.pageStart + this.currentPage >= this.allBooksCount) {
      return;
    }
    this.pageStart += this.pageSize;
    if (this.searchActive) {
      this.searchBooks();
    } else {
      this.loadBooks();
    }
  }
}
