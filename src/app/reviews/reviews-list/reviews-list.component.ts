import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [ReviewCardComponent, LoaderComponent],
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
})
export class ReviewsListComponent implements OnInit {
  isLoading = signal<boolean>(true);

  bookId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private reviewService: FirebaseReviewService,
    private rerenderService: RerenderService,
    private changeDetection: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {
    this.bookId = this.route.snapshot.params['bookId'];
    this.loadReviews(this.bookId);
  }

  reviews: WritableSignal<Review[]> = signal<Review[]>([]);

  ngOnInit(): void {
    this.rerenderService.rerenderReviews
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log(`Rerendering reviews list for book ${this.bookId}...`);
        this.loadReviews(this.bookId);

        this.changeDetection.detectChanges();
      });
  }

  loadReviews(bookId: number): void {
    this.reviewService
      .getReviews(bookId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reviews) => {
        console.log(`Reviews for book ${bookId}:`, reviews);
        this.reviews.set(reviews);
        // this.reviews.forEach((review, index) => {
        //   review.id = index;
        // });

        this.isLoading.set(false);
      });
  }
}
