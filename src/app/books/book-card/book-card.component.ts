import { Component, Input, OnInit } from '@angular/core';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { Review } from '../../types/review';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { AverageRatingPipe } from '../../reviews/average-rating.pipe';

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

  constructor(
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService
  ) {}

  ngOnInit(): void {
    this.reviewService.getReviews(this.book.id).subscribe((data) => {
      this.reviews = data.val() || [];
    });
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }
}
