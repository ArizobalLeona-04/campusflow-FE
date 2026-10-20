import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  showPassword = false;

  constructor(private router: Router) {}

  onLogin() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const inputEmail = this.email.trim().toLowerCase();
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    const foundUser = registeredUsers.find((u: any) => 
      u.email.toLowerCase() === inputEmail && u.password === this.password
    );

    if (foundUser) {
      // Fallback role detection if missing from older registrations
      if (!foundUser.role) {
        const isEmailAdmin = inputEmail.endsWith('@admin.com') || inputEmail.endsWith('@admin.liceo.edu.ph');
        foundUser.role = isEmailAdmin ? 'admin' : 'user';
      }

      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      console.log(`Login successful for: ${foundUser.firstName} ${foundUser.lastName} (${foundUser.role})`);

      if (foundUser.role === 'admin') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/booking']);
      }
    } else {
      this.errorMessage = 'Invalid email or password. Please check your credentials or register a new account.';
    }
  }
}