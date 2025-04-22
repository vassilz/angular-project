import { Component, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseBookService } from '../firebase-book.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { JettyBookService } from '../jetty-book.service';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css',
})
export class AddBookComponent implements OnDestroy {
  createBookSubscription: Subscription | null = null;

  constructor(
    // private bookService: FirebaseBookService,
    private bookService: JettyBookService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService
  ) {}

  addBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, author, publish_date, pages, synopsis } = form.value;

    this.createBookSubscription = this.bookService
      .createBook(name, author, publish_date, pages, synopsis)
      .subscribe(() => {
        this.router.navigate(['/books']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/books']);
  }

  ngOnDestroy(): void {
    this.createBookSubscription?.unsubscribe();
  }
}
