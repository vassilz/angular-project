import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Review } from '../../types/review';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { AuthenticationService } from '../../authentication.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { RerenderService } from '../../rerender.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-edit-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-review.component.html',
  styleUrl: './edit-review.component.css',
})
export class EditReviewComponent implements OnInit {
  isEditMode = signal<boolean>(false);

  bookId = input.required<number>();

  review: Review | null = null;
  rating: number | null = null;
  text: string | null = null;

  constructor(
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService,
    private errorHandlingService: ErrorHandlingService,
    private changeDetection: ChangeDetectorRef,
    private rerenderService: RerenderService,
    private destroyRef: DestroyRef
  ) {}
  ngOnInit(): void {
    this.reviewService
      .getReviewByBookAndUser(
        this.bookId(),
        this.authenticationService.user!.uid
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
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

    this.reviewService
      .updateReview(
        this.bookId(),
        this.review!.id,
        this.authenticationService.user!.uid,
        rating,
        text,
        now,
        this.review!.likedBy
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          // router.navigate(['/books']);
          this.rating = rating;
          this.text = text;
          this.toggleEditMode();

          // this.changeDetection.detectChanges();

          this.rerenderService.rerenderReviews.emit();
        },
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
    this.isEditMode.set(!this.isEditMode());
  }

  deleteReview() {
    const errorHandlingService = this.errorHandlingService;
    this.reviewService
      .deleteReview(this.bookId(), this.review!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
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
        error: (err) => {
          errorHandlingService.handleError(err);
        },
      });
  }
}
