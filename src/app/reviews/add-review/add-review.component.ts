import { Component, DestroyRef, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { RerenderService } from '../../rerender.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css',
})
export class AddReviewComponent {
  bookId = input.required<number>();

  constructor(
    private route: ActivatedRoute,
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService,
    private rerenderService: RerenderService,
    private destroyRef: DestroyRef
  ) {}

  addReview(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.reviewService
      .getReviews(this.bookId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reviews) => {
        let reviewCount = reviews.length;

        const { rating, text } = form.value;

        const now = new Date().toISOString();
        this.reviewService
          .createReview(
            this.bookId(),
            reviewCount,
            this.authenticationService.user!.uid,
            rating,
            text,
            now
          )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            // this.router.navigate(['/books']);
            this.rerenderService.rerenderReviews.emit();
          });
      });
  }
}
