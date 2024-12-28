import { Component, Input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css',
})
export class AddReviewComponent {
  @Input()
  bookId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService
  ) {}

  addReview(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.reviewService.getReviews(this.bookId).subscribe((data) => {
      let reviewCount = data.val()?.length || 0;

      // console.log(form.value);

      const { rating, text } = form.value;

      this.reviewService
        .createReview(
          this.bookId,
          reviewCount,
          this.authenticationService.user!.uid,
          rating,
          text
        )
        .subscribe(() => {
          // this.router.navigate(['/books']);
        });
    });
  }
}
