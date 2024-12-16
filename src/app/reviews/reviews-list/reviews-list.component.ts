import { Component, OnInit } from '@angular/core';
import { FirebaseReviewService } from '../firebase-review.service';
import { Review } from '../../types/review';
import { ActivatedRoute } from '@angular/router';
import { ReviewCardComponent } from '../review-card/review-card.component';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [ReviewCardComponent],
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
})
export class ReviewsListComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private reviewService: FirebaseReviewService
  ) {}

  reviews: Review[] = [];

  ngOnInit(): void {
    const bookId = this.route.snapshot.params['bookId'];
    this.reviewService.getReviews(bookId).subscribe((data) => {
      console.log(data.val());
      this.reviews = data.val();
      // this.reviews.forEach((review, index) => {
      //   review.id = index;
      // });
    });
  }
}
