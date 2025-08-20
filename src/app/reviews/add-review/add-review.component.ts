import { Component, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { AuthenticationService } from '../../authentication.service';
import { RerenderService } from '../../rerender.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-add-review',
    imports: [FormsModule],
    templateUrl: './add-review.component.html',
    styleUrl: './add-review.component.css'
})
export class AddReviewComponent {
  bookId = input.required<number>();

  constructor(
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService,
    private rerenderService: RerenderService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  addReview(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const errorHandlingService = this.errorHandlingService;

    this.reviewService
      .getReviews(this.bookId())
      .pipe(take(1))
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
          .pipe(take(1))
          .subscribe({
            next: () => {
              // this.router.navigate(['/books']);
              this.rerenderService.rerenderReviews.emit();
            },
            error: (error) => {
              this.errorHandlingService.handleError(error);
            },
          });
      });
  }
}
