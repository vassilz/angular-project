import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseReviewService } from '../firebase-review.service';
import { Review } from '../../types/review';
import { ActivatedRoute } from '@angular/router';
import { ReviewCardComponent } from '../review-card/review-card.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { RerenderService } from '../../rerender.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [ReviewCardComponent, LoaderComponent],
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
})
export class ReviewsListComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;

  rerenderSubscription: Subscription | null = null;
  getReviewsSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private reviewService: FirebaseReviewService,
    private rerenderService: RerenderService,
    private changeDetection: ChangeDetectorRef
  ) {}

  reviews: WritableSignal<Review[]> = signal<Review[]>([]);

  ngOnInit(): void {
    const bookId = this.route.snapshot.params['bookId'];
    this.loadReviews(bookId);

    this.rerenderSubscription = this.rerenderService.rerenderReviews.subscribe(
      () => {
        this.loadReviews(bookId);

        this.changeDetection.detectChanges();
      }
    );
  }

  loadReviews(bookId: number): void {
    this.getReviewsSubscription = this.reviewService
      .getReviews(bookId)
      .subscribe((data) => {
        this.reviews.set(data.val() || []);
        // this.reviews.forEach((review, index) => {
        //   review.id = index;
        // });

        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.rerenderSubscription?.unsubscribe();
    this.getReviewsSubscription?.unsubscribe();
  }
}
