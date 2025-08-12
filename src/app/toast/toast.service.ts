import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: string[] = [];

  add(message: string) {
    this.toasts.push(message);
    setTimeout(() => this.remove(this.toasts.length - 1), 3000); // Remove after 3 seconds
  }

  remove(index: number) {
    this.toasts.splice(index, 1);
  }
}
