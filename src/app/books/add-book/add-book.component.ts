import { Component, DestroyRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseBookService } from '../firebase-book.service';
import { Router } from '@angular/router';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { JettyBookService } from '../jetty-book.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css',
})
export class AddBookComponent {
  constructor(
    private bookService: FirebaseBookService,
    // private bookService: JettyBookService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService,
    private destroyRef: DestroyRef
  ) {}

  addBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, author, publish_date, pages, synopsis } = form.value;

    this.bookService
      .createBook(name, author, publish_date, pages, synopsis)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['/books']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/books']);
  }
}
