import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { RerenderService } from '../../rerender.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css',
})
export class AddReviewComponent implements OnDestroy {
  @Input()
  bookId: number = 0;

  getReviewsSubscription: Subscription | null = null;
  createReviewSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService,
    private rerenderService: RerenderService
  ) {}

  addReview(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.getReviewsSubscription = this.reviewService
      .getReviews(this.bookId)
      .subscribe((data) => {
        let reviewCount = data.val()?.length || 0;

        const { rating, text } = form.value;

        const now = new Date().toISOString();
        this.createReviewSubscription = this.reviewService
          .createReview(
            this.bookId,
            reviewCount,
            this.authenticationService.user!.uid,
            rating,
            text,
            now
          )
          .subscribe(() => {
            // this.router.navigate(['/books']);
            this.rerenderService.rerenderReviews.emit();
          });
      });
  }

  ngOnDestroy(): void {
    this.getReviewsSubscription?.unsubscribe();
    this.createReviewSubscription?.unsubscribe();
  }
}
