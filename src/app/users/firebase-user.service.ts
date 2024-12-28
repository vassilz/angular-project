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
import { from, Observable, Subject } from 'rxjs';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserService {
  constructor(private db: Database) {}

  createUser(
    userId: number,
    uuid: string,
    username: string,
    email: string,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    password: string
  ): Observable<void> {
    return from(
      set(ref(this.db, `users/${userId}`), {
        username,
        uuid,
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

  getUserById(userId: string): Observable<User> {
    const observable = from(get(ref(this.db, 'users')));

    var foundUser = new Subject<User>();
    observable.subscribe((data) => {
      const users: User[] = data.val();

      users.forEach((user, index) => {
        user.id = index;
      });
      const user = users.filter((user) => user.uuid === userId)[0];

      foundUser.next(user);
    });

    return foundUser.asObservable();
  }

  updateUser(
    userId: number,
    username: string,
    uuid: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ): Observable<void> {
    return from(
      update(ref(this.db, 'users/' + userId), {
        username,
        uuid,
        email,
        firstName,
        lastName,
        password,
      })
    );
  }

  deleteUser(userId: number): Observable<void> {
    return from(remove(ref(this.db, 'users/' + userId)));
  }

  doStuff() {
    const doc = ref(this.db, 'user');
    console.log(doc);
    objectVal(doc).subscribe((data: any) => console.log(data));
  }
}
