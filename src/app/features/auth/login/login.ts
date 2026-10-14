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

  showPassword = false;

  constructor(private router: Router) {}

  onLogin() {
    if (!this.email.trim() || !this.password.trim()) {
      alert('Please enter your email and password.');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    const foundUser = registeredUsers.find((u: any) => 
      u.email === this.email && u.password === this.password
    );

    if (foundUser) {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));

      console.log(`Login successful for: ${foundUser.firstName} ${foundUser.lastName}`);

      this.router.navigate(['/booking']);
    } else {
      alert('Invalid email or password. Please check your credentials or register a new account.');
    }
  }
}