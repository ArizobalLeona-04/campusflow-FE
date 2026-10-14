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
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  onCreateAccount() {
    if (!this.userData.username.trim() || !this.userData.password || !this.userData.email) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const fullName = this.userData.username.trim();
    const nameParts = fullName.split(/\s+/);
    
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const initials = (firstName[0] + (lastName ? lastName[0] : '')).toUpperCase();

    const newUser = {
      firstName: firstName,
      lastName: lastName,
      email: this.userData.email,
      password: this.userData.password,
      initials: initials
    };

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    const emailExists = existingUsers.some((u: any) => u.email === this.userData.email);
    if (emailExists) {
      alert('An account with this email already exists!');
      return;
    }

    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    console.log('Account created for:', firstName, lastName);
    alert('Account created successfully! You can now log in.');

    this.router.navigate(['/login']);
  }
}