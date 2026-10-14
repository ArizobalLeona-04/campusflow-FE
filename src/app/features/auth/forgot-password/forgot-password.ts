import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  step: number = 1;

  constructor(private router: Router) {}

  onVerifyEmail() {
    if (!this.email.trim()) {
      alert('Please enter your email address.');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = allUsers.find((u: any) => u.email === this.email);

    if (userExists) {
      this.step = 2;
    } else {
      alert('This email is not registered with CampusFlow.');
    }
  }

  onResetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.email === this.email);

    if (userIndex !== -1) {
      allUsers[userIndex].password = this.newPassword;
      localStorage.setItem('registeredUsers', JSON.stringify(allUsers));

      alert('Password updated successfully! You can now log in.');
      this.router.navigate(['/login']);
    } else {
      alert('An error occurred. Please try again.');
      this.step = 1;
    }
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}