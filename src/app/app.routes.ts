import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { BookingComponent } from './features/booking/booking';
import { DepartmentComponent } from './features/department/department';
import { ProfileComponent } from './features/profile/profile';

import { DashboardComponent } from './features/booking/dashboard/dashboard'; 

import { authGuard } from './auth.guard'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  
  { path: 'booking', component: BookingComponent, canActivate: [authGuard] },
  { path: 'department', component: DepartmentComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];