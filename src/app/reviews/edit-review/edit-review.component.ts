import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../../types/review';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { AuthenticationService } from '../../authentication.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';

@Component({
  selector: 'app-edit-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-review.component.html',
  styleUrl: './edit-review.component.css',
})
export class EditReviewComponent implements OnInit {
  isEditMode: boolean = false;

  @Input()
  bookId: number = 0;

  review: Review | null = null;
  rating: number | null = null;
  text: string | null = null;

  constructor(
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit(): void {
    this.reviewService
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

    this.reviewService
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
}
