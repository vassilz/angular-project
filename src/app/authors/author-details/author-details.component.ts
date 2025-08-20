import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Author } from '../../types/author';
import { DatePipe } from '@angular/common';
import { Book } from '../../types/book';
import { FirebaseBookService } from '../../books/firebase-book.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { take } from 'rxjs';

@Component({
    selector: 'app-author-details',
    imports: [DatePipe, RouterLink, LoaderComponent],
    templateUrl: './author-details.component.html',
    styleUrl: './author-details.component.css'
})
export class AuthorDetailsComponent implements OnInit {
  authorId: number;
  author = signal<Author | null>(null);

  isLoading = signal<boolean>(true);

  books = signal<Book[]>([]);

  constructor(
    private route: ActivatedRoute,
    private bookService: FirebaseBookService
  ) {
    this.authorId = parseInt(this.route.snapshot.params['authorId']);
    this.author.set(this.route.snapshot.data['author'] as Author);
  }

  ngOnInit(): void {
    this.bookService
      .getBooksByAuthor(this.authorId)
      .pipe(take(1))
      .subscribe((books) => {
        this.books.set(books);
        this.isLoading.set(false);
      });
  }
}
