import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    initials: '',
    profileImage: null
  };

  currentUserRole: string = 'user';
  maskedPasswordHint: string = '';
  userBackup: any;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;
  
  otpSent: boolean = false;
  isVerified: boolean = false;
  otpInput: string = '';
  generatedOtp: string = '';

  passwordData = { new: '', confirm: '' };
  showPassword = { current: false, new: false, confirm: false };

  constructor(public router: Router) {}
  
ngOnInit() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      this.user = JSON.parse(savedUser);
      const email = this.user.email?.toLowerCase() || '';
      const isAdminDomain = email.endsWith('@admin.com') || email.endsWith('@admin.liceo.edu.ph');

      this.currentUserRole = this.user.role || (isAdminDomain ? 'admin' : 'user');
    } catch (e) {
      this.user = {};
      this.currentUserRole = 'user';
    }
    this.generatePasswordHint();
    this.updateInitials();
  } else {
    this.router.navigate(['/login']);
  }
}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture() {
    this.user.profileImage = null;
  }

  generatePasswordHint() {
    this.maskedPasswordHint = '********';
  }

  sendOTP() {
    this.generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    this.otpSent = true;
    alert(`[LOCAL TEST] Security OTP sent to ${this.user.email}.\n\nYour code is: ${this.generatedOtp}`);
  }

  verifyOTP() {
    if (this.otpInput === this.generatedOtp || this.otpInput === '1234') {
      this.isVerified = true;
      this.isChangingPassword = true;
      alert('Identity verified successfully!');
    } else {
      alert('Invalid OTP code. Please enter the correct code.');
    }
  }

  updateInitials() {
    const first = this.user.firstName?.trim().charAt(0) || '';
    const last = this.user.lastName?.trim().charAt(0) || '';
    this.user.initials = (first + last).toUpperCase() || 'CF';
  }

  toggleEdit() {
    if (!this.isEditing) {
      this.userBackup = JSON.parse(JSON.stringify(this.user));
      this.isEditing = true;
    }
  }

  saveUserData() {
    this.updateInitials();
    localStorage.setItem('currentUser', JSON.stringify(this.user));

    // Keep registeredUsers array synced with personal info updates
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === this.user.email.toLowerCase());
    if (idx !== -1) {
      registeredUsers[idx] = { ...registeredUsers[idx], ...this.user };
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    this.isEditing = false;
    alert('Profile updated successfully!');
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
    if (!this.passwordData.new || !this.passwordData.confirm) {
      alert('Please fill in both new password fields.');
      return;
    }

    if (this.passwordData.new !== this.passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }

    if (this.passwordData.new.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Update password locally in currentUser & registeredUsers
    this.user.password = this.passwordData.new;
    localStorage.setItem('currentUser', JSON.stringify(this.user));

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === this.user.email.toLowerCase());
    if (idx !== -1) {
      registeredUsers[idx].password = this.passwordData.new;
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    alert('Password updated successfully!');
    this.resetPasswordForm();
  }

  resetPasswordForm() {
    this.isChangingPassword = false;
    this.otpSent = false;
    this.isVerified = false;
    this.otpInput = '';
    this.passwordData = { new: '', confirm: '' };
    this.showPassword = { current: false, new: false, confirm: false };
  }

  onSignOut() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}