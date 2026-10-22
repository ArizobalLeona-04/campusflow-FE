import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth'; 

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

  constructor(private router: Router, private authService: AuthService) {}

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

    const isAdmin = email.endsWith('@admin.com') || email.endsWith('@admin.liceo.edu.ph');
    const userRole = isAdmin ? 'admin' : 'user';

    const firstInitial = first.charAt(0);
    const lastInitial = last.charAt(0);
    const initials = (firstInitial + lastInitial).toUpperCase();

    // Generate a unique username automatically
    const generatedUsername = `${first.toLowerCase()}_${last.toLowerCase()}_${Math.floor(Math.random() * 1000)}`;

    const payload = {
      username: generatedUsername,
      email: email,
      password: pwd,
      firstName: first,
      lastName: last,
      role: userRole,
      initials: initials
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('Account registered in MongoDB successfully:', response);
        
        localStorage.setItem('currentUser', JSON.stringify({ ...payload, id: response.userId }));

        // Route Admin to Dashboard, Regular User directly to Booking
        if (userRole === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/booking']);
        }
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.errorMessage = err.error?.error || 'An account with this email already exists!';
      }
    });
  }
}