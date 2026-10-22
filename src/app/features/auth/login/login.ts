import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';
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

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const credentials = {
      username: this.email.trim(),
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        localStorage.setItem('currentUser', JSON.stringify(response));

        const userRole = response.role || 'user';
        if (userRole === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/booking']);
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.errorMessage = err.error?.error || 'Invalid email or password. Please check your credentials.';
      }
    });
  }
}