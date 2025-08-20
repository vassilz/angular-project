import { Component, input, OnInit, signal } from '@angular/core';
import { Book } from '../../../types/book';
import { ElapsedTimePipe } from '../../../shared/pipes/elapsed-time.pipe';
import { FirebaseAuthorService } from '../../../authors/firebase-author.service';
import { take } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-recent-book-card',
    imports: [ElapsedTimePipe, RouterLink],
    templateUrl: './recent-book-card.component.html',
    styleUrl: './recent-book-card.component.css'
})
export class RecentBookCardComponent implements OnInit {
  book = input.required<Book>();

  authorName = signal<string>('');

  constructor(private authorService: FirebaseAuthorService) {}

  ngOnInit(): void {
    this.loadAuthor();
  }

  loadAuthor() {
    this.authorService
      .getAuthor(this.book().authorId)
      .pipe(take(1))
      .subscribe((author) => {
        this.authorName.set(author?.name || $localize`Unknown Author`);
      });
  }
}
