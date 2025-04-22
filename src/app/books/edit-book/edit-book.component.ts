import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseBookService } from '../firebase-book.service';
import { Subscription } from 'rxjs';
import { Book } from '../../types/book';
import { JettyBookService } from '../jetty-book.service';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css',
})
export class EditBookComponent implements OnInit, OnDestroy {
  book: Book = {} as Book;
  getBooksSubscription: Subscription | null = null;
  updateBookSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    // private bookService: FirebaseBookService
    private bookService: JettyBookService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['bookId'];

    this.getBooksSubscription = this.bookService
      .getBook(id)
      .subscribe((book) => {
        this.book = book;
        this.book.id = id;
      });
  }

  editBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, author, publish_date, pages, synopsis } = form.value;

    this.updateBookSubscription = this.bookService
      .updateBook(this.book.id, name, author, publish_date, pages, synopsis)
      .subscribe(() => {
        this.router.navigate(['/books']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/books']);
  }

  ngOnDestroy(): void {
    this.getBooksSubscription!.unsubscribe();
    this.updateBookSubscription?.unsubscribe();
  }
}
