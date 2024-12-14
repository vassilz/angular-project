import { Component, Input, OnInit } from '@angular/core';
import { Book } from '../../types/book';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FirebaseBookService } from '../firebase-book.service';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css',
})
export class BookDetailsComponent implements OnInit {
  book: Book = {} as Book;

  constructor(
    private route: ActivatedRoute,
    private bookService: FirebaseBookService
  ) {}
  ngOnInit(): void {
    const id = this.route.snapshot.params['bookId'];

    this.bookService.getBook(id).subscribe((data) => {
      console.log(data.val());
      this.book = data.val();
    });
  }
}
