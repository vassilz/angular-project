import { Book } from './book';
import { Review } from './review';
import { Settings } from './settings';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  uuid: string;
  password: string;
  favoriteBookIds: number[];
  settings: Settings;
  // reviews: Review[];
}
