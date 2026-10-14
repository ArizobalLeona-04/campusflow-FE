import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: any = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    initials: ''
  };

  maskedPasswordHint: string = '';
  userBackup: any;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;
  
  otpSent: boolean = false;
  isVerified: boolean = false;
  otpInput: string = '';

  passwordData = { current: '', new: '', confirm: '' };
  showPassword = { current: false, new: false, confirm: false };

  private apiUrl = 'http://localhost:3000/api/users';

  constructor(public router: Router, private http: HttpClient) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      console.log("Current User ID:", this.user.id);
      this.generatePasswordHint();
      this.updateInitials();
    } else {
      this.router.navigate(['/login']);
    }
  }

  generatePasswordHint() {
    this.maskedPasswordHint = '********';
  }

  sendOTP() {
    this.otpSent = true;
    alert(`A security OTP code has been sent to ${this.user.email}`);
  }

  verifyOTP() {
    if (this.otpInput === '1234') {
      this.isVerified = true;
      this.isChangingPassword = true;
      alert('Identity Verified Successfully.');
    } else {
      alert('Invalid OTP code. Please try again.');
    }
  }

  updateInitials() {
    const first = this.user.firstName?.trim().charAt(0) || '';
    const last = this.user.lastName?.trim().charAt(0) || '';
    this.user.initials = (first + last).toUpperCase();
  }

  toggleEdit() {
    if (!this.isEditing) {
      this.userBackup = JSON.parse(JSON.stringify(this.user));
      this.isEditing = true;
    }
  }

  saveUserData() {
    this.updateInitials();
    this.http.patch(`${this.apiUrl}/${this.user.id}`, this.user).subscribe({
      next: (updatedUser: any) => {
        this.user = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        this.isEditing = false;
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        this.isEditing = false;
        alert('Profile updated locally!');
      }
    });
  }

  cancelEdit() {
    if (this.userBackup) {
      this.user = JSON.parse(JSON.stringify(this.userBackup));
    }
    this.isEditing = false;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    this.showPassword[field] = !this.showPassword[field];
  }

  updatePassword() {
    if (!this.passwordData.current || !this.passwordData.new || !this.passwordData.confirm) {
      alert('Please fill in all password fields.');
      return;
    }

    if (this.passwordData.current !== this.user.password) {
      alert('Current password is incorrect.');
      return;
    }

    if (this.passwordData.new !== this.passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }

    if (this.passwordData.new.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    const payload = { password: this.passwordData.new };
    
    this.http.patch(`${this.apiUrl}/${this.user.id}/password`, payload).subscribe({
      next: () => {
        this.user.password = this.passwordData.new;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        this.generatePasswordHint();
        alert('Password updated successfully!');
        this.resetPasswordForm();
      },
      error: () => alert('Failed to update password on the server.')
    });
  }

  resetPasswordForm() {
    this.isChangingPassword = false;
    this.otpSent = false;
    this.isVerified = false;
    this.otpInput = '';
    this.passwordData = { current: '', new: '', confirm: '' };
    this.showPassword = { current: false, new: false, confirm: false };
  }

  onSignOut() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}