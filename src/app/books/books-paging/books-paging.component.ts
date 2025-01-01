import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-books-paging',
  standalone: true,
  imports: [],
  templateUrl: './books-paging.component.html',
  styleUrl: './books-paging.component.css',
})
export class BooksPagingComponent {
  @Input()
  start: number = 0;

  @Input()
  count: number = -1;

  previousPage() {
    this.start = Math.max(0, this.start - this.count);
  }

  nextPage() {
    this.start += this.count;
  }
}
