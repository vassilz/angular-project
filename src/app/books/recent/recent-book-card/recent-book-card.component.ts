import { Component, DestroyRef, input, OnInit, signal } from '@angular/core';
import { Book } from '../../../types/book';
import { ElapsedTimePipe } from '../../../shared/pipes/elapsed-time.pipe';
import { FirebaseAuthorService } from '../../../authors/firebase-author.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-recent-book-card',
  standalone: true,
  imports: [ElapsedTimePipe],
  templateUrl: './recent-book-card.component.html',
  styleUrl: './recent-book-card.component.css',
})
export class RecentBookCardComponent implements OnInit {
  book = input.required<Book>();

  authorName = signal<string>('');

  constructor(
    private authorService: FirebaseAuthorService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadAuthor();
  }

  loadAuthor() {
    this.authorService
      .getAuthor(this.book().authorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((author) => {
        this.authorName.set(author?.name || 'Unknown Author');
      });
  }
}
