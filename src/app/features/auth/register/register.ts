import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  userData = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  errorMessage = '';
  showPassword = false;

  constructor(private router: Router) {}

  onCreateAccount() {
    this.errorMessage = '';

    const first = this.userData.firstName.trim();
    const last = this.userData.lastName.trim();
    const email = this.userData.email.trim().toLowerCase();
    const pwd = this.userData.password;

    if (!first || !last || !email || !pwd) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (pwd.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    const emailExists = existingUsers.some(
      (u: any) => u.email.toLowerCase() === email
    );

    if (emailExists) {
      this.errorMessage = 'An account with this email already exists!';
      return;
    }

    // Role Mapping Logic:
    // Admin Side: @admin.com or @admin.liceo.edu.ph
    // User Side: @liceo.edu.ph or any standard user domain
    const isAdmin = email.endsWith('@admin.com') || email.endsWith('@admin.liceo.edu.ph');
    const userRole = isAdmin ? 'admin' : 'user';

    const firstInitial = first.charAt(0);
    const lastInitial = last.charAt(0);
    const initials = (firstInitial + lastInitial).toUpperCase();

    const newUser = {
      id: Date.now(),
      firstName: first,
      lastName: last,
      email: email,
      password: pwd,
      role: userRole,
      initials: initials
    };

    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    console.log(`Account created for ${first} ${last} (${userRole})`);

    // Route Admin to Dashboard, Regular User directly to Booking
    if (userRole === 'admin') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/booking']);
    }
  }
}