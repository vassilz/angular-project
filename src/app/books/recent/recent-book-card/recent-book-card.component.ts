import { Component, Input } from '@angular/core';
import { Book } from '../../../types/book';
import { ElapsedTimePipe } from '../../../shared/pipes/elapsed-time.pipe';

@Component({
  selector: 'app-recent-book-card',
  standalone: true,
  imports: [ElapsedTimePipe],
  templateUrl: './recent-book-card.component.html',
  styleUrl: './recent-book-card.component.css',
})
export class RecentBookCardComponent {
  @Input()
  book: Book = {} as Book;
}
