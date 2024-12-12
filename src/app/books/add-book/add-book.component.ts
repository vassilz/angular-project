import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseBookService } from '../firebase-book.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  addBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    let bookCount: number = 0;
    this.bookService
      .getBooks()
      .subscribe((data) => (bookCount = data.val().length));

    console.log(form.value);

    const { name, author, publish_date, pages } = form.value;

    this.bookService
      .createBook(bookCount, name, author, publish_date, pages)
      .subscribe(() => {
        this.router.navigate(['/books']);
      });
  }
}
