import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Review } from '../../types/review';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { AuthenticationService } from '../../authentication.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { RerenderService } from '../../rerender.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-review.component.html',
  styleUrl: './edit-review.component.css',
})
export class EditReviewComponent implements OnInit, OnDestroy {
  isEditMode: boolean = false;

  getReviewsSubscription: Subscription | null = null;
  updateReviewSubscription: Subscription | null = null;
  deleteReviewSubscription: Subscription | null = null;

  @Input()
  bookId: number = 0;

  review: Review | null = null;
  rating: number | null = null;
  text: string | null = null;

  constructor(
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService,
    private errorHandlingService: ErrorHandlingService,
    private changeDetection: ChangeDetectorRef,
    private rerenderService: RerenderService
  ) {}

  ngOnInit(): void {
    this.getReviewsSubscription = this.reviewService
      .getReviewByBookAndUser(this.bookId, this.authenticationService.user!.uid)
      .subscribe((review) => {
        this.review = review;
        this.rating = review!.rating;
        this.text = review!.text;
      });
  }

  editReview(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { rating, text } = form.value;

    const now = new Date().toISOString();

    const errorHandlingService = this.errorHandlingService;

    this.updateReviewSubscription = this.reviewService
      .updateReview(
        this.bookId,
        this.review!.id,
        this.authenticationService.user!.uid,
        rating,
        text,
        now
      )
      .subscribe({
        next: (value) => {
          // router.navigate(['/books']);
          this.rating = rating;
          this.text = text;
          this.toggleEditMode();

          // this.changeDetection.detectChanges();

          this.rerenderService.rerenderReviews.emit();
        },
        // TODO handle errors with an interceptor
        error: (err) => {
          errorHandlingService.handleError(err);
        },
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.toggleEditMode();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  deleteReview() {
    const errorHandlingService = this.errorHandlingService;
    this.deleteReviewSubscription = this.reviewService
      .deleteReview(this.bookId, this.review!.id)
      .subscribe({
        next: (value) => {
          // router.navigate(['/books']);
          this.review = null;
          this.rating = null;
          this.text = null;
          // this.changeDetection.detectChanges();

          this.rerenderService.rerenderReviews.emit();
          // this.toggleEditMode();
        },
        // TODO handle errors with an interceptor
        error: (err) => {
          errorHandlingService.handleError(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.getReviewsSubscription?.unsubscribe();
    this.updateReviewSubscription?.unsubscribe();
    this.deleteReviewSubscription?.unsubscribe();
  }
}
