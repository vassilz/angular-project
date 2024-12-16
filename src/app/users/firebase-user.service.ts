import { Injectable } from '@angular/core';
import {
  Database,
  DataSnapshot,
  get,
  objectVal,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { from, Observable } from 'rxjs';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserService {
  constructor(private db: Database) {}

  register(
    userId: number,
    username: string,
    email: string,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    password: string
  ): Observable<void> {
    return from(
      set(ref(this.db, 'users/' + userId), {
        username,
        email,
        firstName,
        lastName,
        password,
      })
    );
  }

  getUsers(): Observable<DataSnapshot> {
    return from(get(ref(this.db, 'users')));
  }

  // createUser(userId: string, username: string, name: string): Observable<void> {
  //   return from(set(ref(this.db, 'users/' + userId), { username, name }));
  // }

  updateUser(userId: string, username: string, name: string): Observable<void> {
    return from(update(ref(this.db, 'users/' + userId), { username, name }));
  }

  deleteUser(userId: string): Observable<void> {
    return from(remove(ref(this.db, 'users/' + userId)));
  }

  doStuff() {
    const doc = ref(this.db, 'user');
    console.log(doc);
    objectVal(doc).subscribe((data: any) => console.log(data));
  }
}
