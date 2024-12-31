import { Book } from './book';
import { Review } from './review';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  uuid: string;
  password: string;
  favoriteBookIds: number[];
  // reviews: Review[];
}
