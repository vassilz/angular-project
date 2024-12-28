import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseUserService } from '../firebase-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../types/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  constructor(
    private userService: FirebaseUserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  user: User | null = null;

  ngOnInit(): void {
    const uuid = this.route.snapshot.params['uuid'];

    console.log(uuid);
    this.userService.getUserById(uuid).subscribe((user) => {
      this.user = user;
    });
  }

  editProfile(form: NgForm) {
    if (form.invalid) {
      console.log('Invalid profile form!');
      return;
    }

    const { firstName, lastName } = form.value;

    this.userService
      .updateUser(
        this.user!.id,
        this.user!.username,
        this.user!.uuid,
        this.user!.email,
        firstName,
        lastName,
        this.user!.password
      )
      .subscribe((data) => {
        console.log('User updated successfully');
        this.router.navigate(['/home']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/home']);
  }
}
