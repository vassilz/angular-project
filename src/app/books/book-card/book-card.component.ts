import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { Review } from '../../types/review';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { AverageRatingPipe } from '../../reviews/average-rating.pipe';
import { FirebaseUserService } from '../../users/firebase-user.service';
import { RerenderService } from '../../rerender.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink, AverageRatingPipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css',
})
export class BookCardComponent implements OnInit, OnDestroy {
  @Input()
  book: Book = {} as Book;

  @Input()
  searchTerm: string = '';

  @ViewChild('basicDetails') domElement!: ElementRef;

  reviews: Review[] = [];

  rerenderSubscription: Subscription | null = null;
  reviewSubscription: Subscription | null = null;
  favoriteSubscription: Subscription | null = null;
  addFavoriteSubscription: Subscription | null = null;
  removeFavoriteSubscription: Subscription | null = null;

  isFavorite: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private userService: FirebaseUserService,
    private changeDetectorRef: ChangeDetectorRef,
    private rerenderService: RerenderService
  ) {}

  ngOnInit(): void {
    console.log('Book card component initialized for book: ' + this.book.id);
    console.log(this.book);

    this.loadReviews();
    this.loadIsFavorite();

    this.rerenderSubscription = this.rerenderService.rerenderReviews.subscribe(
      () => {
        console.log(
          'Book card component re-initialized for book: ' + this.book.id
        );
        console.log(this.book);

        this.loadReviews();
        this.loadIsFavorite();
        this.changeDetectorRef.detectChanges();

        this.highlightSearchTerms();
      }
    );
  }

  // TODO: Reset highlighting when search term changes
  highlightSearchTerms() {
    var detailsDiv = this.domElement.nativeElement;
    var innerHTML = detailsDiv.innerHTML;
    var index = innerHTML.indexOf(this.searchTerm);
    if (index >= 0) {
      innerHTML =
        innerHTML.substring(0, index) +
        "<span style='background-color: orange' class='highlight'>" +
        innerHTML.substring(index, index + this.searchTerm.length) +
        '</span>' +
        innerHTML.substring(index + this.searchTerm.length);
      detailsDiv.innerHTML = innerHTML;
    }
  }

  get isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }

  loadReviews() {
    this.reviewSubscription?.unsubscribe();
    this.reviewSubscription = this.reviewService
      .getReviews(this.book.id)
      .subscribe((data) => {
        this.reviews = data.val() || [];
        // console.log(this.reviews);
      });
  }

  loadIsFavorite() {
    this.favoriteSubscription?.unsubscribe();
    this.favoriteSubscription = this.userService
      .getFavoriteBookIdsForUser(this.authenticationService.user?.uid || '')
      .subscribe((bookIds) => {
        const favoriteBookIds = bookIds || [];
        this.isFavorite = favoriteBookIds.includes(this.book.id);
        // console.log('Favorite book ids: ' + favoriteBookIds);
      });
  }

  toggleFavorite() {
    if (this.isFavorite) {
      this.removeFavoriteSubscription = this.userService
        .removeFavoriteBookForUser(
          this.authenticationService.user!.uid,
          this.book.id
        )
        .subscribe((data) => {
          console.info(`Book ${this.book.name} removed from favorites`);
          this.isFavorite = false;
        });
    } else {
      this.addFavoriteSubscription = this.userService
        .addFavoriteBookForUser(
          this.authenticationService.user!.uid,
          this.book.id
        )
        .subscribe((data) => {
          console.info(`Book ${this.book.name} added to favorites`);
          this.isFavorite = true;
        });
    }
  }

  ngOnDestroy(): void {
    console.log('Book card component destroyed for book: ' + this.book.id);

    this.rerenderSubscription?.unsubscribe();
    this.reviewSubscription?.unsubscribe();
    this.favoriteSubscription?.unsubscribe();
    this.addFavoriteSubscription?.unsubscribe();
    this.removeFavoriteSubscription?.unsubscribe();
  }
}
