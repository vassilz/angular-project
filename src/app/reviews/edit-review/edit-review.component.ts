import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../../types/review';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseReviewService } from '../firebase-review.service';
import { AuthenticationService } from '../../authentication.service';
import { FirebaseUserService } from '../../users/firebase-user.service';

@Component({
  selector: 'app-edit-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-review.component.html',
  styleUrl: './edit-review.component.css',
})
export class EditReviewComponent implements OnInit {
  @Input()
  bookId: number = 0;

  review: Review | null = null;

  constructor(
    private reviewService: FirebaseReviewService,
    private userService: FirebaseUserService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    console.log('Edit review');

    this.reviewService
      .getReviewByBookAndUser(this.bookId, this.authenticationService.user!.uid)
      .subscribe((review) => {
        this.review = review;
      });
  }

  editReview(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { rating, text } = form.value;

    this.reviewService
      .updateReview(this.bookId, this.review!.id, '', rating, text)
      .subscribe(() => {
        // this.router.navigate(['/books']);
      });
  }
}
