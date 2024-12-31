import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { Review } from '../../types/review';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { AverageRatingPipe } from '../../reviews/average-rating.pipe';
import { FirebaseUserService } from '../../users/firebase-user.service';
import { RerenderService } from '../../rerender.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink, AverageRatingPipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css',
})
export class BookCardComponent implements OnInit {
  @Input()
  book: Book = {} as Book;

  reviews: Review[] = [];

  isFavorite: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private userService: FirebaseUserService,
    private changeDetectorRef: ChangeDetectorRef,
    private rerenderService: RerenderService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.loadIsFavorite();

    this.rerenderService.rerenderReviews.subscribe(() => {
      this.loadReviews();
      this.loadIsFavorite();
      this.changeDetectorRef.detectChanges();
    });
  }

  get isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }

  loadReviews() {
    this.reviewService.getReviews(this.book.id).subscribe((data) => {
      this.reviews = data.val() || [];
    });
  }

  loadIsFavorite() {
    this.userService
      .getFavoriteBookIdsForUser(this.authenticationService.user?.uid || '')
      .subscribe((bookIds) => {
        const favoriteBookIds = bookIds || [];
        this.isFavorite = favoriteBookIds.includes(this.book.id);
        console.log('Favorite book ids: ' + favoriteBookIds);
      });
  }

  toggleFavorite() {
    if (this.isFavorite) {
      this.userService
        .removeFavoriteBookForUser(
          this.authenticationService.user!.uid,
          this.book.id
        )
        .subscribe((data) => {
          console.info(`Book ${this.book.name} removed from favorites`);
          this.isFavorite = false;
        });
    } else {
      this.userService
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
}
