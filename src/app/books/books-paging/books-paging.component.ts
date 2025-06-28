import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-books-paging',
  standalone: true,
  imports: [],
  templateUrl: './books-paging.component.html',
  styleUrl: './books-paging.component.css',
})
export class BooksPagingComponent {
  start = model<number>(0);

  count = input<number>(-1);

  previousPage() {
    this.start.set(Math.max(0, this.start() - this.count()));
  }

  nextPage() {
    this.start.set(this.start() + this.count());
  }
}
