import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  constructor(private router: Router) {}

  onSignOut(): void {
    console.log('Sign out clicked');
    this.router.navigate(['/login']).then(success => {
      if (success) {
        console.log('Navigation successful!');
      } else {
        console.error('Navigation failed!');
      }
    });
  }
}