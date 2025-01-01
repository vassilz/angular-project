import { Component, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseBookService } from '../firebase-book.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorHandlingService } from '../../errors/error-handling.service';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css',
})
export class AddBookComponent implements OnDestroy {
  getBooksSubscription: Subscription | null = null;
  createBookSubscription: Subscription | null = null;

  constructor(
    private bookService: FirebaseBookService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService
  ) {}

  addBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.getBooksSubscription = this.bookService.getBooks().subscribe({
      next: (data) => {
        let bookCount = data.val()?.length || 0;

        const { name, author, publish_date, pages, synopsis } = form.value;

        this.createBookSubscription = this.bookService
          .createBook(bookCount, name, author, publish_date, pages, synopsis)
          .subscribe(() => {
            this.router.navigate(['/books']);
          });
      },
      // TODO handle errors with an interceptor
      error: (err) => {
        this.errorHandlingService.handleError(err);
      },
    });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/books']);
  }

  ngOnDestroy(): void {
    this.getBooksSubscription?.unsubscribe();
    this.createBookSubscription?.unsubscribe();
  }
}
