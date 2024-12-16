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

    this.bookService.getBooks().subscribe((data) => {
      let bookCount = data.val()?.length || 0;

      console.log(form.value);

      const { name, author, publish_date, pages, synopsis } = form.value;

      this.bookService
        .createBook(bookCount, name, author, publish_date, pages, synopsis)
        .subscribe(() => {
          this.router.navigate(['/books']);
        });
    });
  }

  onCancel(event: MouseEvent) {
    console.log('Cancel');
    this.router.navigate(['/books']);
  }
}
