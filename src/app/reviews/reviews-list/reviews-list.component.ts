import { Component, OnInit } from '@angular/core';
import { FirebaseReviewService } from '../firebase-review.service';
import { Review } from '../../types/review';
import { ActivatedRoute } from '@angular/router';
import { ReviewCardComponent } from '../review-card/review-card.component';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [ReviewCardComponent, LoaderComponent],
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
})
export class ReviewsListComponent implements OnInit {
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private reviewService: FirebaseReviewService
  ) {}

  reviews: Review[] = [];

  ngOnInit(): void {
    const bookId = this.route.snapshot.params['bookId'];
    this.reviewService.getReviews(bookId).subscribe((data) => {
      this.reviews = data.val();
      // this.reviews.forEach((review, index) => {
      //   review.id = index;
      // });

      this.isLoading = false;
    });
  }
}
