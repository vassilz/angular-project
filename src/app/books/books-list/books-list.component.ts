import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { BookCardComponent } from '../book-card/book-card.component';
import { AuthenticationService } from '../../authentication.service';
import { forkJoin, map, Subscription } from 'rxjs';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { FormsModule } from '@angular/forms';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { UtilsService } from '../../shared/utils.service';

import moment from 'moment';
import { RerenderService } from '../../rerender.service';
import { JsonPipe } from '@angular/common';
import { RecentBooksListComponent } from '../recent/recent-books-list/recent-books-list.component';
import { BooksPagingComponent } from '../books-paging/books-paging.component';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [
    RouterLink,
    BookCardComponent,
    LoaderComponent,
    FormsModule,
    JsonPipe,
    RecentBooksListComponent,
    BooksPagingComponent,
  ],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
})
export class BooksListComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  searchSubscription: Subscription | null = null;

  isLoading: boolean = true;

  sortBy: string = 'name';
  sortByOptions: string[] = [
    'name',
    'author',
    'publishDate',
    'pages',
    'rating',
  ];

  isDescending: boolean = false;

  SORT_BY_KEY: string = 'sortBy';
  IS_DESCENDING_KEY: string = 'isDescending';

  private comparatorFunctions: Map<string, (a: Book, b: Book) => number> =
    new Map([
      [
        'name',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.name.localeCompare(bookA.name)
            : bookA.name.localeCompare(bookB.name),
      ],
      [
        'author',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.author.localeCompare(bookA.author)
            : bookA.author.localeCompare(bookB.author),
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
    private bookService: FirebaseBookService,
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private utilsService: UtilsService,
    private changeDetectorRef: ChangeDetectorRef,
    private rerenderService: RerenderService
  ) {}

  books: WritableSignal<Book[]> = signal<Book[]>([]);

  pageStart: number = 0;
  pageSize: number = 5;
  // isLastPage: boolean = false;
  currentPage: number = 0;

  bookRatings: Map<number, number> = new Map();

  searchTerm: string = '';
  searchActive: boolean = false;

  ngOnInit(): void {
    this.loadBooks();
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }

  loadBooks() {
    this.isLoading = true;

    this.subscription = this.bookService
      .getBooks(this.pageStart, this.pageSize)
      .subscribe((books) => {
        this.books.set(books || []);
        this.currentPage = this.books().length;

        const reviewObservables = this.books().map((book) =>
          this.reviewService.getReviews(book.id).pipe(
            map((data) => {
              const reviews = data.val() || [];
              const rating = this.utilsService.calculateAverageRating(reviews);
              this.bookRatings.set(book.id, rating);
            })
          )
        );

        forkJoin(reviewObservables).subscribe(() => {
          console.log('All reviews have been processed.');

          // Initial sort
          this.restoreSorting();
          this.sortBooks();

          this.isLoading = false;
        });
      });
  }

  restoreSorting() {
    if (!!localStorage.getItem(this.SORT_BY_KEY)) {
      this.sortBy = localStorage.getItem(this.SORT_BY_KEY)!;
    }

    if (!!localStorage.getItem(this.IS_DESCENDING_KEY)) {
      this.isDescending =
        localStorage.getItem(this.IS_DESCENDING_KEY) === 'true';
    }
  }

  sortBooks() {
    localStorage.setItem(this.SORT_BY_KEY, this.sortBy);
    localStorage.setItem(this.IS_DESCENDING_KEY, this.isDescending.toString());

    this.books.set(
      this.books().sort(this.comparatorFunctions.get(this.sortBy))
    );
    this.changeDetectorRef.detectChanges();
    this.rerenderService.rerenderReviews.emit();
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
    this.searchSubscription = this.bookService
      .searchBooks(this.searchTerm)
      .subscribe((foundBooks) => {
        console.log('Found books by search term ' + this.searchTerm + ':');
        console.log(foundBooks);

        this.books.set(foundBooks || []);

        this.sortBooks();

        this.changeDetectorRef.detectChanges();
        this.rerenderService.rerenderReviews.emit();

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
    this.loadBooks();
  }

  nextPage() {
    if (this.currentPage < this.pageSize) {
      return;
    }
    this.pageStart += this.pageSize;
    this.loadBooks();
  }

  ngOnDestroy(): void {
    this.subscription!.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }
}
